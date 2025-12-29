package com.cosre.backend.controller;

import com.cosre.backend.entity.User;
import com.cosre.backend.entity.Role;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

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

    // 1. API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException("Email đã được sử dụng!", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }
        user.setActive(true);
        userRepository.save(user);

        return ResponseEntity.ok(new HashMap<>(Map.of("message", "Người dùng đã đăng ký thành công!")));
    }

    // 2. API Đăng nhập (Đã tích hợp Logic Bảo trì)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // B1: Tìm user trong DB trước
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Lỗi: Không tìm thấy người dùng với email này.", HttpStatus.NOT_FOUND));


        // B2: Kiểm tra xem tài khoản có bị khóa không (active = false)
        if (Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin."));
        }

        // B3: Kiểm tra mật khẩu
        if (passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtils.generateJwtToken(email);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("id", String.valueOf(user.getId()));
            response.put("email", email);
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Lỗi: Mật khẩu sai!"));
        }
    }

    // 3. API Lấy thông tin người dùng (/me)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Bạn chưa đăng nhập!"));
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");

        return ResponseEntity.ok(profile);
    }

    // 4. API Đổi mật khẩu
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Mật khẩu hiện tại không đúng!"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }
}