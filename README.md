# CollabSphere (COSRE)

**Hệ thống hỗ trợ việc học theo phương pháp Project-Based Learning**

## Giới thiệu
CollabSphere (COSRE) là một nền tảng web toàn diện được thiết kế để giải quyết các thách thức trong việc quản lý và tổ chức học tập theo dự án (Project-Based Learning - PBL). Hệ thống tích hợp các công cụ giao tiếp, theo dõi tiến độ dự án và cộng tác thời gian thực vào một không gian làm việc duy nhất, giúp sinh viên và giảng viên tối ưu hóa quy trình làm việc và nâng cao hiệu quả làm việc nhóm.

## Kiến trúc hệ thống và Công nghệ
Dựa trên đề xuất kỹ thuật của dự án:

### Phía Server (Backend)
* **Ngôn ngữ:** Java 17+
* **Framework:** Spring Boot 3.x
* **Cơ sở dữ liệu:** PostgreSQL
* **Giao tiếp thời gian thực:**
    * WebSocket (STOMP): Cho hệ thống chat nhóm.
    * WebRTC: Cho gọi video và họp trực tuyến.
* **Dịch vụ đám mây (Cloud Services):**
    * Lưu trữ Media: Cloudinary
    * Hosting: Azure / AWS
* **Tích hợp AI:** Google Gemini API / AWS Bedrock (Hỗ trợ Chatbot và tạo nội dung tự động).

### Phía Client (Frontend)
* **Framework:** ReactJS (Vite)
* **Ngôn ngữ:** TypeScript
* **Giao diện (UI):** Material UI (MUI), Tailwind CSS
* **Quản lý trạng thái:** React Context, Hooks

## Các chức năng chính theo vai trò

### 1. Admin
* Xem danh sách toàn bộ tài khoản trong hệ thống (Staff, Head Department, Lecturer, Student).
* Vô hiệu hóa tài khoản người dùng.
* Xem các báo cáo hệ thống từ người dùng.
* Xem Dashboard thống kê tổng quan.

### 2. Staff
* Import file (Excel/CSV) để tạo tự động môn học, chương trình khung (Syllabus), lớp học.
* Import file để tạo tài khoản Giảng viên và Sinh viên.
* Phân công giảng viên và thêm sinh viên vào lớp học.
* Quản lý danh sách môn học và lớp học.

### 3. Head Department
* Phê duyệt hoặc từ chối các đề tài dự án do giảng viên đề xuất.
* Xem chi tiết các lớp học, môn học và syllabus.
* Phân công đề tài dự án đã được duyệt cho các lớp.

### 4. Lecturer
* **Quản lý dự án:** Tạo dự án dựa trên mục tiêu môn học, sử dụng AI để gợi ý nội dung.
* **Quản lý nhóm:** Tạo nhóm trong lớp, theo dõi tiến độ của từng nhóm.
* **Theo dõi:** Giám sát mức độ đóng góp của từng sinh viên trong nhóm.
* **Đánh giá:** Chấm điểm, gửi phản hồi cho các mốc tiến độ (Milestone) và bài nộp (Checkpoint).
* **Giao tiếp:** Chat và họp video với các nhóm sinh viên.

### 5. Student
* **Không gian làm việc (Workspace):** Quản lý công việc (Task), tạo thẻ, chia việc trên bảng Kanban.
* **Cộng tác:** Chat nhóm thời gian thực, Họp nhóm trực tuyến.
* **Nộp bài:** Tạo và nộp các checkpoint, đánh dấu hoàn thành milestone.
* **Đánh giá chéo (Peer Review):** Đánh giá mức độ đóng góp của các thành viên khác trong nhóm.
* **Hỗ trợ AI:** Sử dụng Chatbot để tìm kiếm ý tưởng và giải pháp.

## Hướng dẫn Cài đặt và Triển khai

### Yêu cầu tiên quyết
* Java Development Kit (JDK) 17 trở lên
* Node.js v18 trở lên
* PostgreSQL
* Maven (thường đi kèm trong source code)

### Bước 1: Clone dự án
Tai source code về máy:
git clone https://github.com/gbao205/Project_LT_Java.git
cd Project_LT_Java

### Bước 2: Cấu hình Backend
1.  Truy cập thư mục backend: `cd backend`
2.  Mở file `src/main/resources/application.properties`.
3.  Cấu hình thông tin cơ sở dữ liệu PostgreSQL của bạn:
    spring.datasource.url=jdbc:postgresql://localhost:5432/collabsphere
    spring.datasource.username=postgres
    spring.datasource.password=mat_khau_cua_ban
4.  Cấu hình các API Key (Cloudinary, Gemini, Mail) nếu cần thiết.

### Bước 3: Chạy Backend
Tại thư mục `backend`, chạy lệnh:
./mvnw spring-boot:run
Server sẽ khởi động tại địa chỉ: `http://localhost:8080`

### Bước 4: Cài đặt và Chạy Frontend
1.  Mở terminal mới và truy cập thư mục frontend: `cd frontend`
2.  Cài đặt các thư viện:
    npm install
3.  Chạy server phát triển:
    npm run dev
Ứng dụng sẽ truy cập được tại: `http://localhost:5173`

## Cấu trúc thư mục
* /backend: Mã nguồn API sử dụng Spring Boot.
* /frontend: Mã nguồn giao diện Web sử dụng ReactJS.
* /docs: Các tài liệu phân tích thiết kế hệ thống.

---
Đồ án môn học: Lập trình Java
