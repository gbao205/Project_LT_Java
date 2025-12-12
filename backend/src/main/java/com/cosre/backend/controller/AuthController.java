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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;

import com.cosre.backend.entity.Role;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // 2. API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException("Email đã được sử dụng!", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        //Gán quyền mặc định là STUDENT nếu người dùng không gửi role lên
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }
        userRepository.save(user);

        return ResponseEntity.ok(new HashMap<>(Map.of("message", "Người dùng đã đăng ký thành công!")));
    }

    // 3. API Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng với email này."));

        if (passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtils.generateJwtToken(email);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("email", email);
            response.put("fullName", user.getFullName());
            //Trả về role
            response.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Lỗi: Mật khẩu sai!"));
        }
    }

    // 4. API Lấy thông tin người dùng (/me)
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
        profile.put("role", "USER");

        return ResponseEntity.ok(profile);
    }
}