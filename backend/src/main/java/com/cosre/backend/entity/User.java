package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String email;
    private String password;
    private String fullName;
}