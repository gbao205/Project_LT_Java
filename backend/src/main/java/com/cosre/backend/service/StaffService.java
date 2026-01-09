package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.staff.SyllabusDetailDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.Syllabus;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.SyllabusRepository;
import com.cosre.backend.repository.UserRepository;
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

public class StaffService implements IStaffService  {
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;

    public List<User> getAllUser (String keyword){
        List<Role> allowrole= Arrays.asList(Role.LECTURER,Role.STUDENT);
        List<User> allUsers = userRepository.findAll();
        List<User> fillterUser= allUsers.stream()
                .filter(user -> allowrole.contains(user.getRole()))
                .filter(user -> {
                    if(keyword==null || keyword.isEmpty()) {return true;}
                    String lower = keyword.toLowerCase();
                    return user.getFullName().toLowerCase().contains(lower)||
                            user.getEmail().toLowerCase().contains(lower);
                })
                .collect(Collectors.toList());
        return fillterUser;
    }

    public List<ClassResponseDTO> getAllClassesForStaff() {
        return classRoomRepository.findAll().stream()
                .map(clazz -> ClassResponseDTO.builder()
                        .id(clazz.getId())
                        .name(clazz.getName())
                        .classCode(clazz.getClassCode())
                        .semester(clazz.getSemester())
                        .subjectName(clazz.getSubject() != null ? clazz.getSubject().getName() : "N/A")
                        .lecturerName(clazz.getLecturer() != null ? clazz.getLecturer().getFullName() : "Chưa phân công")
                        .isRegistrationOpen(clazz.isRegistrationOpen())
                        .maxCapacity(clazz.getMaxCapacity())
                        .studentCount(clazz.getStudents() != null ? clazz.getStudents().size() : 0)
                        .build())
                .collect(Collectors.toList());
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
        Pageable pageable= PageRequest.of(page,size, Sort.by(Sort.Direction.DESC,"id"));
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
    public SyllabusDetailDTO  getSyllabusDetail(Long id) {
        Syllabus s = syllabusRepository.findById(id).orElseThrow(()-> new RuntimeException("Syllabus not found"));
        return SyllabusDetailDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject().getName())
                .year(s.getYear())
                .description(s.getDescription())
                .objectives(s.getObjectives())
                .outline(s.getOutline())
                .build();
    }
}
