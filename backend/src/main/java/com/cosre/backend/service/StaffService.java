package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.staff.SubjectDTO;
import com.cosre.backend.dto.staff.SyllabusDetailDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class StaffService implements IStaffService {
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;

    public List<User> getAllUser(String keyword) {
        List<Role> allowrole = Arrays.asList(Role.LECTURER, Role.STUDENT);
        List<User> allUsers = userRepository.findAll();
        List<User> fillterUser = allUsers.stream()
                .filter(user -> allowrole.contains(user.getRole()))
                .filter(user -> {
                    if (keyword == null || keyword.isEmpty()) {
                        return true;
                    }
                    String lower = keyword.toLowerCase();
                    return user.getFullName().toLowerCase().contains(lower) ||
                            user.getEmail().toLowerCase().contains(lower);
                })
                .collect(Collectors.toList());
        return fillterUser;
    }

    @Override
    public List<ClassResponseDTO> getAllUserForStaff() {
        return List.of();
    }

    @Transactional
    public ClassResponseDTO toggleClass(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        classRoom.setRegistrationOpen(!classRoom.isRegistrationOpen());
        classRoomRepository.save(classRoom);

        return ClassResponseDTO.builder()
                .id(classRoom.getId())
                .name(classRoom.getName())
                .classCode(classRoom.getClassCode())
                .semester(classRoom.getSemester())
                .subjectName(classRoom.getSubject() != null ? classRoom.getSubject().getName() : "N/A")
                .lecturerName(classRoom.getLecturer() != null ? classRoom.getLecturer().getFullName() : "Chưa phân công")
                .isRegistrationOpen(classRoom.isRegistrationOpen())
                .maxCapacity(classRoom.getMaxCapacity())
                .studentCount(classRoom.getStudents() != null ? classRoom.getStudents().size() : 0)
                .build();
    }

    //===================================Syllabus================================================
    @Override
    public Page<SyllabusListDTO> getSyllabusList(int page,
                                                 int size,
                                                 Long id,
                                                 String subjectName,
                                                 Integer year) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Syllabus> pageResult =
                syllabusRepository.filter(id, subjectName, year, pageable);
        return pageResult.map(s -> SyllabusListDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject() != null ? s.getSubject().getName() : "N/A")
                .year(s.getYear())
                .build()
        );
    }

    @Override
    public SyllabusDetailDTO getSyllabusDetail(Long id) {
        Syllabus s = syllabusRepository.findById(id).orElseThrow(() -> new RuntimeException("Syllabus not found"));
        return SyllabusDetailDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject().getName())
                .year(s.getYear())
                .description(s.getDescription())
                .objectives(s.getObjectives())
                .outline(s.getOutline())
                .build();
    }

    //===================================Subject================================================
    @Override
    public Page<SubjectDTO> getSubjects(int page, int size, String subjectCode, String name, String specialization) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "subjectCode"));
        Page<Subject> result = subjectRepository.filter( subjectCode, name, specialization, pageable);
        return result.map(s -> SubjectDTO.builder()
                .subjectCode(s.getSubjectCode())
                .name(s.getName())
                .specialization(s.getSpecialization())
                .build()
        );
    }
    @Override
    public Page<ClassResponseDTO> getClasses(int page, int size, Long id, String classCode, String name, String semester, String subjectName, String lecturerName, Boolean isRegistrationOpen){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ClassRoom> result = classRoomRepository.filter(
                id,
                classCode,
                name,
                semester,
                subjectName,
                lecturerName,
                isRegistrationOpen,
                pageable
        );

        return result.map(c -> ClassResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .classCode(c.getClassCode())
                .semester(c.getSemester())
                .subjectName(c.getSubject() != null ? c.getSubject().getName() : "N/A")
                .lecturerName(c.getLecturer() != null ? c.getLecturer().getFullName() : "N/A")
                .isRegistrationOpen(c.isRegistrationOpen())
                .studentCount(c.getStudents() != null ? c.getStudents().size() : 0)
                .maxCapacity(c.getMaxCapacity())
                .build()
        );
    }
    @Override
    @Transactional
    public void assignLecturer(Long cId,Long lId)
    {
        ClassRoom c=classRoomRepository.findById(cId).orElseThrow(() -> new AppException("Classroom not found",HttpStatus.NOT_FOUND));
        User l = userRepository.findById(lId)
                .filter(u -> u.getRole() == Role.LECTURER)
                .orElseThrow(() -> new AppException("Giảng viên không hợp lệ", HttpStatus.NOT_FOUND));
        c.setLecturer(l);
        classRoomRepository.save(c);
    }
    public List<User> getListLecturer() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.LECTURER)
                .collect(Collectors.toList());
    }
    @Transactional
    @Override
    public ClassResponseDTO status(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        classRoom.setRegistrationOpen(!classRoom.isRegistrationOpen());

        classRoomRepository.save(classRoom);

        return ClassResponseDTO.builder()
                .id(classRoom.getId())
                .name(classRoom.getName())
                .classCode(classRoom.getClassCode())
                .semester(classRoom.getSemester())
                .subjectName(classRoom.getSubject() != null ? classRoom.getSubject().getName() : "N/A")
                .lecturerName(classRoom.getLecturer() != null ? classRoom.getLecturer().getFullName() : "N/A")
                .isRegistrationOpen(classRoom.isRegistrationOpen())
                .studentCount(classRoom.getStudents() != null ? classRoom.getStudents().size() : 0)
                .maxCapacity(classRoom.getMaxCapacity())
                .build();
    }

}