package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "syllabus")
@Data
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String objectives;
    private String outline;
    private Integer year;

    @OneToOne(optional = false)
    @JoinColumn(name = "subject_id", unique = true)
    private Subject subject;
}