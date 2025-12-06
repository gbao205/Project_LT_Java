package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subjectCode; // Mã môn (VD: SWP391)
    private String name;        // Tên môn

    @Column(columnDefinition = "TEXT")
    private String description;
}