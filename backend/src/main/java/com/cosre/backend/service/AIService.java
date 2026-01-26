package com.cosre.backend.service;

import com.cosre.backend.dto.ai.GeminiRequest;
import com.cosre.backend.dto.ai.GeminiResponse;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.Collections;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired
    private TaskRepository taskRepository; 

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired 
    private TeamRepository teamRepository;
    @Autowired 
    private MilestoneRepository milestoneRepository;
    @Autowired 
    private EvaluationRepository evaluationRepository;
    @Autowired 
    private TeamResourceRepository teamResourceRepository;
    @Autowired
    private AIChatRepository aiChatRepository;
    @Autowired
    private UserRepository userRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    // Hàm tạo ngữ cảnh (Context) từ dữ liệu thật
    private String buildSmartPrompt(Long userId, Long teamId, String userQuestion) {
        StringBuilder prompt = new StringBuilder();
        String q = userQuestion.toLowerCase();

        // Lấy thông tin người dùng trực tiếp từ Entity User
        User currentUser = userRepository.findById(userId).orElse(null);
        String userName = (currentUser != null) ? currentUser.getFullName() : "Người dùng";

        prompt.append("Bạn là 'CollabSphere AI' - trợ lý quản lý dự án học thuật chuyên nghiệp.\n");
        prompt.append("Hỗ trợ sinh viên: ").append(userName).append(".\n\n");

        // Tự động tìm danh sách nhóm qua TeamMemberRepository
        List<TeamMember> memberships = teamMemberRepository.findByStudent_Id(userId);

        if (memberships.isEmpty()) {
            prompt.append("--- NGỮ CẢNH ---\n- Người dùng chưa tham gia nhóm dự án nào.\n");
        } else {
            prompt.append("--- DỮ LIỆU THỰC TẾ TỪ HỆ THỐNG ---\n");
            for (TeamMember member : memberships) {
                Team team = member.getTeam();
                if (team == null) continue;

                prompt.append("\n[NHÓM: ").append(team.getTeamName()).append("]\n");
                
                // Lấy thông tin Môn học và Giảng viên (Fix lỗi undefined methods)
                if (team.getClassRoom() != null) {
                    ClassRoom cr = team.getClassRoom();
                    String subjectName = (cr.getSubject() != null) ? cr.getSubject().getName() : "N/A";
                    String lecturerName = "Chưa phân công";
                    if (cr.getLecturer() != null) {
                        lecturerName = cr.getLecturer().getFullName(); //
                    }

                    prompt.append("   + Môn học: ").append(subjectName).append("\n");
                    prompt.append("   + Giảng viên: ").append(lecturerName).append("\n");
                }

                if (team.getProject() != null) {
                    prompt.append("  + Đề tài: ").append(team.getProject().getName()).append("\n");
                }

                // Gọi hàm quét tiến độ chi tiết
                appendTeamDetails(prompt, team.getId(), q);
            }
        }
        
        prompt.append("\nYÊU CẦU: Trả lời dựa trên dữ liệu dự án trên. Nếu dữ liệu trống, hãy báo là chưa có tiến độ.\n");
        prompt.append("User Question: ").append(userQuestion);

        return prompt.toString();
    }

    // Hàm phụ trợ để lưu tin nhắn
    private void saveChatLog(Long userId, String content, String sender) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                AIChatMessage msg = new AIChatMessage();
                msg.setUser(user);
                msg.setContent(content);
                msg.setSender(sender);
                msg.setTimestamp(LocalDateTime.now());
                aiChatRepository.save(msg);
            }
        } catch (Exception e) {
            System.err.println("Lỗi lưu lịch sử chat: " + e.getMessage());
        }
    }

    public String getAdvice(Long userId, Long teamId, String userQuestion) {
        saveChatLog(userId, userQuestion, "USER");

        try {
            // 1. Lấy lịch sử hội thoại gần nhất
            List<AIChatMessage> history = aiChatRepository.findTop3ByUserIdOrderByTimestampDesc(userId);
            StringBuilder historyContext = new StringBuilder("Lịch sử hội thoại gần đây:\n");
            
            // Tạo một bản sao để đảo ngược danh sách mà không ảnh hưởng đến dữ liệu gốc
            List<AIChatMessage> sortedHistory = new ArrayList<>(history);
            Collections.reverse(sortedHistory); 
            for (AIChatMessage msg : sortedHistory) {
                historyContext.append(msg.getSender()).append(": ").append(msg.getContent()).append("\n");
            }

            // 2. Xây dựng Prompt tổng hợp
            String smartContext = buildSmartPrompt(userId, teamId, userQuestion);
            String finalPrompt = historyContext.toString() + "\nCâu hỏi mới nhất:\n" + smartContext;

            // 3. Xây dựng URI
            String cleanApiKey = apiKey.replace("{", "").replace("}", "");

            String uri = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("key", cleanApiKey)
                    .build() 
                    .toUriString();

            // 4. Gửi Request
            GeminiRequest requestBody = createGeminiRequest(finalPrompt);
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, createHeaders());
            RestTemplate restTemplate = new RestTemplate();

            System.out.println(uri);
            System.out.println(entity);
            
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(uri, entity, GeminiResponse.class);

            System.out.println("---------- PROMPT GỬI ĐI ----------");
            System.out.println(finalPrompt);
            System.out.println("-----------------------------------");

            String aiResponseText = "Xin lỗi, tôi gặp trục trặc khi kết nối.";
            if (response.getBody() != null && 
                response.getBody().getCandidates() != null && 
                !response.getBody().getCandidates().isEmpty()) {
                
                aiResponseText = response.getBody().getCandidates().get(0).getContent().getParts().get(0).getText();
            }

            saveChatLog(userId, aiResponseText, "AI");
            return aiResponseText;

        } catch (HttpClientErrorException e) {
            System.err.println("Lỗi API Gemini: " + e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) return "Hệ thống AI đang bận, thử lại sau 1 phút nhé!";
            return "Lỗi kết nối AI (" + e.getStatusCode() + ")";
        } catch (Exception e) {
            e.printStackTrace();
            return "Đã xảy ra lỗi hệ thống.";
        }
    }

    // Hàm lấy lịch sử chat
    public List<AIChatMessage> getHistory(Long userId) {
        return aiChatRepository.findByUserIdOrderByTimestampAsc(userId);
    }

    @Transactional // Bắt buộc để thực hiện lệnh DELETE
    public void clearHistory(Long userId) {
        aiChatRepository.deleteByUserId(userId);
    }

    // Hàm tạo cấu trúc Request Body cho Gemini
    private GeminiRequest createGeminiRequest(String prompt) {
        GeminiRequest requestBody = new GeminiRequest();
        GeminiRequest.Part part = new GeminiRequest.Part();
        part.setText(prompt);

        GeminiRequest.Content content = new GeminiRequest.Content();
        content.setParts(Collections.singletonList(part));

        requestBody.setContents(Collections.singletonList(content));
        return requestBody;
    }

    // Hàm tạo Header cho API
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private void appendTeamDetails(StringBuilder prompt, Long teamId, String q) {
        if (q.contains("tiến độ") || q.contains("task") || q.contains("công việc")) {
            List<Task> tasks = taskRepository.findByTeamId(teamId);
            if (!tasks.isEmpty()) {
                prompt.append("  + Công việc hiện tại:\n");
                for (Task t : tasks) {
                    // FIX: Sử dụng getAssignedTo() và getFullName() đúng theo Entity User.java
                    String staff = (t.getAssignedTo() != null) ? t.getAssignedTo().getFullName() : "Chưa giao";
                    prompt.append("    * ").append(t.getTitle())
                        .append(" [Trạng thái: ").append(t.getStatus())
                        .append(", Phụ trách: ").append(staff).append("]\n");
                }
            }
        }

        // Quét thời hạn (Milestones)
        if (q.contains("hạn") || q.contains("deadline") || q.contains("nộp")) {
            teamRepository.findById(teamId).ifPresent(team -> {
                if (team.getClassRoom() != null) {
                    List<Milestone> milestones = milestoneRepository.findByClassRoom_Id(team.getClassRoom().getId());
                    if (!milestones.isEmpty()) {
                        prompt.append("  + Cột mốc quan trọng:\n");
                        milestones.forEach(m -> prompt.append("    * ").append(m.getTitle())
                                .append(" (Hạn: ").append(m.getDueDate()).append(")\n"));
                    }
                }
            });
        }
    }
}
