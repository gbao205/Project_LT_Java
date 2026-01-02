package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.SyllabusImportDTO;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.entity.Syllabus;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ImportSyllabus extends BaseImportParser<SyllabusImportDTO> {

    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;

    @Override
    protected Class<SyllabusImportDTO> getDtoClass() {
        return SyllabusImportDTO.class;
    }

    @Override
    protected void validate(List<SyllabusImportDTO> data, Object... params) {
        for (int i = 0; i < data.size(); i++) {
            SyllabusImportDTO dto = data.get(i);
            int rowNum = i + 2;

            if (isBlank(dto.getSubjectCode())) {
                throw new RuntimeException("Dòng " + rowNum + ": Thiếu Mã môn");
            }
            if (!subjectRepository.existsBySubjectCode(dto.getSubjectCode())) {
                throw new RuntimeException("Dòng " + rowNum + ": Môn học [" + dto.getSubjectCode() + "] chưa tồn tại. Hãy import Subject trước!");
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<SyllabusImportDTO> data, Object... params) {
        for (SyllabusImportDTO dto : data) {
            Subject subject = subjectRepository.findBySubjectCode(dto.getSubjectCode())
                    .orElseThrow(() -> new RuntimeException("Lỗi: Mã môn học [" + dto.getSubjectCode() + "] không tồn tại trong hệ thống. Vui lòng kiểm tra lại!"));

            Syllabus syllabus = syllabusRepository.findBySubjectSubjectCode(dto.getSubjectCode())
                    .orElse(new Syllabus());
            syllabus.setSubject(subject);
            syllabus.setDescription(dto.getDescription());
            syllabus.setObjectives(dto.getObjectives());
            syllabus.setOutline(dto.getOutline());
            syllabus.setYear(dto.getYear());

            syllabusRepository.save(syllabus);
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}