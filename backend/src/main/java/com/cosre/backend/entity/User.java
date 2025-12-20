package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List; // Import List

@Entity
@Table(name = "users")
@Data // Tự động sinh Getter/Setter cho fullName, code, active...
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Column(nullable = false, unique = true)
    private String email;

    // Ẩn password khi trả về JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Map chính xác sang cột full_name trong Database
    @Column(name = "full_name")
    private String fullName;

    // --- BỔ SUNG ĐỂ FIX LỖI "cannot find symbol method getCode()" ---
    @Column(name = "code")
    private String code; // Mã số (SV hoặc GV)

    @Enumerated(EnumType.STRING)
    private Role role;

    // Mặc định là true
    @Builder.Default
    private Boolean active = true;

    // --- BỔ SUNG QUAN HỆ ĐỂ FIX LỖI trong StudentService/TeamService ---
    // Một User có thể tham gia nhiều nhóm (List<TeamMember>)
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    @JsonIgnore // Tránh vòng lặp vô tận khi convert sang JSON
    private List<TeamMember> teamMemberships;
}