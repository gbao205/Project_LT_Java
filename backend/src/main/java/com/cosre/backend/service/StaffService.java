package com.cosre.backend.service;

import com.cosre.backend.dto.staff.*;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class StaffService implements IStaffService {
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;
    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;

    @Override
    public Page<SyllabusListDTO> getSyllabusList(int page,
                                                 int size,
                                                 Long id,
                                                 String subjectName,
                                                 Integer year) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Syllabus> pageResult =
                syllabusRepository.filter(id, subjectName, year, pageable);
        return pageResult.map(s -> SyllabusListDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject() != null ? s.getSubject().getName() : "N/A")
                .year(s.getYear())
                .build()
        );
    }

    @Override
    public SyllabusDetailDTO getSyllabusDetail(Long id) {
        Syllabus s = syllabusRepository.findById(id).orElseThrow(() -> new RuntimeException("Syllabus not found"));
        return SyllabusDetailDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject().getName())
                .year(s.getYear())
                .description(s.getDescription())
                .objectives(s.getObjectives())
                .outline(s.getOutline())
                .build();
    }

    @Override
    public Page<SubjectDTO> getSubjects(int page, int size, String subjectCode, String name, String specialization) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "subjectCode"));
        Page<Subject> result = subjectRepository.filter(subjectCode, name, specialization, pageable);
        return result.map(s -> SubjectDTO.builder()
                .subjectCode(s.getSubjectCode())
                .name(s.getName())
                .specialization(s.getSpecialization())
                .build()
        );
    }

    @Override
    public Page<ClassResponseDTO> getClasses(int page, int size, Long id, String classCode, String name, String semester, String subjectName, String lecturerName, Boolean isRegistrationOpen) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ClassRoom> result = classRoomRepository.filter(
                id,
                classCode,
                name,
                semester,
                subjectName,
                lecturerName,
                isRegistrationOpen,
                pageable
        );

        return result.map(c -> ClassResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .classCode(c.getClassCode())
                .semester(c.getSemester())
                .subjectName(c.getSubject() != null ? c.getSubject().getName() : "N/A")
                .lecturerName(c.getLecturer() != null ? c.getLecturer().getFullName() : "N/A")
                .isRegistrationOpen(c.isRegistrationOpen())
                .studentCount(c.getStudents() != null ? c.getStudents().size() : 0)
                .maxCapacity(c.getMaxCapacity())
                .build()
        );
    }

    @Transactional
    @Override
    public ClassResponseDTO status(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        classRoom.setRegistrationOpen(!classRoom.isRegistrationOpen());

        classRoomRepository.save(classRoom);

        return ClassResponseDTO.builder()
                .id(classRoom.getId())
                .name(classRoom.getName())
                .classCode(classRoom.getClassCode())
                .semester(classRoom.getSemester())
                .subjectName(classRoom.getSubject() != null ? classRoom.getSubject().getName() : "N/A")
                .lecturerName(classRoom.getLecturer() != null ? classRoom.getLecturer().getFullName() : "N/A")
                .isRegistrationOpen(classRoom.isRegistrationOpen())
                .studentCount(classRoom.getStudents() != null ? classRoom.getStudents().size() : 0)
                .maxCapacity(classRoom.getMaxCapacity())
                .build();
    }

    @Transactional
    @Override
    public void assignLecturer(String classCode, String cccd) {
        ClassRoom classroom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new AppException("Không tìm thấy lớp học: " + classCode, HttpStatus.NOT_FOUND));

        Lecturer lecturer = lecturerRepository.findByCCCD(cccd)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên có CCCD: " + cccd, HttpStatus.NOT_FOUND));

        User lecturerUser = lecturer.getUser();

        if (lecturerUser == null || lecturerUser.getRole() != Role.LECTURER) {
            throw new AppException("Người dùng này không phải là giảng viên hợp lệ", HttpStatus.BAD_REQUEST);
        }

        classroom.setLecturer(lecturerUser);
        classRoomRepository.save(classroom);
    }

    @Override
    public List<StudentInClassDTO> getStudentInClass(String classCode) {
        ClassRoom classRoom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new AppException("Không tìm thấy lớp học", HttpStatus.NOT_FOUND));

        return classRoom.getStudents().stream()
                .map(user -> {
                    Optional<Student> studentProfile = studentRepository.findByUser(user);

                    String mssv = studentProfile.isPresent() ? studentProfile.get().getStudentId() : user.getCode();

                    return new StudentInClassDTO(
                            user.getFullName(),
                            user.getEmail(),
                            mssv
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TimeTableResponseDTO> getTimeTable(String classCode) {
        ClassRoom classRoom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        List<TimeTableResponseDTO> result = new ArrayList<>();

        // Neo mốc về Thứ 2 của tuần chứa startDate
        LocalDate anchorMonday = classRoom.getStartDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (TimeTable tt : classRoom.getTimeTables()) {
            if (tt.getWeeks() == null || tt.getWeeks().isEmpty()) continue;

            String[] weeks = tt.getWeeks().split(",");
            for (String w : weeks) {
                try {
                    int weekNum = Integer.parseInt(w.trim()); // Dùng weekNum ở đây

                    long daysOffset = (long) (weekNum - 1) * 7 + (tt.getDayOfWeek() - 2);
                    LocalDate actualDate = anchorMonday.plusDays(daysOffset);

                    result.add(TimeTableResponseDTO.builder()
                            .date(actualDate)
                            .dayOfWeek(tt.getDayOfWeek())
                            .slot(tt.getSlot())
                            .room(tt.getRoom())
                            .className(classRoom.getName())
                            .build());
                } catch (NumberFormatException e) {
                    // Bỏ qua nếu dữ liệu tuần trong file excel bị nhập sai định dạng
                }
            }
        }

        // Sắp xếp lại danh sách theo thứ tự thời gian từ cũ đến mới
        return result.stream()
                .sorted(Comparator.comparing(TimeTableResponseDTO::getDate))
                .toList();
    }

    @Transactional
    @Override
    public ClassResponseDTO updateClassDate(String classCode, UpdateClassDateDTO dto) {
        ClassRoom classRoom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new AppException("Không tìm thấy lớp học mã: " + classCode, HttpStatus.NOT_FOUND));

        if (dto.getStartDate() != null) {
            classRoom.setStartDate(dto.getStartDate());
        }

        if (classRoom.getTimeTables() != null && !classRoom.getTimeTables().isEmpty()) {
            List<TimeTableResponseDTO> sessions = getTimeTable(classCode);

            if (!sessions.isEmpty()) {
                LocalDate autoEndDate = sessions.get(sessions.size() - 1).getDate();
                classRoom.setEndDate(autoEndDate);
            }
        }

        ClassRoom updated = classRoomRepository.save(classRoom);

        return ClassResponseDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .classCode(updated.getClassCode())
                .semester(updated.getSemester())
                .subjectName(updated.getSubject() != null ? updated.getSubject().getName() : "N/A")
                .lecturerName(updated.getLecturer() != null ? updated.getLecturer().getFullName() : "N/A")
                .isRegistrationOpen(updated.isRegistrationOpen())
                .studentCount(updated.getStudents() != null ? updated.getStudents().size() : 0)
                .maxCapacity(updated.getMaxCapacity())
                .startDate(updated.getStartDate()) // Ngày bắt đầu mới
                .endDate(updated.getEndDate())     // Ngày kết thúc vừa tự động tính
                .build();
    }
    @Transactional
    @Override
    public SubjectDTO updateSubject(String subjectCode, UpdateSubjectDTO dto) {
        System.out.println("SubjectCode: " + subjectCode);
        System.out.println("New Name: " + dto.getName());
        Subject subject = subjectRepository.findBySubjectCode(subjectCode)
                .orElseThrow(() -> new AppException("Môn học " + subjectCode + " không tồn tại", HttpStatus.NOT_FOUND));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            subject.setName(dto.getName());
        }

        if (dto.getSpecialization() != null && !dto.getSpecialization().trim().isEmpty()) {
            subject.setSpecialization(dto.getSpecialization());
        }

        Subject updated = subjectRepository.save(subject);

        return SubjectDTO.builder()
                .subjectCode(updated.getSubjectCode())
                .name(updated.getName())
                .specialization(updated.getSpecialization())
                .build();
    }
    // StaffService.java

    @Override
    public Page<StudentResponseDTO> getStudentList(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        String searchKey = (keyword == null) ? "" : keyword;
        Page<Student> students = studentRepository
                .findByUser_FullNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(searchKey, searchKey, pageable);
        return students.map(s -> StudentResponseDTO.builder()
                .id(s.getId())
                .studentId(s.getStudentId())
                .fullName(s.getUser().getFullName())
                .email(s.getUser().getEmail())
                .major(s.getMajor())
                .build());
    }

    @Override
    public StudentDetailDTO getStudentDetail(Long id) {
        Student s = studentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên", HttpStatus.NOT_FOUND));

        User u = s.getUser();

        return StudentDetailDTO.builder()
                .fullName(u.getFullName()) // Lấy từ User
                .email(u.getEmail())       // Lấy từ User
                .studentId(s.getStudentId())
                .eduLevel(s.getEduLevel())
                .batch(s.getBatch())
                .faculty(s.getFaculty())
                .specialization(s.getSpecialization())
                .trainingType(s.getTrainingType())
                .studentStatus(s.getStudentStatus())
                .dob(s.getDob())
                .admissionDate(s.getAdmissionDate())
                .build();
    }

    @Override
    public Page<LecturerResponseDTO> getLecturerList(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        String searchKey = (keyword == null) ? "" : keyword;
        Page<Lecturer> lecturers = lecturerRepository
                .findByUser_FullNameContainingIgnoreCaseOrCCCDContainingIgnoreCase(searchKey, searchKey, pageable);
        return lecturers.map(l -> LecturerResponseDTO.builder()
                .id(l.getId())
                .CCCD(l.getCCCD())
                .fullName(l.getUser().getFullName())
                .email(l.getUser().getEmail())
                .department(l.getDepartment())
                .degree(l.getDegree())
                .build());
    }
}