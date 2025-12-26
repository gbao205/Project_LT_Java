package com.cosre.backend.service;

import com.cosre.backend.dto.ai.GeminiRequest;
import com.cosre.backend.dto.ai.GeminiResponse;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import java.util.Collections;
import com.cosre.backend.repository.AIChatRepository;
import com.cosre.backend.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired
    private TaskRepository taskRepository; //

    @Autowired
    private TeamMemberRepository teamMemberRepository; //

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    private AIChatRepository aiChatRepository;

    @Autowired
    private UserRepository userRepository;

    // Hàm tạo ngữ cảnh (Context) từ dữ liệu thật
    private String buildSmartPrompt(Long teamId, String userQuestion) {
        StringBuilder prompt = new StringBuilder();

        // 1. Định nghĩa vai trò (Persona)
        prompt.append("Bạn là 'CollabSphere AI' - trợ lý thông minh hỗ trợ sinh viên quản lý dự án và học tập.\n\n");

        // 2. Cung cấp ngữ cảnh dữ liệu (Nếu có teamId hợp lệ)
        if (teamId != null && teamId > 0) {
            try {
                List<Task> tasks = taskRepository.findByTeamId(teamId);
                if (!tasks.isEmpty()) {
                    long totalTasks = tasks.size();
                    long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
                    long percent = totalTasks > 0 ? (completedTasks * 100 / totalTasks) : 0;

                    Map<String, Long> contribution = tasks.stream()
                            .filter(t -> t.getAssignedTo() != null)
                            .collect(Collectors.groupingBy(
                                    t -> t.getAssignedTo().getFullName(),
                                    Collectors.counting()
                            ));

                    prompt.append("--- DỮ LIỆU DỰ ÁN HIỆN TẠI (Tham khảo nếu cần) ---\n");
                    prompt.append("- Tổng task: ").append(totalTasks).append("\n");
                    prompt.append("- Đã xong: ").append(completedTasks).append(" (").append(percent).append("%)\n");
                    prompt.append("- Phân công: ").append(contribution).append("\n");
                    prompt.append("---------------------------------------------------\n\n");
                }
            } catch (Exception e) {
                // Nếu lỗi lấy dữ liệu thì bỏ qua, vẫn cho chat bình thường
                System.err.println("Không thể lấy dữ liệu dự án: " + e.getMessage());
            }
        }

        // 3. Hướng dẫn xử lý (Instruction)
        prompt.append("HƯỚNG DẪN TRẢ LỜI:\n");
        prompt.append("1. Nếu câu hỏi liên quan đến 'tiến độ', 'nhóm', 'ai làm nhiều nhất', 'công việc'... hãy phân tích DỮ LIỆU DỰ ÁN ở trên để trả lời.\n");
        prompt.append("2. Nếu câu hỏi là về kiến thức (ví dụ: 'Code Java thế nào', 'Giải thích Scrum', 'Ý tưởng làm web')... hãy trả lời dựa trên kiến thức rộng lớn của bạn.\n");
        prompt.append("3. Nếu là câu chào hỏi xã giao, hãy thân thiện và ngắn gọn.\n");
        prompt.append("4. Luôn trả lời bằng Tiếng Việt, giọng văn khuyến khích và hỗ trợ sinh viên.\n\n");

        // 4. Câu hỏi của người dùng
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
        // BƯỚC 1: Lưu câu hỏi của User vào Database ngay lập tức
        saveChatLog(userId, userQuestion, "USER");

        String aiResponseText = "Xin lỗi, tôi không thể trả lời ngay lúc này.";

        try {
            // BƯỚC 2: Xây dựng Prompt (Ngữ cảnh + Câu hỏi)
            String fullPrompt = buildSmartPrompt(teamId, userQuestion);

            // BƯỚC 3: Cấu hình Header & Body cho Request gửi Google Gemini
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Tạo cấu trúc JSON: { contents: [ { parts: [ { text: "..." } ] } ] }
            GeminiRequest requestBody = new GeminiRequest();
            GeminiRequest.Part part = new GeminiRequest.Part();
            part.setText(fullPrompt);

            GeminiRequest.Content content = new GeminiRequest.Content();
            content.setParts(Collections.singletonList(part));

            requestBody.setContents(Collections.singletonList(content));
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

            // BƯỚC 4: Gọi API
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    GeminiResponse.class
            );

            // BƯỚC 5: Phân tích (Parse) kết quả trả về
            if (response.getBody() != null &&
                    response.getBody().getCandidates() != null &&
                    !response.getBody().getCandidates().isEmpty()) {

                // Lấy nội dung text trả lời
                aiResponseText = response.getBody().getCandidates().get(0)
                        .getContent().getParts().get(0).getText();
            }

        } catch (HttpClientErrorException e) {
            // Xử lý lỗi từ phía Google (ví dụ 429 Too Many Requests, 400 Bad Request)
            if (e.getStatusCode().value() == 429) {
                // Nếu là lỗi 429 (Hết lượt/Quá tải) -> Trả về câu thông báo thân thiện
                aiResponseText = "Hiện tại hệ thống AI đang nhận quá nhiều yêu cầu. Bạn vui lòng đợi 1 phút và hỏi lại nhé!";
            } else {
                // Các lỗi khác (400, 401, 403...)
                aiResponseText = "Gặp lỗi kết nối AI (" + e.getStatusCode() + "). Vui lòng thử lại sau.";
            }

            // In lỗi ra console để lập trình viên biết đường sửa
            System.err.println("Lỗi API Gemini: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            // Xử lý lỗi hệ thống chung
            aiResponseText = "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.";
            e.printStackTrace();
        }

        // BƯỚC 6: Lưu câu trả lời của AI vào Database
        saveChatLog(userId, aiResponseText, "AI");

        // Trả về kết quả để hiển thị lên Frontend ngay
        return aiResponseText;
    }

    // Hàm lấy lịch sử chat
    public List<AIChatMessage> getHistory(Long userId) {
        return aiChatRepository.findByUserIdOrderByTimestampAsc(userId);
    }

    @Transactional // Bắt buộc để thực hiện lệnh DELETE
    public void clearHistory(Long userId) {
        aiChatRepository.deleteByUserId(userId);
    }

}
