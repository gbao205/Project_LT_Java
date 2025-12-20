package com.cosre.backend.service;

import com.cosre.backend.entity.*;
import com.cosre.backend.repository.EvaluationRepository;
import com.cosre.backend.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final EvaluationRepository evaluationRepository;
    private final TeamMemberRepository teamMemberRepository;

    // Cấu hình trọng số
    private static final BigDecimal TEAM_WEIGHT = new BigDecimal("0.6"); // 60%
    private static final BigDecimal PEER_WEIGHT = new BigDecimal("0.4"); // 40%

    /**
     * Tính toán điểm tổng kết (Preview)
     * Hàm này chỉ tính toán, KHÔNG lưu vào DB.
     */
    public BigDecimal calculateStudentFinalScore(Long studentId, Long teamId) {
        // 1. Lấy điểm trung bình Milestone của Team (Nhận Double từ Repository)
        Double teamAvg = evaluationRepository.findAverageScoreByTeamIdAndType(
                teamId, EvaluationType.TEAM_MILESTONE
        );
        // Convert Double -> BigDecimal (Dùng valueOf để tránh lỗi chính xác số thực)
        BigDecimal teamScore = (teamAvg != null) ? BigDecimal.valueOf(teamAvg) : BigDecimal.ZERO;

        // 2. Lấy điểm đánh giá chéo trung bình (Peer Review)
        Double peerAvg = evaluationRepository.findAverageScoreByStudentAndTeamAndType(
                studentId, teamId, EvaluationType.PEER_REVIEW
        );
        BigDecimal peerScore = (peerAvg != null) ? BigDecimal.valueOf(peerAvg) : BigDecimal.ZERO;

        // 3. Công thức: Nếu không có điểm Peer (VD nhóm 1 người hoặc chưa chấm), lấy 100% điểm Team
        if (peerScore.compareTo(BigDecimal.ZERO) == 0) {
            return teamScore.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal weightedTeam = teamScore.multiply(TEAM_WEIGHT);
        BigDecimal weightedPeer = peerScore.multiply(PEER_WEIGHT);

        return weightedTeam.add(weightedPeer).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * CHỨC NĂNG MỚI: Chốt sổ điểm (Finalize)
     * Tính toán và lưu điểm vào bảng TeamMember.
     * Dùng @Transactional để đảm bảo an toàn dữ liệu.
     */
    @Transactional
    public BigDecimal finalizeAndSaveScore(Long studentId, Long teamId) {
        // 1. Tính điểm
        BigDecimal finalScore = calculateStudentFinalScore(studentId, teamId);

        // 2. Tìm thành viên trong nhóm
        // SỬA LỖI: Gọi đúng tên hàm findByStudent_IdAndTeam_Id (khớp với TeamMemberRepository)
        TeamMember member = teamMemberRepository.findByStudent_IdAndTeam_Id(studentId, teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên ID " + studentId + " trong nhóm " + teamId));

        // 3. Lưu điểm "cứng" vào DB
        member.setFinalGrade(finalScore);
        teamMemberRepository.save(member);

        return finalScore;
    }

    /**
     * Lấy điểm đã chốt (Dùng cho Student Dashboard)
     */
    public BigDecimal getFinalizedScore(Long studentId, Long teamId) {
        // SỬA LỖI: Gọi đúng tên hàm findByStudent_IdAndTeam_Id
        TeamMember member = teamMemberRepository.findByStudent_IdAndTeam_Id(studentId, teamId)
                .orElse(null);
        return (member != null) ? member.getFinalGrade() : null;
    }

    /**
     * Phân tích độ lệch đóng góp (Contribution Analysis)
     * So sánh điểm Peer Review của cá nhân với mức trung bình Peer Review của cả nhóm.
     */
    public String analyzeContributionStatus(Long studentId, Long teamId) {
        // Điểm Peer của cá nhân (Nhận Double -> Convert)
        Double studentPeerAvg = evaluationRepository.findAverageScoreByStudentAndTeamAndType(
                studentId, teamId, EvaluationType.PEER_REVIEW
        );

        if (studentPeerAvg == null) return "CHƯA CÓ DỮ LIỆU";
        BigDecimal studentPeerScore = BigDecimal.valueOf(studentPeerAvg);

        // Điểm Peer trung bình của TOÀN BỘ nhóm (Logic query mới)
        Double teamPeerAvg = evaluationRepository.findAverageScoreByTeamIdAndType(
                teamId, EvaluationType.PEER_REVIEW
        );

        if (teamPeerAvg == null || teamPeerAvg == 0) {
            return "CHƯA ĐỦ DỮ LIỆU NHÓM";
        }
        BigDecimal teamAvgPeerScore = BigDecimal.valueOf(teamPeerAvg);

        // Tính độ lệch: Cá nhân - Trung bình nhóm
        BigDecimal difference = studentPeerScore.subtract(teamAvgPeerScore);

        // Ngưỡng cảnh báo (Threshold)
        BigDecimal warningThreshold = new BigDecimal("-1.5"); // Thấp hơn 1.5 điểm
        BigDecimal excellentThreshold = new BigDecimal("1.0"); // Cao hơn 1.0 điểm

        if (difference.compareTo(warningThreshold) < 0) {
            return "CẢNH BÁO: Đóng góp thấp hơn mức trung bình nhóm (" + difference.setScale(2, RoundingMode.HALF_UP) + ")";
        } else if (difference.compareTo(excellentThreshold) > 0) {
            return "XUẤT SẮC: Đóng góp vượt trội (" + difference.setScale(2, RoundingMode.HALF_UP) + ")";
        }

        return "BÌNH THƯỜNG: Đóng góp ổn định";
    }
}