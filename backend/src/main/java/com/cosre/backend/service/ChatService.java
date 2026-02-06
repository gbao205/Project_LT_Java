package com.cosre.backend.service;

import com.cosre.backend.dto.GroupMessageDTO;
import com.cosre.backend.entity.GroupMessage;
import com.cosre.backend.entity.User;
import com.cosre.backend.entity.Team;
import com.cosre.backend.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @Transactional(readOnly = true)
    public List<GroupMessageDTO> getTeamChatHistory(Long teamId) {
        // Lấy 50 tin nhắn mới nhất (DESC)
        List<GroupMessage> messages = groupMessageRepository.findRecentMessages(
                teamId, PageRequest.of(0, 50));
        
        // Tạo bản sao để đảo ngược (tránh lỗi nếu list trả về là Immutable)
        List<GroupMessage> sortedMessages = new ArrayList<>(messages);
        Collections.reverse(sortedMessages);

        return sortedMessages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupMessage saveMessage(Team team, User sender, String content) {
        GroupMessage message = new GroupMessage();
        message.setTeam(team);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        return groupMessageRepository.save(message);
    }

    private GroupMessageDTO convertToDTO(GroupMessage message) {
        return GroupMessageDTO.builder()
                .username(message.getSender().getFullName()) 
                .content(message.getContent())
                .time(message.getTimestamp())
                .build();
    }

    @Transactional
    public void deleteAllTeamMessages(Long teamId) {
        groupMessageRepository.deleteAllByTeamId(teamId);
    }
}