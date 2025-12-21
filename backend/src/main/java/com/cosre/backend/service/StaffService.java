package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.entity.Subject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class StaffService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private static final String DEFAULT_DOMAIN = "collabsphere.edu.vn";
    private static final String DEFAULT_PASSWORD = "123";

    @Transactional
    public List<User> importUserFromFile(MultipartFile file, Role targetRole){
        String fname=file.getOriginalFilename();
        if(fname== null||(!fname.endsWith(".csv")&&!fname.endsWith(".txt"))){
            throw new AppException("File không đúng định dạng. Chỉ chấp nhận CSV/TXT",HttpStatus.BAD_REQUEST);
        }

        List<User> importUser= new ArrayList<>();
        Set<String> newEmail = new HashSet<String>();
        try(BufferedReader fread =new BufferedReader(new InputStreamReader(file.getInputStream(),"UTF-8")) )
        {
            String line;
            fread.readLine();

            while((line = fread.readLine())!= null)
            {
                String [] data =  line.split(",");
                if(data.length<1 || data[0].trim().isEmpty()){
                    continue;
                }
                String fullName=data[0].trim();
                String finalEmail= UniqueEmail(fullName,DEFAULT_DOMAIN,newEmail);

                newEmail.add(finalEmail);

                User newUser = User.builder()
                        .email(finalEmail)
                        .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .fullName(fullName)
                        .role(targetRole)
                        .active(true)
                        .build();
                importUser.add(newUser);
            }

            userRepository .saveAll(importUser);
            return importUser;
        }
        catch(IOException e){
            throw new AppException("Lỗi đọc file" + e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    private String  UniqueEmail(String fullName,String domain,Set<String> newEmail){
        String baseName= normalizename(fullName);
        String finalEmail= baseName + "@" + domain;

        int c=0;

        while(userRepository.existsByEmail(finalEmail)|| newEmail.contains(finalEmail)){
            c++;
            finalEmail = baseName + c + "@" + domain;
        }
        return finalEmail;
    }

    private String normalizename(String fullName){
        String temp = Normalizer.normalize(fullName, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String normalized = temp.trim().replaceAll("\\s+", " ").toLowerCase();
        List<String> parts = Arrays.asList(normalized.split(" "));

        if(parts.size() < 1) return "unknown";

        String ten=parts.get(parts.size() - 1);
        String hodem=String.join("", parts.subList(0, parts.size() -1));

        if(hodem.isEmpty()){
            return ten;
        }
        return ten+hodem;
    }
    public List<User> getAllUser (String keyword){
        List<Role> allowrole= Arrays.asList(Role.LECTURER,Role.STUDENT);
        List<User> allUsers = userRepository.findAll();
        List<User> fillterUser= allUsers.stream()
                .filter(user -> allowrole.contains(user.getRole()))
                .filter(user -> {
                    if(keyword==null || keyword.isEmpty()) {return true;}
                    String lower = keyword.toLowerCase();
                    return user.getFullName().toLowerCase().contains(lower)||
                            user.getEmail().toLowerCase().contains(lower);
                })
                .collect(Collectors.toList());
        return fillterUser;
    }

    @Transactional
    public List<ClassResponseDTO> importClassesFromFile(MultipartFile file) {
        String fname = file.getOriginalFilename();
        if (fname == null || (!fname.endsWith(".csv") && !fname.endsWith(".txt"))) {
            throw new AppException("File không đúng định dạng. Chỉ chấp nhận CSV hoặc TXT", HttpStatus.BAD_REQUEST);
        }

        List<ClassRoom> importedClasses = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"))) {
            reader.readLine(); // Bỏ qua dòng tiêu đề

            String line;
            while ((line = reader.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 5 || data[0].trim().isEmpty()) {
                    continue;
                }

                String classCode = data[0].trim();
                String className = data[1].trim();
                int semester = Integer.parseInt(data[2].trim());
                String subCode = data[3].trim();
                String lecEmail = data[4].trim();

                if (classRoomRepository.existsByClassCode(classCode)) continue;

                Subject subject = subjectRepository.findBySubjectCode(subCode)
                        .orElseThrow(() -> new AppException("Môn học " + subCode + " chưa có!", HttpStatus.NOT_FOUND));

                User lecturer = userRepository.findByEmail(lecEmail)
                        .orElseThrow(() -> new AppException("Giảng viên " + lecEmail + " chưa có!", HttpStatus.NOT_FOUND));

                LocalDate startDate = null;
                LocalDate endDate = null;

                try {
                    if (data.length > 5 && !data[5].trim().isEmpty()) {
                        startDate = LocalDate.parse(data[5].trim());
                    }
                    if (data.length > 6 && !data[6].trim().isEmpty()) {
                        endDate = LocalDate.parse(data[6].trim());
                    }
                } catch (Exception e) {
                    startDate = null;
                    endDate = null;
                }

                ClassRoom newClass = ClassRoom.builder()
                        .classCode(classCode)
                        .name(className)
                        .semester(semester)
                        .subject(subject)
                        .lecturer(lecturer)
                        .startDate(startDate)
                        .endDate(endDate)
                        .isRegistrationOpen(false)
                        .maxCapacity(60)
                        .build();

                importedClasses.add(newClass);
            }
            List<ClassRoom> savedClasses = classRoomRepository.saveAll(importedClasses);
            return savedClasses.stream()
                    .map(clazz -> ClassResponseDTO.builder()
                            .id(clazz.getId())
                            .name(clazz.getName())
                            .classCode(clazz.getClassCode())
                            .semester(clazz.getSemester())
                            .subjectName(clazz.getSubject() != null ? clazz.getSubject().getName() : "N/A")
                            .lecturerName(clazz.getLecturer() != null ? clazz.getLecturer().getFullName() : "N/A")
                            .isRegistrationOpen(clazz.isRegistrationOpen())
                            .maxCapacity(clazz.getMaxCapacity())
                            .studentCount(0) // Mới import thì sĩ số luôn là 0
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new AppException("Lỗi đọc file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    public List<ClassResponseDTO> getAllClassesForStaff() {
        return classRoomRepository.findAll().stream()
                .map(clazz -> ClassResponseDTO.builder()
                        .id(clazz.getId())
                        .name(clazz.getName())
                        .classCode(clazz.getClassCode())
                        .semester(clazz.getSemester())
                        .subjectName(clazz.getSubject() != null ? clazz.getSubject().getName() : "N/A")
                        .lecturerName(clazz.getLecturer() != null ? clazz.getLecturer().getFullName() : "Chưa phân công")
                        .isRegistrationOpen(clazz.isRegistrationOpen())
                        .maxCapacity(clazz.getMaxCapacity())
                        .studentCount(clazz.getStudents() != null ? clazz.getStudents().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }
    @Transactional
    public ClassResponseDTO toggleRegistrationStatus(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        classRoom.setRegistrationOpen(!classRoom.isRegistrationOpen());
        classRoomRepository.save(classRoom);

        return ClassResponseDTO.builder()
                .id(classRoom.getId())
                .classCode(classRoom.getClassCode())
                .isRegistrationOpen(classRoom.isRegistrationOpen())
                .studentCount(classRoom.getStudents().size())
                .maxCapacity(classRoom.getMaxCapacity())
                .build();
    }


}
