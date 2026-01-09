package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.staff.SyllabusDetailDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IStaffService {
    List<ClassResponseDTO> getAllUserForStaff();
    ClassResponseDTO toggleClass(Long classId);
    List<User> getAllUser (String keyword);
    List<ClassResponseDTO> getAllClassesForStaff();
    //===================================Syllabus================================================
    Page<SyllabusListDTO> getSyllabusList(int page,
                                          int size,
                                          Long id,
                                          String subjectName,
                                          Integer year);
    SyllabusDetailDTO getSyllabusDetail(Long id);
}
