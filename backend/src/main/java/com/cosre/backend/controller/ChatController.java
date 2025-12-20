package com.cosre.backend.controller;

import com.cosre.backend.entity.ChatMessage;
import com.cosre.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // BẮT BUỘC PHẢI CÓ
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Fix lỗi chặn kết nối từ Frontend
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, String> payload) {
        ChatMessage message = new ChatMessage();
        message.setSender(payload.get("sender"));

        message.setRecipient(payload.get("recipient"));

        message.setContent(payload.get("content"));
        message.setType("CHAT");
        message.setTimestamp(LocalDateTime.now());

        chatMessageRepository.save(message);

        // Gửi đến kênh của người nhận
        messagingTemplate.convertAndSend("/topic/private/" + message.getRecipient(), message);
    }

    @GetMapping("/history/private")
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestParam String me, @RequestParam String other) {
        List<ChatMessage> history = chatMessageRepository.findPrivateHistory(me, other);
        return ResponseEntity.ok(history);
    }
}