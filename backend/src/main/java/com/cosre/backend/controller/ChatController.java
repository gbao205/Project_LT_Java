package com.cosre.backend.controller;

import com.cosre.backend.dto.VideoCallSignal; // Import DTO mới
import com.cosre.backend.entity.ChatMessage;
import com.cosre.backend.repository.ChatMessageRepository;
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

    /**
     * Gửi tin nhắn qua WebSocket
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        chatMessageRepository.save(message);

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
     * Lấy bản đồ tin nhắn chưa đọc: { "nguoi_gui_A": 5, "nguoi_gui_B": 2 }
     */
    @GetMapping("/unread-map")
    public ResponseEntity<Map<String, Long>> getUnreadMap(@RequestParam String email) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findByRecipientAndIsReadFalse(email);

        // Nhóm theo người gửi và đếm số lượng tin nhắn chưa đọc
        Map<String, Long> unreadMap = unreadMessages.stream()
                .collect(Collectors.groupingBy(ChatMessage::getSender, Collectors.counting()));

        return ResponseEntity.ok(unreadMap);
    }

    /**
     * Lấy tổng số tin nhắn chưa đọc (cho Badge ở nút Fab)
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getTotalUnread(@RequestParam String email) {
        return ResponseEntity.ok(chatMessageRepository.countByRecipientAndIsReadFalse(email));
    }

    /**
     * Đánh dấu tin nhắn là đã đọc khi mở khung chat
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
    /**
     * Nhận tín hiệu (OFFER, ANSWER, ICE) từ client A
     * và chuyển tiếp ngay lập tức cho client B qua WebSocket.
     * Không lưu DB.
     */
    @MessageMapping("/video.signal")
    public void signalVideoCall(@Payload VideoCallSignal signal) {
        // [DEBUG] In log chi tiết để kiểm tra lỗi
        System.out.println("========== [DEBUG] VIDEO SIGNAL RECEIVED ==========");

        if (signal == null) {
            System.err.println("!!! [ERROR] Signal payload is NULL");
            return;
        }

        System.out.println(">>> Type: " + signal.getType());
        System.out.println(">>> From (Sender):   " + signal.getSender());
        System.out.println(">>> To   (Recipient): " + signal.getRecipient());

        // Kiểm tra người nhận có hợp lệ không
        if (signal.getRecipient() == null || signal.getRecipient().trim().isEmpty()) {
            System.err.println("!!! [ERROR] Recipient email is NULL or EMPTY. Cannot route signal.");
            return;
        }

        // Tạo destination topic
        String destination = "/topic/private/" + signal.getRecipient();
        System.out.println(">>> Routing to topic: " + destination);

        try {
            // Chuyển tiếp tín hiệu
            messagingTemplate.convertAndSend(destination, signal);
            System.out.println(">>> [SUCCESS] Signal routed successfully.");
        } catch (Exception e) {
            System.err.println("!!! [EXCEPTION] Failed to send signal: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("==================================================");
    }

    // --- API BẢNG TRẮNG (WHITEBOARD) ---
    /**
     * Nhận nét vẽ từ A và gửi sang B
     */
    @MessageMapping("/whiteboard.draw")
    public void drawOnWhiteboard(@Payload com.cosre.backend.dto.DrawAction action) {
        // Chuyển tiếp nét vẽ đến người nhận
        messagingTemplate.convertAndSend("/topic/private/" + action.getRecipient(), action);
    }
}