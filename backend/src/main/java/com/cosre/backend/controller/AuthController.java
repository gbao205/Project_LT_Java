package com.cosre.backend.controller;

import com.cosre.backend.entity.User;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.cosre.backend.exception.AppException;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // API Đăng ký nhanh (để tạo user test)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException("Email đã được sử dụng!", HttpStatus.BAD_REQUEST);
        }
        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("\n" +
                "Người dùng đã đăng ký thành công!");
    }

    // API Đăng nhập đơn giản
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Tìm user trong DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("\n" +
                        "Lỗi: Không tìm thấy người dùng."));

        // Kiểm tra mật khẩu
        if (passwordEncoder.matches(password, user.getPassword())) {
            // Nếu đúng -> Sinh Token
            String token = jwtUtils.generateJwtToken(email);

            // Trả về Token cho Client
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("email", email);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Lỗi: Mật khẩu sai!");
        }
    }
}