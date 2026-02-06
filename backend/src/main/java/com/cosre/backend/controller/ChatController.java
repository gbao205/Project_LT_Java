package com.cosre.backend.controller;

import com.cosre.backend.dto.GroupMessageDTO;
import com.cosre.backend.dto.VideoCallSignal;
import com.cosre.backend.entity.ChatMessage;
import com.cosre.backend.repository.ChatMessageRepository;
import com.cosre.backend.service.ChatService;
import com.cosre.backend.service.UserService; // Import UserService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService; // [MỚI] Inject UserService

    @Autowired
    private ChatService chatService;

    // --- Helper để cập nhật tương tác cho cả 2 người ---
    private void updateInteraction(String sender, String recipient) {
        // Chạy async hoặc đơn giản gọi thẳng service (vì logic nhẹ)
        try {
            userService.updateLastInteraction(sender);
            userService.updateLastInteraction(recipient);
        } catch (Exception e) {
            System.err.println("Lỗi cập nhật lastInteractionAt: " + e.getMessage());
        }
    }

    /**
     * Gửi tin nhắn qua WebSocket
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        chatMessageRepository.save(message);

        // [MỚI] Cập nhật thời gian tương tác để xếp lại danh bạ
        updateInteraction(message.getSender(), message.getRecipient());

        // Gửi cho người nhận
        messagingTemplate.convertAndSend("/topic/private/" + message.getRecipient(), message);
        // Gửi lại cho người gửi (Echo) để đồng bộ đa thiết bị
        messagingTemplate.convertAndSend("/topic/private/" + message.getSender(), message);
    }

    /**
     * Lấy lịch sử chat 1-1
     */
    @GetMapping("/history/private")
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestParam String me, @RequestParam String other) {
        return ResponseEntity.ok(chatMessageRepository.findPrivateHistory(me, other));
    }

    /**
     * Lấy bản đồ tin nhắn chưa đọc
     */
    @GetMapping("/unread-map")
    public ResponseEntity<Map<String, Long>> getUnreadMap(@RequestParam String email) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findByRecipientAndIsReadFalse(email);
        Map<String, Long> unreadMap = unreadMessages.stream()
                .collect(Collectors.groupingBy(ChatMessage::getSender, Collectors.counting()));
        return ResponseEntity.ok(unreadMap);
    }

    /**
     * Lấy tổng số tin nhắn chưa đọc
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getTotalUnread(@RequestParam String email) {
        return ResponseEntity.ok(chatMessageRepository.countByRecipientAndIsReadFalse(email));
    }

    /**
     * Đánh dấu tin nhắn là đã đọc
     */
    @PostMapping("/mark-read")
    public ResponseEntity<Void> markRead(@RequestParam String me, @RequestParam String other) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findBySenderAndRecipientAndIsReadFalse(other, me);
        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(msg -> msg.setIsRead(true));
            chatMessageRepository.saveAll(unreadMessages);
        }
        return ResponseEntity.ok().build();
    }

    // --- API XỬ LÝ TÍN HIỆU VIDEO CALL (WEBRTC) ---
    @MessageMapping("/video.signal")
    public void signalVideoCall(@Payload VideoCallSignal signal) {
        // [DEBUG]
        System.out.println("========== [DEBUG] VIDEO SIGNAL RECEIVED ==========");
        if (signal == null || signal.getRecipient() == null) return;

        // [MỚI] Cập nhật tương tác khi gọi điện
        updateInteraction(signal.getSender(), signal.getRecipient());

        String destination = "/topic/private/" + signal.getRecipient();
        try {
            messagingTemplate.convertAndSend(destination, signal);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // --- API BẢNG TRẮNG (WHITEBOARD) ---
    @MessageMapping("/whiteboard.draw")
    public void drawOnWhiteboard(@Payload com.cosre.backend.dto.DrawAction action) {
        // [MỚI] Chỉ cập nhật tương tác khi bắt đầu phiên vẽ hoặc có hành động quan trọng
        // Để tránh spam Database mỗi khi vẽ 1 nét, ta có thể check loại action
        // Tuy nhiên để đơn giản và đảm bảo thứ tự, ta cứ cập nhật.
        if ("REQUEST".equals(action.getType()) || "ACCEPT".equals(action.getType())) {
            updateInteraction(action.getSender(), action.getRecipient());
        }

        messagingTemplate.convertAndSend("/topic/private/" + action.getRecipient(), action);
    }

    // --- LẤY LỊCH SỬ CHAT NHÓM ---
    @GetMapping("/history/{teamId}")
    public ResponseEntity<List<GroupMessageDTO>> getChatHistory(@PathVariable Long teamId) {
        return ResponseEntity.ok(chatService.getTeamChatHistory(teamId));
    }

    // --- XÓA TOÀN BỘ CHAT NHÓM ---
    @DeleteMapping("/clear/{teamId}")
    public ResponseEntity<?> clearChat(@PathVariable Long teamId) {
        chatService.deleteAllTeamMessages(teamId);
        // Gửi tín hiệu qua socket để các máy khách xóa màn hình ngay lập tức
        messagingTemplate.convertAndSend("/topic/team_" + teamId + "/clear", "CHAT_CLEARED");
        return ResponseEntity.ok().build();
    }
}