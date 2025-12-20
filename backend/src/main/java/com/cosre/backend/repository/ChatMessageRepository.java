package com.cosre.backend.repository;

import com.cosre.backend.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // Chỉ giữ lại hàm tìm lịch sử chat riêng giữa 2 người
    @Query("{$or: [ {sender: ?0, recipient: ?1}, {sender: ?1, recipient: ?0} ]}")
    List<ChatMessage> findPrivateHistory(String user1, String user2);
}