package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.time.LocalDateTime; // Đã thêm import này

@Entity
@Table(name = "users")
@Data // Tự động sinh Getter/Setter (bao gồm getLastInteractionAt, setLastInteractionAt)
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
    @Column(nullable = false, unique = true)
    private String email;

    // Ẩn password khi trả về JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "code")
    private String code;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder.Default
    private Boolean active = true;

    // Dùng để sắp xếp danh bạ: Người mới nhắn/gọi sẽ lên đầu
    private LocalDateTime lastInteractionAt;

    // --- Quan hệ với TeamMember ---
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TeamMember> teamMemberships;
}