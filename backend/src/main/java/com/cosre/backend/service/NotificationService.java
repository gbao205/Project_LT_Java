package com.cosre.backend.service;

import com.cosre.backend.entity.Notification;
import com.cosre.backend.entity.NotificationType;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Tạo thông báo mới, lưu vào DB và gửi real-time qua WebSocket.
     */
    @Transactional
    public void createAndSend(User recipient, String title, String message, NotificationType type, String redirectUrl) {
        // 1. Khởi tạo đối tượng Notification bằng Builder (đã sửa lỗi @Builder.Default trước đó)
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .redirectUrl(redirectUrl)
                .build();

        // 2. Lưu vào Database
        Notification savedNotification = notificationRepository.save(notification);

        // 3. Gửi Real-time qua WebSocket
        // Destination khớp với cấu hình "/topic" trong WebSocketConfig.java
        String destination = "/topic/notifications/" + recipient.getId();
        messagingTemplate.convertAndSend(destination, savedNotification);
    }

    /**
     * Lấy danh sách thông báo của một người dùng (mới nhất lên đầu).
     */
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã đọc.
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc.
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void clearAllNotifications(Long userId) {
        notificationRepository.deleteByRecipientId(userId);
    }

    @Scheduled(cron = "0 0 0 * * ?") 
    @Transactional
    public void autoCleanupOldNotifications() {
        LocalDateTime limitDate = LocalDateTime.now().minusDays(30);
        List<Notification> oldNotifications = notificationRepository.findAllByCreatedAtBefore(limitDate);
        notificationRepository.deleteAll(oldNotifications);
    }
}