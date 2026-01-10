package com.cosre.backend.repository;

import com.cosre.backend.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // 1. Tìm lịch sử chat riêng giữa 2 người (tìm cả 2 chiều)
    @Query("{$or: [ {sender: ?0, recipient: ?1}, {sender: ?1, recipient: ?0} ]}")
    List<ChatMessage> findPrivateHistory(String user1, String user2);

    // 2. Tìm lịch sử chat của nhóm/lớp
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);

    // 3. Đếm số tin nhắn chưa đọc của người nhận (để hiện Badge tổng)
    long countByRecipientAndIsReadFalse(String recipient);

    // 4. Lấy danh sách tin nhắn chưa đọc từ 1 người cụ thể gửi cho mình
    List<ChatMessage> findBySenderAndRecipientAndIsReadFalse(String sender, String recipient);
    List<ChatMessage> findByRecipientAndIsReadFalse(String recipient);
}