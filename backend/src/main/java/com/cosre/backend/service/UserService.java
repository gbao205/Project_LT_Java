package com.cosre.backend.service;

import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Mã hóa mật khẩu

    public List<User> getAllUsers(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            return userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword);
        }
        return userRepository.findAll();
    }

    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        user.setActive(!user.getActive());
        userRepository.save(user);
    }

    // 1. Hàm Reset Mật khẩu
    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // 2. Hàm Cập nhật thông tin
    public User updateUser(Long id, User request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        // Không cho phép sửa Email vì liên quan đến định danh

        return userRepository.save(user);
    }

    // 3. Thêm hàm Xóa User (Hard Delete)
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
    }
}