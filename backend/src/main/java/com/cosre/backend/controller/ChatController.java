package com.cosre.backend.controller;

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
import java.util.Map; // <--- THÊM DÒNG NÀY
import java.util.stream.Collectors; // <--- THÊM DÒNG NÀY

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
        message.setIsRead(false); // Lombok tạo setIsRead cho kiểu Boolean

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
}