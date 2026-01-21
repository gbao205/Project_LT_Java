package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.AssignImportDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Component("assignStudent")
public class ImportAssign extends BaseImportParser<AssignImportDTO> {
    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    protected Class<AssignImportDTO> getDtoClass() { return AssignImportDTO.class; }

    @Override
    protected void validate(List<AssignImportDTO> data, Object... params) {
        if (params.length == 0 || params[0] == null) {
            throw new AppException("Missing Class Identifier", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<AssignImportDTO> data, Object... params) {
        String classCodeInput = params[0].toString();
        System.out.println(">>> Đã vào hàm saveToDb");
        System.out.println(">>> Số lượng dòng đọc từ Excel: " + data.size());
        ClassRoom c = classRoomRepository.findByClassCode(classCodeInput)
                .orElseThrow(() -> new AppException("Mã lớp '" + classCodeInput + "' không tồn tại trong hệ thống!", HttpStatus.NOT_FOUND));
        System.out.println(">>> Tìm thấy lớp: " + (c != null));
        for (AssignImportDTO dto : data) {
            System.out.println(">>> Đang xử lý MSSV: " + dto.getStudentId());
            if (dto.getStudentId() == null || dto.getStudentId().isBlank()) continue;

            Student studentEntity = studentRepository.findByStudentId(dto.getStudentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy sinh viên có mã: " + dto.getStudentId(), HttpStatus.NOT_FOUND));

            User s = studentEntity.getUser();

            if (c.getStudents().size() >= c.getMaxCapacity()) {
                throw new AppException("Lớp " + c.getClassCode() + " đã đủ số lượng sinh viên tối đa.", HttpStatus.BAD_REQUEST);
            }

            c.getStudents().add(s);
        }

        classRoomRepository.save(c);
    }
}
