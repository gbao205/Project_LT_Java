package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LecturerClassDetailDTO {
    private Long id;              // ID lớp
    private String name;          // Tên lớp
    private String subjectCode;   // Mã môn (PRN211...)
    private String subjectName;   // Tên môn
    private int studentCount;     // Tổng số SV

    // ✅ ĐÂY LÀ CÁI BẠN ĐANG THIẾU
    private List<LecturerTeamDTO> teams; // Danh sách nhóm trong lớp
    private List<LecturerAssignmentDTO> assignments;
}