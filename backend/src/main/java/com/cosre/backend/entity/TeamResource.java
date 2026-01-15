package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "team_resources")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class TeamResource {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;      // Tên hiển thị của file
    private String fileUrl;    // Đường dẫn để tải file (URL)
    private String fileType;   // Ví dụ: application/pdf, image/png
    private LocalDateTime uploadDate;

    @ManyToOne
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_id")
    @JsonIgnore
    private User uploadedBy;
    private Long fileSize; // Lưu dung lượng tính bằng byte
}