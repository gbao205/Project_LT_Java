package com.cosre.backend.controller;
import com.cosre.backend.service.AIService;
import com.cosre.backend.entity.AIChatMessage;
import com.cosre.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/ai")
public class AIController {
    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAI(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails // Lấy user từ Token
    ) {
        String question = (String) payload.get("question");
        Long teamId = payload.get("teamId") != null ? Long.valueOf(payload.get("teamId").toString()) : null;

        Long userId = userDetails.getId(); // Lấy ID user đang login

        String response = aiService.getAdvice(userId, teamId, question);
        return ResponseEntity.ok(response);
    }

    // API Lấy lịch sử chat
    @GetMapping("/history")
    public ResponseEntity<List<AIChatMessage>> getChatHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<AIChatMessage> history = aiService.getHistory(userDetails.getId());
        return ResponseEntity.ok(history);
    }

    // API XOÁ LỊCH SỬ
    @DeleteMapping("/history")
    public ResponseEntity<String> clearChatHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        aiService.clearHistory(userDetails.getId());
        return ResponseEntity.ok("Đã xóa lịch sử chat thành công.");
    }

}
