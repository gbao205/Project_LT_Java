package com.cosre.backend.service.import_system;

import com.cosre.backend.dto.staff.UserImportDTO;
import com.cosre.backend.entity.Lecturer;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.LecturerRepository;
import com.cosre.backend.repository.StudentRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ImportUser extends BaseImportParser<UserImportDTO> {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    protected Class<UserImportDTO> getDtoClass() { return UserImportDTO.class; }

    @Override
    protected void validate(List<UserImportDTO> data) {
        // Validation cơ bản trước khi vào Transaction
        for (int i = 0; i < data.size(); i++) {
            if (isBlank(data.get(i).getFullName())) {
                throw new RuntimeException("Dòng " + (i + 2) + ": Tên không được để trống");
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class) // Lỗi bất kỳ dòng nào = Xóa sạch dữ liệu đã lưu tạm
    protected void saveToDb(List<UserImportDTO> data, Object... params) {
        Role role = (Role) params[0];
        // Lấy ngày nhập học từ giao diện gửi lên
        String admissionDateStr = (params.length > 1) ? (String) params[1] : null;

        java.util.Set<String> processedEmails = new java.util.HashSet<>();
        DateTimeFormatter fileDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter uiDateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < data.size(); i++) {
            UserImportDTO dto = data.get(i);
            int rowNum = i + 2;

            validateRequiredFields(dto, role, rowNum, admissionDateStr);

            String rawId = (role == Role.LECTURER) ? dto.getCccd() : dto.getStudentId();
            String suffix = (rawId != null && rawId.length() >= 4) ? rawId.substring(rawId.length() - 4) : "0000";

            String baseEmail = normalizeName(dto.getFullName()) + suffix;
            String email = baseEmail + "@collabsphere.edu.vn";

            int count = 1;
            while (userRepository.existsByEmail(email) || processedEmails.contains(email)) {
                email = baseEmail + (count++) + "@collabsphere.edu.vn";
            }
            processedEmails.add(email);

            User user = userRepository.save(User.builder()
                    .email(email).fullName(dto.getFullName())
                    .password(passwordEncoder.encode("123"))
                    .role(role).active(true).build());

            if (role == Role.STUDENT) {
                studentRepository.save(Student.builder()
                        .user(user)
                        .studentId(dto.getStudentId())
                        .major(dto.getMajor())
                        .faculty(dto.getFaculty())
                        .batch(dto.getBatch())
                        .eduLevel(dto.getEduLevel())
                        .trainingType(dto.getTrainingType())
                        .specialization(dto.getSpecialization())
                        .studentStatus(isBlank(dto.getStudentStatus()) ? "Đang học" : dto.getStudentStatus())
                        .dob(LocalDate.parse(dto.getDob(), fileDateFormatter))
                        .admissionDate(LocalDate.parse(admissionDateStr, uiDateFormatter)) // Ngày từ giao diện
                        .build());
            } else {
                lecturerRepository.save(Lecturer.builder()
                        .user(user)
                        .CCCD(dto.getCccd())
                        .degree(dto.getDegree())
                        .department(dto.getDepartment())
                        .build());
            }
        }
    }

    private void validateRequiredFields(UserImportDTO dto, Role role, int rowNum, String admissionDateStr) {
        if (role == Role.STUDENT) {
            if (isBlank(dto.getStudentId())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu MSSV");
            if (isBlank(dto.getDob()))       throw new RuntimeException("Dòng " + rowNum + ": Thiếu Ngày sinh");
            if (isBlank(dto.getEduLevel()))  throw new RuntimeException("Dòng " + rowNum + ": Thiếu Bậc đào tạo");
            if (isBlank(dto.getBatch()))     throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khóa");
            if (isBlank(dto.getFaculty()))   throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khoa");
            if (isBlank(dto.getMajor()))     throw new RuntimeException("Dòng " + rowNum + ": Thiếu Ngành học");
            if (isBlank(dto.getTrainingType())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Loại hình đào tạo");
            if (isBlank(admissionDateStr))   throw new RuntimeException("Staff chưa chọn Ngày nhập học trên giao diện!");
        } else {
            if (isBlank(dto.getCccd()))      throw new RuntimeException("Dòng " + rowNum + ": Thiếu số CCCD");
            if (isBlank(dto.getDegree()))    throw new RuntimeException("Dòng " + rowNum + ": Thiếu Học vị");
            if (isBlank(dto.getFaculty()))   throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khoa");
            if (isBlank(dto.getDepartment())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Bộ môn công tác");
        }
    }

    private String normalizeName(String name) {
        String temp = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String normalized = temp.toLowerCase().trim().replaceAll("\\s+", " ");
        String[] parts = normalized.split(" ");
        String ten = parts[parts.length - 1];
        String hoDem = String.join("", Arrays.copyOfRange(parts, 0, parts.length - 1));
        return ten + hoDem;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}