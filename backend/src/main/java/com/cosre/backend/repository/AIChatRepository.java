package com.cosre.backend.repository;

import com.cosre.backend.entity.AIChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface AIChatRepository extends JpaRepository<AIChatMessage, Long> {

    // Lấy tin nhắn của user cụ thể, sắp xếp theo thời gian
    List<AIChatMessage> findByUserIdOrderByTimestampAsc(Long userId);

    // xóa tất cả tin nhắn của 1 user
    void deleteByUserId(Long userId);

    List<AIChatMessage> findTop3ByUserIdOrderByTimestampDesc(Long userId);
}
