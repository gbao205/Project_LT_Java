package com.cosre.backend.service;

import com.cosre.backend.dto.staff.*;
import com.cosre.backend.entity.User;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface IStaffService {

    Page<SyllabusListDTO> getSyllabusList(int page,
                                          int size,
                                          Long id,
                                          String subjectName,
                                          Integer year);

    SyllabusDetailDTO getSyllabusDetail(Long id);

    Page<SubjectDTO> getSubjects(int page, int size, String subjectCode, String name, String specialization);
    Page<ClassResponseDTO> getClasses(int page, int size, Long id, String classCode, String name, String semester, String subjectName, String lecturerName, Boolean isRegistrationOpen);

    ClassResponseDTO status(Long classId);
    void assignLecturer(String classCode, String cccd);
    List<StudentInClassDTO> getStudentInClass(String classCode);
    List<TimeTableResponseDTO> getTimeTable(String classCode);
    ClassResponseDTO updateClassDate(String classId, UpdateClassDateDTO dto);
    SubjectDTO updateSubject(String SubjectCode, UpdateSubjectDTO dto);
    Page<StudentResponseDTO> getStudentList(int page, int size, String keyword);
    StudentDetailDTO getStudentDetail(Long id);
    Page<LecturerResponseDTO> getLecturerList(int page, int size, String keyword);
    }


