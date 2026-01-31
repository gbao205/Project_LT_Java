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
    protected Class<UserImportDTO> getDtoClass() {
        return UserImportDTO.class;
    }

    @Override
    protected void validate(List<UserImportDTO> data, Object... params) {
        Role role = (Role) params[0];
        String admissionDateStr = (params.length > 1) ? (String) params[1] : null;

        for (int i = 0; i < data.size(); i++) {
            validateRequiredFields(data.get(i), role, i + 2, admissionDateStr);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    protected void saveToDb(List<UserImportDTO> data, Object... params) {
        Role role = (Role) params[0];
        java.util.Set<String> processedEmails = new java.util.HashSet<>();

        if (role == Role.STUDENT) {
            String admissionDateStr = (String) params[1];
            processStudentImport(data, processedEmails, admissionDateStr);
        } else {
            processLecturerImport(data, processedEmails);
        }
    }

    // ================= XỬ LÝ RIÊNG CHO SINH VIÊN =================
    private void processStudentImport(List<UserImportDTO> data, java.util.Set<String> processedEmails, String admDateStr) {
        DateTimeFormatter fileDate = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter uiDate = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate startDate = LocalDate.parse(admDateStr, uiDate);
        for (UserImportDTO dto : data) {
            String email = generateEmail(dto.getFullName(), dto.getStudentId(), processedEmails);
            User user = saveBaseUser(dto.getFullName(), email, Role.STUDENT);

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
                    .dob(LocalDate.parse(dto.getDob(), fileDate))
                    .admissionDate(startDate)
                    .build());
        }
    }

    // ================= XỬ LÝ RIÊNG CHO GIẢNG VIÊN =================
    private void processLecturerImport(List<UserImportDTO> data, java.util.Set<String> processedEmails) {
        for (UserImportDTO dto : data) {
            String email = generateEmail(dto.getFullName(), dto.getCccd(), processedEmails);
            User user = saveBaseUser(dto.getFullName(), email, Role.LECTURER);

            lecturerRepository.save(Lecturer.builder()
                    .user(user)
                    .CCCD(dto.getCccd())
                    .degree(dto.getDegree())
                    .department(dto.getDepartment())
                    .build());
        }
    }

    // ================= HÀM BỔ TRỢ (HELPER METHODS) =================

    private void validateRequiredFields(UserImportDTO dto, Role role, int rowNum, String admissionDateStr) {
        if (isBlank(dto.getFullName())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Họ tên");

        if (role == Role.STUDENT) {
            if (isBlank(dto.getStudentId()))   throw new RuntimeException("Dòng " + rowNum + ": Thiếu MSSV");
            if (isBlank(dto.getDob()))         throw new RuntimeException("Dòng " + rowNum + ": Thiếu Ngày sinh");
            if (isBlank(dto.getEduLevel()))    throw new RuntimeException("Dòng " + rowNum + ": Thiếu Bậc đào tạo");
            if (isBlank(dto.getBatch()))       throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khóa");
            if (isBlank(dto.getFaculty()))     throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khoa");
            if (isBlank(dto.getMajor()))       throw new RuntimeException("Dòng " + rowNum + ": Thiếu Ngành học");
            if (isBlank(dto.getTrainingType())) throw new RuntimeException("Dòng " + rowNum + ": Thiếu Loại hình đào tạo");
            if (isBlank(admissionDateStr))     throw new RuntimeException("Chưa chọn Ngày nhập học trên giao diện!");
        } else {
            if (isBlank(dto.getCccd()))        throw new RuntimeException("Dòng " + rowNum + ": Thiếu số CCCD");
            if (isBlank(dto.getDegree()))      throw new RuntimeException("Dòng " + rowNum + ": Thiếu Học vị");
            if (isBlank(dto.getFaculty()))     throw new RuntimeException("Dòng " + rowNum + ": Thiếu Khoa");
            if (isBlank(dto.getDepartment()))  throw new RuntimeException("Dòng " + rowNum + ": Thiếu Bộ môn công tác");
        }
    }

    private String generateEmail(String fullName, String rawId, java.util.Set<String> processedEmails) {
        String cleanId = rawId.trim();
        String suffix = (cleanId.length() >= 4) ? cleanId.substring(cleanId.length() - 4) : cleanId;
        String baseEmail = normalizeName(fullName) + suffix;
        String email = baseEmail + "@collabsphere.edu.vn";

        int count = 1;
        while (userRepository.existsByEmail(email) || processedEmails.contains(email)) {
            email = baseEmail + (count++) + "@collabsphere.edu.vn";
        }
        processedEmails.add(email);
        return email;
    }

    private User saveBaseUser(String fullName, String email, Role role) {
        return userRepository.save(User.builder()
                .email(email).fullName(fullName)
                .password(passwordEncoder.encode("123"))
                .role(role).active(true).build());
    }

    private String normalizeName(String name) {
        if (isBlank(name)) return "";
        String temp = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String normalized = temp.toLowerCase().trim().replaceAll("\\s+", " ");
        String[] parts = normalized.split(" ");
        String ten = parts[parts.length - 1];
        String hoDem = String.join("", Arrays.copyOfRange(parts, 0, parts.length - 1));
        return ten + hoDem; // Trả về dạng: nambui
    }

}