package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.TimeTableImportDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.TimeTable;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.TimeTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("importTimeTable")
@RequiredArgsConstructor
public class ImportTimeTable extends BaseImportParser<TimeTableImportDTO> {

    private final ClassRoomRepository classRoomRepository;
    private final TimeTableRepository timeTableRepository;

    @Override
    protected Class<TimeTableImportDTO> getDtoClass() {
        return TimeTableImportDTO.class;
    }

    @Override
    protected void validate(List<TimeTableImportDTO> data, Object... params) {
        for (TimeTableImportDTO dto : data) {
            if (isBlank(dto.getClassCode())) throw new RuntimeException("Mã lớp không được để trống");
            if (dto.getDayOfWeek() == null || dto.getDayOfWeek() < 2 || dto.getDayOfWeek() > 8)
                throw new RuntimeException("Thứ không hợp lệ (2-8) tại lớp: " + dto.getClassCode());
            if (dto.getSlot() == null || dto.getSlot() < 1 || dto.getSlot() > 5)
                throw new RuntimeException("Ca học không hợp lệ (1-5) tại lớp: " + dto.getClassCode());
        }
    }

    @Override
    @Transactional
    protected void saveToDb(List<TimeTableImportDTO> data, Object... params) {
        for (TimeTableImportDTO dto : data) {
            ClassRoom classRoom = classRoomRepository.findByClassCode(dto.getClassCode())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp: " + dto.getClassCode()));

            TimeTable timeTable = TimeTable.builder()
                    .classRoom(classRoom)
                    .dayOfWeek(dto.getDayOfWeek())
                    .slot(dto.getSlot())
                    .room(dto.getRoom())
                    .weeks(dto.getWeeks())
                    .build();

            timeTableRepository.save(timeTable);
        }
    }
}