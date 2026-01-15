package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.staff.SubjectDTO;
import com.cosre.backend.dto.staff.SyllabusDetailDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IStaffService {
    List<ClassResponseDTO> getAllUserForStaff();

    ClassResponseDTO toggleClass(Long classId);

    List<User> getAllUser(String keyword);

    //===================================Syllabus================================================
    Page<SyllabusListDTO> getSyllabusList(int page,
                                          int size,
                                          Long id,
                                          String subjectName,
                                          Integer year);

    SyllabusDetailDTO getSyllabusDetail(Long id);

    Page<SubjectDTO> getSubjects(int page, int size, String subjectCode, String name, String specialization);
    Page<ClassResponseDTO> getClasses(int page, int size, Long id, String classCode, String name, String semester, String subjectName, String lecturerName, Boolean isRegistrationOpen);
}
