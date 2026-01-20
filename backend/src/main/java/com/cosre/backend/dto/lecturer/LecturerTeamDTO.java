package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.math.BigDecimal; // ✅ Import

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LecturerTeamDTO {
    private Long id;
    private String name;        // Tên nhóm (Backend cũ gọi là name)
    private BigDecimal teamScore;   // Điểm nhóm
    private int maxMembers;

    // Danh sách thành viên trong nhóm
    private List<LecturerStudentDTO> members;
}