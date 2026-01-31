package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.AssignImportDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Component("assignStudent")
public class ImportAssign extends BaseImportParser<AssignImportDTO> {
    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    protected Class<AssignImportDTO> getDtoClass() { return AssignImportDTO.class; }

    @Override
    protected void validate(List<AssignImportDTO> data, Object... params) {
        if (params.length == 0 || params[0] == null) {
            throw new AppException("Thiếu mã lớp học!", HttpStatus.BAD_REQUEST);
        }

        String classCode = params[0].toString();
        ClassRoom classroom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new AppException("Lớp " + classCode + " không tồn tại", HttpStatus.NOT_FOUND));

        Set<String> currentIds = classRoomRepository.findStudentIdsByClassCode(classCode);

        Set<String> fileIds = new HashSet<>();
        List<String> duplicateInFile = new ArrayList<>();
        List<String> alreadyInClass = new ArrayList<>();
        Set<String> allFileIds = data.stream()
                .map(AssignImportDTO::getStudentId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
        List<Student> existingStudents = studentRepository.findAllByStudentIdIn(allFileIds);
        if (existingStudents.size() < allFileIds.size()) {
            Set<String> dbIds = existingStudents.stream()
                    .map(Student::getStudentId).collect(Collectors.toSet());
            List<String> invalidIds = allFileIds.stream()
                    .filter(id -> !dbIds.contains(id)).toList();
            throw new AppException("Các mã sinh viên không tồn tại: " + invalidIds, HttpStatus.BAD_REQUEST);
        }
        for (AssignImportDTO dto : data) {
            String sId = dto.getStudentId();
            if (sId == null || sId.isBlank()) continue;

            if (!fileIds.add(sId)) {
                duplicateInFile.add(sId);
            }

            if (currentIds.contains(sId)) {
                alreadyInClass.add(sId);
            }
        }

        if (!duplicateInFile.isEmpty()) {
            throw new AppException("Trùng mã ngay trong file: " + duplicateInFile, HttpStatus.BAD_REQUEST);
        }
        if (!alreadyInClass.isEmpty()) {
            throw new AppException("Sinh viên đã có tên trong lớp này: " + alreadyInClass, HttpStatus.BAD_REQUEST);
        }

        if (currentIds.size() + fileIds.size() > classroom.getMaxCapacity()) {
            throw new AppException("Lớp đầy! Hiện có " + currentIds.size() + "/" + classroom.getMaxCapacity()
                    + ". Không thể thêm " + data.size() + " SV.", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<AssignImportDTO> data, Object... params) {
        String classCode = params[0].toString();
        ClassRoom classroom = classRoomRepository.findByClassCode(classCode).get();

        Set<String> fileIds = data.stream()
                .map(AssignImportDTO::getStudentId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());

        List<Student> studentsToAdd = studentRepository.findAllByStudentIdIn(fileIds);

        for (Student s : studentsToAdd) {
            User user = s.getUser();
            if (!classroom.getStudents().contains(user)) {
                classroom.getStudents().add(user);
            }
        }
        classRoomRepository.save(classroom);
    }
}
