# Hệ Thống Quản Lý Dự Án và Công Việc Nhóm Trực Tuyến
(Online Project and Team Work Management System)

> Đồ án chuyên ngành Công nghệ Thông tin - Năm học 2025-2026

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)

## 📖 Giới thiệu (Introduction)

Dự án được xây dựng nhằm giải quyết các khó khăn trong việc quản lý, phân công và theo dõi tiến độ công việc của sinh viên và các nhóm làm việc nhỏ. Hệ thống cung cấp một không gian làm việc tập trung, thay thế cho các phương thức quản lý thủ công rời rạc (Zalo, Messenger) với các tính năng trực quan, dễ sử dụng.

Hệ thống được thiết kế dựa trên kiến trúc **Microservices**, sử dụng **NodeJS** cho backend và **ReactJS** cho frontend, toàn bộ được đóng gói và triển khai trên **Docker**.

## 🚀 Tính năng chính (Key Features)

* **Quản lý người dùng & Xác thực:**
    * Đăng ký, Đăng nhập (JWT Authentication).
    * Hỗ trợ đăng nhập nhanh bằng **Google OAuth 2.0**.
    * Quản lý hồ sơ cá nhân.
* **Quản lý Nhóm & Dự án:**
    * Tạo nhóm làm việc (Workspace), mời thành viên.
    * Tạo dự án, thiết lập thời gian và kế hoạch tổng quan.
    * Theo dõi tiến độ dự án qua biểu đồ.
* **Quản lý Công việc (Tasks):**
    * Tạo công việc, gán người thực hiện (Assignee).
    * Cập nhật trạng thái (Todo, In Progress, Done) bằng kéo thả (Drag & Drop) hoặc chỉnh sửa trực tiếp.
    * Đặt độ ưu tiên và hạn hoàn thành (Deadline).
* **Cộng tác & Thông báo:**
    * Bình luận (Comments) thảo luận trực tiếp trên từng công việc.
    * Hệ thống thông báo thời gian thực (Notifications) khi có thay đổi.
* **Giao diện Dashboard:**
    * Xem lịch làm việc cá nhân.
    * Thống kê công việc cần làm và sắp đến hạn.

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (Client)
* **Core:** ReactJS, Vite
* **Styling:** Tailwind CSS
* **State Management:** TanStack Query
* **Data Visualization:** Recharts
* **Icons & UI:** Lucide React, React Icons

### Backend (Server)
* **Runtime:** NodeJS
* **Framework:** ExpressJS
* **Database:** MongoDB (NoSQL)
* **Authentication:** JSON Web Token (JWT), Google OAuth

### Infrastructure & DevOps
* **Architecture:** Microservices (Auth, Team, Project, Task, Notification)
* **Gateway:** API Gateway (NodeJS Proxy)
* **Containerization:** Docker, Docker Compose

## 🏗️ Kiến trúc hệ thống (Architecture)

Hệ thống bao gồm các dịch vụ độc lập giao tiếp qua API Gateway:

| Service Name | Port (Local) | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | `5173` | Giao diện người dùng (ReactJS/Vite) |
| **API Gateway** | `3000` | Cổng kết nối trung tâm, điều hướng request |
| **Auth Service** | `5001` | Xử lý đăng ký, đăng nhập, JWT |
| **Team Service** | `5002` | Quản lý nhóm và thành viên |
| **Project Service** | `5003` | Quản lý thông tin dự án |
| **Task Service** | `5004` | Quản lý công việc và bình luận |
| **Notification** | `5005` | Quản lý thông báo |
| **Mail Service** | `5006` | Gửi email thông báo |

## ⚙️ Cài đặt và Triển khai (Installation)

Dự án được cấu hình sẵn với **Docker Compose** để chạy toàn bộ hệ thống chỉ với một lệnh.

### 1. Yêu cầu (Prerequisites)
* Docker & Docker Compose
* Node.js (nếu muốn chạy local từng service không qua Docker)
* Git

### 2. Hướng dẫn chạy (Run with Docker)

**Bước 1: Clone dự án**
```bash
git clone [https://github.com/your-username/project-name.git](https://github.com/your-username/project-name.git)
cd project-name

👤 Thông tin tác giả

Họ và tên: Trần Quốc Đạm

MSSV: 110122045

Lớp: DA22TTA

Khoa: Công nghệ Thông tin

Email: tranquocdam2792004@gmail.com

Số điện thoại: 0362922457
