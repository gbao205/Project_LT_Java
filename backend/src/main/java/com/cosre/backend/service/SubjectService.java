package com.cosre.backend.service;

import com.cosre.backend.entity.Subject;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject createSubject(Subject subject) {
        // Kiểm tra xem mã môn học đã tồn tại chưa để tránh lỗi DB
        if (subjectRepository.existsBySubjectCode(subject.getSubjectCode())) {
            throw new AppException("Mã môn học này đã tồn tại!", HttpStatus.BAD_REQUEST);
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy môn học ID: " + id, HttpStatus.NOT_FOUND));

        // Cập nhật thông tin
        subject.setName(subjectDetails.getName());
        subject.setSpecialization(subjectDetails.getSpecialization());
        subject.setDescription(subjectDetails.getDescription());
        subject.setSubjectCode(subjectDetails.getSubjectCode());

        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new AppException("Môn học không tồn tại để xóa!", HttpStatus.NOT_FOUND);
        }
        subjectRepository.deleteById(id);
    }
}