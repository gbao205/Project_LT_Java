package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "checkpoints")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Checkpoint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung hoặc yêu cầu của checkpoint
    
    @Builder.Default
    private boolean isDone = false;
    
    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    @JsonIgnore
    private Team team;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    @JsonIgnore
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    @JsonIgnore
    private User createdBy;
}