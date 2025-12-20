package com.cosre.backend.repository;

import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. Tìm user theo Email (Thay vì Username)
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // 2. Hàm tìm kiếm User (Cho chức năng quản lý)
    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // 3. Đếm user active
    long countByActiveTrue();

    // 4. Lọc danh sách user theo Role (Cho chức năng CHAT)
    List<User> findByRoleIn(List<Role> roles);
}