package com.cosre.backend.service;

import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Lấy tất cả user
    public List<User> getUsers(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            return userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword);
        }
        return userRepository.findAll();
    }

    // Khóa hoặc Mở khóa tài khoản
    public User toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));

        boolean currentStatus = Boolean.TRUE.equals(user.getActive());
        user.setActive(!currentStatus);

        return userRepository.save(user);
    }
}