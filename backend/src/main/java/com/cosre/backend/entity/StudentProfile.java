package com.cosre.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.time.LocalDate;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    // --- THÔNG TIN CÁ NHÂN ---
    private String gender;           // Giới tính
    private String nativePlace;      // Nguyên quán
    private String ethnicity;        // Dân tộc
    private String religion;         // Tôn giáo
    private String nationality;      // Quốc tịch
    private LocalDate unionDate;     // Ngày vào Đoàn
    private LocalDate partyDate;     // Ngày vào Đảng
    private String phoneNumber;      // Số điện thoại
    private String idCardNumber;     // Số CCCD
    private LocalDate idCardIssueDate;  // Ngày cấp CCCD
    private LocalDate idCardExpiryDate; // Ngày hết hạn CCCD
    private String idCardIssuePlace;    // Nơi cấp
    private String insuranceCode;       // Mã BHXH/BHYT
    private String placeOfBirth;        // Nơi sinh
    private String homeTown;            // Quê quán
    private String permanentAddress;    // Địa chỉ thường trú
    private String temporaryAddress;    // Địa chỉ tạm trú
}