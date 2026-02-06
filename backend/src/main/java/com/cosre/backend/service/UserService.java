package com.cosre.backend.service;

import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Import thời gian
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // 2. Hàm Cập nhật thông tin
    public User updateUser(Long id, User request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setRole(request.getRole());

        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException("Email mới đã được sử dụng!", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(request.getEmail());
        }

        return userRepository.save(user);
    }

    // 3. Hàm Xóa User
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    // 4. Cập nhật thời gian tương tác cuối cùng
    public void updateLastInteraction(String email) {
        if (email == null) return;
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastInteractionAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    // 5. Lấy danh bạ đã sắp xếp theo thời gian tương tác
    // Hàm này sẽ gọi xuống Repository để lấy danh sách User đã được ORDER BY
    public List<User> getSortedContacts(String myEmail) {
        return userRepository.findAllContactsOrderByInteraction(myEmail);
    }
}