package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "classes") // Tên bảng là classes (tránh trùng từ khóa class của Java)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // VD: SE1701

    private String semester;

    @Column(unique = true)
    private String classCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    @JsonIgnore
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    @Builder.Default
    private Integer maxCapacity = 60;

    @Builder.Default
    @JsonProperty("isRegistrationOpen")
    private boolean isRegistrationOpen = false;


    // ⬇ PHẦN GIỮ NGUYÊN (CHO ROLE STUDENT/STAFF)

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "class_enrollments",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnore
    @Builder.Default
    private Set<User> students = new HashSet<>();
    

    @OneToMany(mappedBy = "classRoom", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Team> teams;



    public boolean canRegister() {
        return isRegistrationOpen && (students.size() < maxCapacity);

    }

    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<TimeTable> timeTables = new HashSet<>();
}