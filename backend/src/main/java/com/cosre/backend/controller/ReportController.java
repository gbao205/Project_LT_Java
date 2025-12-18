package com.cosre.backend.controller;

import com.cosre.backend.entity.Report;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.ReportRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    // 1. API Gửi báo cáo
    @PostMapping("/send")
    public ResponseEntity<?> sendReport(@RequestBody Map<String, String> request) {
        try {
            // Lấy email người gửi từ Token
            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            // Tạo đối tượng Report
            Report report = new Report();
            report.setTitle(request.get("title"));
            report.setContent(request.get("content"));
            report.setReporterEmail(email);
            report.setCreatedAt(LocalDateTime.now());
            report.setResolved(false);

            // Lưu vào DB
            reportRepository.save(report);

            // Trả về thành công
            return ResponseEntity.ok(Map.of("message", "Đã gửi báo cáo thành công!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 2. API Đếm số báo cáo chưa xử lý
    @GetMapping("/count-pending")
    public ResponseEntity<Long> countPendingReports() {
        return ResponseEntity.ok(reportRepository.countByIsResolvedFalse());
    }

    // 3. API Lấy tất cả báo cáo
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    // 4. API Đánh dấu đã xử lý
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> markAsResolved(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        report.setResolved(true);
        reportRepository.save(report);
        return ResponseEntity.ok().build();
    }
}