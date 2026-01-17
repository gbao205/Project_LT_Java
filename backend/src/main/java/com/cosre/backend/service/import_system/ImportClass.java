package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.ClassImportDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ImportClass extends BaseImportParser<ClassImportDTO>{
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;

    @Override
    protected Class<ClassImportDTO> getDtoClass() { return ClassImportDTO.class; }
    @Override
    protected void validate(List<ClassImportDTO> data, Object... params) {
        for (int i = 0; i < data.size(); i++) {
            ClassImportDTO dto = data.get(i);
            int rowNum = i + 2;
            if (isBlank(dto.getClassCode())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Mã lớp");
            if (isBlank(dto.getSubjectCode())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Mã môn");
            if (classRoomRepository.existsByClassCode(dto.getClassCode())) {
                throw new RuntimeException("Dòng " + rowNum + ": Mã lớp " + dto.getClassCode() + " đã tồn tại trong hệ thống!");
            }
        }
    }
    private LocalDate parseDate(String value) {
        if (isBlank(value)) return null;

        String[] patterns = {
                "dd/MM/yyyy",
                "d/M/yyyy",
                "yyyy/M/d",
                "yyyy/MM/dd"
        };

        for (String pattern : patterns) {
            try {
                return LocalDate.parse(value, DateTimeFormatter.ofPattern(pattern));
            } catch (Exception ignored) {}
        }

        throw new RuntimeException("Sai định dạng ngày: " + value);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<ClassImportDTO> data, Object... params) {

        for (ClassImportDTO dto : data) {
            Subject subject = subjectRepository.findBySubjectCode(dto.getSubjectCode())
                    .orElseThrow(() -> new RuntimeException("Môn học " + dto.getSubjectCode() + " không tồn tại"));
            User lecturer = null;

            if (!isBlank(dto.getLecturerEmail())) {
                lecturer = userRepository.findByEmail(dto.getLecturerEmail())
                        .orElseThrow(() -> new RuntimeException(
                                "Giảng viên " + dto.getLecturerEmail() + " không tồn tại"
                        ));
            }


            ClassRoom newClass = ClassRoom.builder()
                    .name(dto.getName())
                    .classCode(dto.getClassCode())
                    .semester(dto.getSemester())
                    .subject(subject)
                    .lecturer(lecturer)
                    .startDate(parseDate(dto.getStartDate()))
                    .endDate(parseDate(dto.getEndDate()))
                    .isRegistrationOpen(false)
                    .build();
            classRoomRepository.save(newClass);
        }
    }
}
