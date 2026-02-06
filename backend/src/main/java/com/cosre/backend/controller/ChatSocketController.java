package com.cosre.backend.controller;

import com.cosre.backend.dto.GroupMessageDTO;
import com.cosre.backend.entity.Team;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.TeamRepository;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ChatSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/send_message")
    public void processMessage(@Payload Map<String, Object> payload) {
        Long teamId = Long.valueOf(payload.get("teamId").toString());
        String content = (String) payload.get("content");
        String email = (String) payload.get("senderName");

        Team team = teamRepository.findById(teamId).orElse(null);
        
        User sender = userRepository.findByEmail(email).orElse(null);

        if (team != null && sender != null) {
            chatService.saveMessage(team, sender, content);

            GroupMessageDTO response = GroupMessageDTO.builder()
                    .username(sender.getFullName())
                    .content(content)
                    .time(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/team_" + teamId, response);
        }
    }
}