package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity // Đánh dấu đây là một bảng trong DB
@Table(name = "users") // Tên bảng trong SQL
@Data // Lombok tự sinh Getter/Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    private String password;
    private String fullName;
    @Enumerated(EnumType.STRING)
    private Role role;
}