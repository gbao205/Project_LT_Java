package com.cosre.backend.controller;

import com.cosre.backend.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Để phân quyền
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoringService scoringService;

    // --- API CHO GIẢNG VIÊN (LECTURER) ---

    /**
     * 1. API Xem trước điểm (Preview)
     * Giảng viên xem điểm dự kiến của sinh viên trước khi chốt.
     * Tính toán realtime nhưng KHÔNG lưu vào DB.
     */
    @GetMapping("/preview/{teamId}/{studentId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<?> previewScore(@PathVariable Long teamId, @PathVariable Long studentId) {
        BigDecimal score = scoringService.calculateStudentFinalScore(studentId, teamId);
        return ResponseEntity.ok(Map.of(
                "studentId", studentId,
                "previewScore", score,
                "message", "Đây là điểm dự kiến, chưa được lưu."
        ));
    }

    /**
     * 2. API Chốt sổ (Finalize)
     * Giảng viên bấm nút "Finalize Grade".
     * Hệ thống tính toán và LƯU điểm vào bảng TeamMember.
     */
    @PostMapping("/finalize/{teamId}/{studentId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<?> finalizeScore(@PathVariable Long teamId, @PathVariable Long studentId) {
        BigDecimal finalScore = scoringService.finalizeAndSaveScore(studentId, teamId);
        return ResponseEntity.ok(Map.of(
                "studentId", studentId,
                "finalScore", finalScore,
                "status", "FINALIZED"
        ));
    }

    // --- API CHO SINH VIÊN (STUDENT) ---

    /**
     * 3. API Xem điểm trên Dashboard
     * Sinh viên vào xem điểm của mình.
     * Chỉ hiện điểm nếu GV đã chốt (finalGrade trong DB khác null).
     */
    @GetMapping("/my-score/{teamId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER')")
    public ResponseEntity<?> getMyScore(@PathVariable Long teamId,
                                        @RequestParam Long studentId) { // Hoặc lấy ID từ Token
        BigDecimal score = scoringService.getFinalizedScore(studentId, teamId);

        if (score == null) {
            return ResponseEntity.ok(Map.of("message", "Điểm chưa được công bố."));
        }

        return ResponseEntity.ok(Map.of("finalScore", score));
    }
}