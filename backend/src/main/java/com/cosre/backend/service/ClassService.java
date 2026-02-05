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

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

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
                .classCode(request.getClassCode())
                .name(request.getName())
                .semester(request.getSemester())
                .subject(subject)
                .lecturer(lecturer)
                .startDate(request.getStartDate()) // Sẽ nhận null nếu Staff không nhập
                .endDate(request.getEndDate())     // Sẽ nhận null nếu Staff không nhập
                .build();

        return classRoomRepository.save(newClass);
    }

    // 1. Lấy danh sách lớp kèm trạng thái đăng ký của sinh viên đang login
    public List<Map<String, Object>> getClassesForRegistration(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<ClassRoom> allClass = classRoomRepository.findAllActiveRegistrationClasses();

        List<Long> registeredClassIds = allClass.stream()
            .filter(c -> c.getStudents().contains(student))
            .map(ClassRoom::getId)
            .collect(Collectors.toList());

        return allClass.stream().map(clazz -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", clazz.getId());
            map.put("name", clazz.getName());
            map.put("classCode", clazz.getClassCode());
            map.put("semester", clazz.getSemester());
            map.put("startDate", clazz.getStartDate());
            map.put("endDate", clazz.getEndDate());
            map.put("subject", clazz.getSubject());
            map.put("lecturer", clazz.getLecturer());
            map.put("maxCapacity", clazz.getMaxCapacity());
            map.put("currentEnrollment", clazz.getStudents().size());
            map.put("timeTables", clazz.getTimeTables());
            map.put("isRegistrationOpen", clazz.isRegistrationOpen());
            // Kiểm tra sinh viên này đã có trong danh sách chưa
            map.put("isRegistered", registeredClassIds.contains(clazz.getId()));
            return map;
        }).collect(Collectors.toList());
    }

    // 2. Xử lý Đăng ký lớp
    public void registerClass(Long classId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new AppException("Sinh viên không tồn tại", HttpStatus.NOT_FOUND));

        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp học không tồn tại", HttpStatus.NOT_FOUND));

        if (classRoom.getStudents().contains(student)) {
            throw new AppException("Bạn đã đăng ký lớp này rồi!", HttpStatus.BAD_REQUEST);
        }

        if (classRoom.getStudents().size() >= classRoom.getMaxCapacity()) {
            throw new AppException("Lớp đã đầy!", HttpStatus.BAD_REQUEST);
        }

        classRoom.getStudents().add(student);
        classRoomRepository.save(classRoom);
    }
    // 3. Xử lý Hủy đăng ký
    public void cancelRegistration(Long classId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new AppException("Sinh viên không tồn tại", HttpStatus.NOT_FOUND));

        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp học không tồn tại", HttpStatus.NOT_FOUND));

        if (!classRoom.getStudents().contains(student)) {
            throw new AppException("Bạn chưa đăng ký lớp này!", HttpStatus.BAD_REQUEST);
        }

        classRoom.getStudents().remove(student);
        classRoomRepository.save(classRoom);
    }

    // 4. Lấy danh sách lớp của sinh viên đang đăng nhập
    public List<ClassRoom> getMyClasses(String studentEmail) {
        return classRoomRepository.findActiveClassesByStudentEmail(studentEmail);
    }
}