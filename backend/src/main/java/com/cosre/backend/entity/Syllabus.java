package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "syllabus")
@Data 
@ToString(exclude = "subject")
@EqualsAndHashCode(exclude = "subject")
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
    @JsonIgnore
    private Subject subject;
}