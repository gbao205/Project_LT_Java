package com.cosre.backend.controller;

import com.cosre.backend.entity.Notification;
import com.cosre.backend.service.NotificationService;
import com.cosre.backend.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Lấy tất cả thông báo của người dùng hiện tại
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userDetails.getId()));
    }

    // Đánh dấu một thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAll(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.clearAllNotifications(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}