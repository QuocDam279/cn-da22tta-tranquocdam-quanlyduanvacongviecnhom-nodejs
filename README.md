# Hệ Thống Quản Lý Dự Án và Công Việc Nhóm Trực Tuyến (Online Project Management System)

> Đồ án Chuyên ngành Công nghệ Thông tin - Năm học 2025-2026
> [cite_start]**Sinh viên thực hiện:** Trần Quốc Đạm 

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-ReactJS%20%7C%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-NodeJS%20%7C%20Express-339933)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)
![Deploy](https://img.shields.io/badge/Docker-Compose-2496ED)

## 📖 Giới thiệu

[cite_start]Đây là hệ thống quản lý dự án và công việc nhóm trực tuyến, được xây dựng nhằm giải quyết khó khăn trong việc quản lý, phân công và theo dõi tiến độ của các nhóm sinh viên hoặc nhóm làm việc quy mô nhỏ[cite: 28].

[cite_start]Thay vì sử dụng các công cụ chat rời rạc (Zalo, Messenger) hay các hệ thống quá phức tạp (Jira), dự án cung cấp một không gian làm việc tập trung, trực quan và dễ sử dụng[cite: 39, 41]. [cite_start]Hệ thống được phát triển dựa trên **Kiến trúc Microservices**, đảm bảo tính linh hoạt, khả năng mở rộng và chịu lỗi cao[cite: 30, 151].

## 🚀 Tính năng chính

* **🔐 Quản lý xác thực & Người dùng:**
    * [cite_start]Đăng ký, Đăng nhập bảo mật với JWT[cite: 277].
    * [cite_start]Hỗ trợ đăng nhập nhanh bằng **Google OAuth 2.0**[cite: 553].
    * [cite_start]Quản lý hồ sơ cá nhân (Profile)[cite: 580].
* **👥 Quản lý Nhóm (Teams):**
    * [cite_start]Tạo không gian làm việc nhóm, mời thành viên tham gia[cite: 374].
    * [cite_start]Phân quyền Trưởng nhóm (Leader) và Thành viên (Member)[cite: 430].
* **📂 Quản lý Dự án (Projects):**
    * [cite_start]Khởi tạo dự án, thiết lập thời gian bắt đầu/kết thúc[cite: 375].
    * [cite_start]Theo dõi tiến độ tổng quan qua biểu đồ[cite: 588].
* **✅ Quản lý Công việc (Tasks):**
    * [cite_start]Tạo tác vụ, gán người thực hiện (Assignee), đặt Deadline[cite: 376].
    * [cite_start]Cập nhật trạng thái (Todo, In Progress, Done) bằng kéo thả (Drag & Drop)[cite: 439].
* **💬 Tương tác & Thông báo:**
    * [cite_start]Bình luận, thảo luận trực tiếp trong từng công việc[cite: 377].
    * [cite_start]Hệ thống thông báo thời gian thực (Real-time Notifications)[cite: 593].

## 🛠️ Công nghệ sử dụng

### Frontend (Client)
* [cite_start]**Framework:** ReactJS, Vite [cite: 228, 239]
* [cite_start]**UI/CSS:** Tailwind CSS [cite: 218]
* [cite_start]**Data Fetching:** TanStack Query [cite: 467]
* [cite_start]**Charts:** Recharts [cite: 467]

### Backend (Server)
* [cite_start]**Runtime:** NodeJS (v20 Alpine) [cite: 463]
* [cite_start]**Framework:** ExpressJS [cite: 201]
* [cite_start]**Database:** MongoDB (NoSQL) [cite: 269]
* [cite_start]**Authentication:** JWT, Google OAuth 2.0 [cite: 291, 553]

### Infrastructure
* [cite_start]**Architecture:** Microservices [cite: 146]
* [cite_start]**Gateway:** API Gateway [cite: 161]
* [cite_start]**Containerization:** Docker, Docker Compose [cite: 323, 515]

## 🏗️ Kiến trúc hệ thống (Microservices Map)

Hệ thống bao gồm các dịch vụ độc lập chạy trên Docker, kết nối qua mạng nội bộ:

| Dịch vụ | Port (Local) | Chức năng |
| :--- | :--- | :--- |
| **API Gateway** | `3000` | [cite_start]Cổng kết nối duy nhất, điều hướng request [cite: 503] |
| **Frontend** | `5173` | [cite_start]Giao diện người dùng [cite: 523] |
| **Auth Service** | `5001` | [cite_start]Xử lý đăng ký, đăng nhập, Token [cite: 569] |
| **Team Service** | `5002` | [cite_start]Quản lý nhóm và thành viên [cite: 570] |
| **Project Service** | `5003` | [cite_start]Quản lý dự án [cite: 570] |
| **Task Service** | `5004` | [cite_start]Quản lý công việc, bình luận [cite: 570] |
| **Notification** | `5005` | [cite_start]Quản lý thông báo [cite: 571] |
| **Mail Service** | `5006` | [cite_start]Gửi email thông báo [cite: 571] |
| **Activity Log** | `5007` | [cite_start]Ghi nhật ký hoạt động [cite: 571] |

## ⚙️ Hướng dẫn Cài đặt & Triển khai

Dự án đã được đóng gói hoàn chỉnh với **Docker Compose**. Bạn chỉ cần cài đặt Docker để chạy toàn bộ hệ thống.

### 1. Yêu cầu (Prerequisites)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* Git

### 2. Cài đặt (Installation)

**Bước 1: Clone dự án**
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
Bước 2: Cấu hình biến môi trường Hệ thống yêu cầu file .env cho từng dịch vụ. Dưới đây là cấu hình mẫu cơ bản (tham khảo từ source code):

Tại services/api-gateway/.env:

Đoạn mã

PORT=3000
JWT_SECRET=quocdamchuyennganh2025
AUTH_SERVICE_URL=http://auth-service:5001/api/auth
TEAM_SERVICE_URL=http://team-service:5002/api/teams
PROJECT_SERVICE_URL=http://project-service:5003/api/projects
TASK_SERVICE_URL=http://task-service:5004/api/tasks
NOTIFICATION_SERVICE_URL=http://notification-service:5005/api/notifications

[Lưu ý: Các service backend khác cũng cần file .env tương tự với PORT tương ứng] 

Tại frontend/.env:

Đoạn mã

VITE_API_URL=http://localhost:3000/api


Bước 3: Khởi chạy với Docker Compose Tại thư mục gốc của dự án, chạy lệnh:

Bash

docker-compose up -d --build
Lệnh này sẽ tự động build các images và khởi chạy 10 containers (bao gồm Database, Backend services, Gateway và Frontend).
+1

Bước 4: Truy cập hệ thống

Web App: http://localhost:5173

API Endpoint: http://localhost:3000

📂 Cấu trúc thư mục
project-root/
├── frontend/                 # ReactJS Source code [cite: 453]
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.js
├── services/                 # Backend Microservices [cite: 477]
│   ├── api-gateway/          # NodeJS Proxy Gateway
│   ├── auth-service/
│   ├── team-service/
│   ├── project-service/
│   ├── task-service/
│   └── notification-service/
├── docker-compose.yml        # Orchestration Config [cite: 515]
└── README.md
👨‍💻 Tác giả
Trần Quốc Đạm

MSSV: 110122045 - Lớp: DA22TTA 

Khoa Công nghệ Thông tin - Trường Kỹ Thuật và Công Nghệ


Dự án này là sản phẩm thuộc Đồ án chuyên ngành học kỳ I, năm học 2025-2026.
