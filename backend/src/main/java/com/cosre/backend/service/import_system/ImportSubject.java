package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.SubjectImportDTO;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import static io.micrometer.common.util.StringUtils.isBlank;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ImportSubject extends BaseImportParser<SubjectImportDTO> {
    private final SubjectRepository subjectRepository;

    @Override
    protected Class<SubjectImportDTO> getDtoClass() {
        return SubjectImportDTO.class;
    }

    @Override
    protected void validate(List<SubjectImportDTO> data,Object... params) {
        for (int i = 0; i < data.size(); i++) {
            SubjectImportDTO s = data.get(i);
            System.out.println("Row " + (i+2) + ": code=" + s.getSubjectCode() + ", name=" + s.getName());
            int rowNum = i + 2;

            if (isBlank(s.getSubjectCode())) {
                throw new IllegalArgumentException("Row " + rowNum + ": subjectCode is required");
            }
            if (isBlank(s.getName())) {
                throw new IllegalArgumentException("Row " + rowNum + ": name is required");
            }
        }
    }
    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<SubjectImportDTO> data,Object... parmas)
    {
        List<Subject> subjects = data.stream().map(dto -> {
            Subject subject = new Subject();
            subject.setSubjectCode(dto.getSubjectCode());
            subject.setName(dto.getName());
            subject.setSpecialization(dto.getSpecialization());
            return subject;
        }).toList();
        subjectRepository.saveAll(subjects);
    }
}
