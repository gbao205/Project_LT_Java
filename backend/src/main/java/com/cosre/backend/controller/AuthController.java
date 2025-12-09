package com.cosre.backend.controller;

import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor // Lombok sẽ tự tạo Constructor cho các biến final bên dưới
@CrossOrigin(origins = "*") // Cho phép FE gọi API thoải mái
public class AuthController {

    // 1. Khai báo các Dependency
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // 2. API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            // Ném lỗi để GlobalExceptionHandler xử lý trả về 400
            throw new AppException("Email đã được sử dụng!", HttpStatus.BAD_REQUEST);
        }

        // Mã hóa mật khẩu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new HashMap<>(Map.of("message", "Người dùng đã đăng ký thành công!")));
    }

    // 3. API Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Tìm user trong DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng với email này."));

        // Kiểm tra mật khẩu (Raw pass vs Encoded pass)
        if (passwordEncoder.matches(password, user.getPassword())) {
            // Nếu đúng -> Sinh Token
            String token = jwtUtils.generateJwtToken(email);

            // Trả về Token kèm thông tin user
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("email", email);
            response.put("username", user.getFullName()); // Trả thêm username cho FE hiển thị

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Lỗi: Mật khẩu sai!"));
        }
    }
}