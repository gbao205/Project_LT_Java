package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Column(unique = true)
    private String email;

    // Ẩn password khi trả về
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Thêm trường Active
    @Builder.Default
    private Boolean active = true;
}