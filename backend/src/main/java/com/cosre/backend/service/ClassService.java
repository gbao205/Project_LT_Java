package com.cosre.backend.service;

import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    // 1. Lấy danh sách lớp
    public List<ClassRoom> getAllClasses() {
        return classRoomRepository.findAll();
    }

    // 2. Tạo lớp học mới
    public ClassRoom createClass(ClassRequest request) {
        // Kiểm tra tên lớp trùng
        if (classRoomRepository.existsByName(request.getName())) {
            throw new AppException("Tên lớp đã tồn tại!", HttpStatus.BAD_REQUEST);
        }

        // Tìm môn học
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new AppException("Môn học không tồn tại", HttpStatus.NOT_FOUND));

        // Tìm giảng viên (phải có role LECTURER)
        User lecturer = userRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new AppException("Giảng viên không tồn tại", HttpStatus.NOT_FOUND));

        if (lecturer.getRole() != Role.LECTURER) {
            throw new AppException("User này không phải là Giảng viên!", HttpStatus.BAD_REQUEST);
        }

        // Tạo Entity lớp học
        ClassRoom newClass = ClassRoom.builder()
                .name(request.getName())
                .semester(request.getSemester())
                .subject(subject)
                .lecturer(lecturer)
                .build();

        return classRoomRepository.save(newClass);
    }
}