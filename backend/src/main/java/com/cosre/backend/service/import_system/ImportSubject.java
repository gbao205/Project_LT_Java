package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.SubjectImportDTO;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
        if(data.isEmpty()){
            throw new AppException("File import rỗng", HttpStatus.BAD_REQUEST);        }

        for (int i = 0; i < data.size(); i++) {
            SubjectImportDTO s = data.get(i);
            int rowNum = i + 2;

            if (isBlank(s.getSubjectCode())) {
                throw new AppException(
                        "Row " + rowNum + ": subjectCode is required",
                        HttpStatus.BAD_REQUEST
                );
            }
            if (isBlank(s.getName())) {
                throw new AppException(
                        "Row " + rowNum + ": name is required",
                        HttpStatus.BAD_REQUEST
                );
            }
            if (isBlank(s.getSpecialization())) {
                throw new AppException(
                        "File Subject sai định dạng hoặc thiếu cột 'Chuyên ngành' (dòng " + rowNum + ")",
                        HttpStatus.BAD_REQUEST
                );
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
