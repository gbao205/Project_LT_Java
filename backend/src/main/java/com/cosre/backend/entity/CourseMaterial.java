package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String fileUrl; // Link tải file (S3/Cloudinary/Local)

    @Builder.Default
    private LocalDateTime uploadDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassRoom classRoom;
}