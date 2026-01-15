package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;


@Entity
@Table(name = "users")
@Data // Tự động sinh Getter/Setter (bao gồm getCode, setCode, etc.)
@ToString(exclude = "teamMemberships")
@EqualsAndHashCode(exclude = "teamMemberships")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Column(nullable = false, unique = true) // Kết hợp: không được null và phải duy nhất
    private String email;

    // Ẩn password khi trả về JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Map chính xác sang cột full_name trong Database
    @Column(name = "full_name")
    private String fullName;

    // Mã số (SV hoặc GV) - Quan trọng để fix lỗi "cannot find symbol method getCode()"
    @Column(name = "code")
    private String code; 

    @Enumerated(EnumType.STRING)
    private Role role;

    // Trạng thái hoạt động, mặc định là true
    @Builder.Default
    private Boolean active = true;

    // --- Quan hệ với TeamMember ---
    // Một User (vai trò sinh viên) có thể tham gia nhiều nhóm (List<TeamMember>)
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    @JsonIgnore // Tránh vòng lặp vô tận khi convert sang JSON
    private List<TeamMember> teamMemberships;
}