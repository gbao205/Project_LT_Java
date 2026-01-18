package com.cosre.backend.repository;

import com.cosre.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipientIdAndIsReadFalse(Long userId);
    
    // Xóa tất cả thông báo của một người dùng
    void deleteByRecipientId(Long userId);

    // Tìm thông báo cũ hơn N ngày để xóa tự động
    List<Notification> findAllByCreatedAtBefore(LocalDateTime dateTime);
}