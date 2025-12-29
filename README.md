# Hệ Thống Quản Lý Dự Án và Công Việc Nhóm Trực Tuyến

> Đồ án Chuyên ngành Công nghệ Thông tin – Năm học 2025–2026  

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-ReactJS%20%7C%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-NodeJS%20%7C%20Express-339933)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)
![Deploy](https://img.shields.io/badge/Docker-Compose-2496ED)

## 📖 Giới thiệu

Đây là hệ thống quản lý dự án và công việc nhóm trực tuyến, được xây dựng nhằm giải quyết các khó khăn trong việc quản lý, phân công và theo dõi tiến độ của các nhóm sinh viên hoặc các nhóm làm việc quy mô nhỏ.

Thay vì sử dụng các công cụ chat rời rạc như Zalo, Messenger hoặc các hệ thống quản lý phức tạp như Jira, dự án cung cấp một không gian làm việc tập trung, trực quan và dễ sử dụng. Hệ thống được phát triển dựa trên **kiến trúc Microservices**, đảm bảo tính linh hoạt, khả năng mở rộng và khả năng chịu lỗi cao.

## 🚀 Tính năng chính

### 🔐 Quản lý xác thực & Người dùng
- Đăng ký, đăng nhập bảo mật bằng **JWT**
- Hỗ trợ đăng nhập nhanh bằng **Google OAuth 2.0**
- Quản lý hồ sơ cá nhân (Profile)

### 👥 Quản lý Nhóm (Teams)
- Tạo không gian làm việc nhóm, mời thành viên tham gia
- Phân quyền Trưởng nhóm (Leader) và Thành viên (Member)

### 📂 Quản lý Dự án (Projects)
- Khởi tạo dự án, thiết lập thời gian bắt đầu và kết thúc
- Theo dõi tiến độ tổng quan của dự án thông qua biểu đồ

### ✅ Quản lý Công việc (Tasks)
- Tạo tác vụ, gán người thực hiện (Assignee), thiết lập hạn hoàn thành (Deadline)
- Cập nhật trạng thái công việc (Todo, In Progress, Done) bằng thao tác kéo thả (Drag & Drop)

### 💬 Tương tác & Thông báo
- Bình luận và thảo luận trực tiếp trong từng công việc
- Hệ thống thông báo khi có thay đổi hoặc hoạt động mới

## 🛠️ Công nghệ sử dụng

### Frontend (Client)
- **Framework:** ReactJS, Vite  
- **UI / CSS:** Tailwind CSS  
- **Data Fetching:** TanStack Query  
- **Charts:** Recharts  

### Backend (Server)
- **Runtime:** NodeJS (v20 – Alpine)  
- **Framework:** ExpressJS  
- **Database:** MongoDB (NoSQL)  
- **Authentication:** JWT, Google OAuth 2.0  

### Infrastructure
- **Architecture:** Microservices  
- **Gateway:** API Gateway  
- **Containerization:** Docker, Docker Compose  

## 🏗️ Kiến trúc hệ thống (Microservices Map)

Hệ thống bao gồm các dịch vụ độc lập chạy trong các container Docker và giao tiếp với nhau thông qua mạng nội bộ:

| Dịch vụ | Port (Local) | Chức năng |
| :--- | :--- | :--- |
| **API Gateway** | `3000` | Cổng kết nối trung tâm, điều hướng request |
| **Frontend** | `5173` | Giao diện người dùng |
| **Auth Service** | `5001` | Xử lý đăng ký, đăng nhập, xác thực |
| **Team Service** | `5002` | Quản lý nhóm và thành viên |
| **Project Service** | `5003` | Quản lý dự án |
| **Task Service** | `5004` | Quản lý công việc và bình luận |
| **Notification Service** | `5005` | Quản lý thông báo |
| **Mail Service** | `5006` | Gửi email thông báo |
| **Activity Log Service** | `5007` | Ghi nhật ký hoạt động |

## ⚙️ Hướng dẫn Cài đặt & Triển khai

Dự án đã được đóng gói hoàn chỉnh với **Docker Compose**. Bạn chỉ cần cài đặt Docker để chạy toàn bộ hệ thống.

### 1. Yêu cầu (Prerequisites)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* Git

### 2. Cài đặt (Installation)

**Bước 1: Clone dự án**
```bash
git clone https://github.com/QuocDam279/cn-da22tta-tranquocdam-quanlyduanvacongviecnhom-nodejs.git
cd cn-da22tta-tranquocdam-quanlyduanvacongviecnhom-nodejs
```
**Bước 2: Cấu hình biến môi trường: Đưa các file .env vào từng services và thư mục frontend**

**Bước 3: Đưa file docker-compose.yml vào thư mục dự án, khởi chạy với Docker Compose**
```bash
Tại thư mục gốc của dự án, chạy lệnh:
docker-compose up -d --build
```
**Bước 4: Truy cập hệ thống**
http://localhost:5173

**Cấu trúc thư mục**
```bash
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
```
### 👨‍💻 Giảng viên hướng dẫn
ThS. Nguyễn Ngọc Đan Thanh

### 👨‍💻 Tác giả
- Họ và tên: Trần Quốc Đạm
- MSSV: 110122045
- Lớp: DA22TTA
- Khoa Công nghệ Thông tin
- Email: tranquocdam2792004@gmail.com



