# University Event Admin

Ứng dụng web quản trị cho sự kiện Đại học với tính năng quản lý booth, sinh viên và quét mã QR để theo dõi tham dự.

## Tính năng chính

### 1. Dashboard Tổng quan
- Hiển thị thống kê tổng số booth, sinh viên
- Quick actions để truy cập nhanh các tính năng
- Giao diện khác nhau cho Admin và Booth Manager

### 2. Quản lý Sinh viên (Admin only)
- Thêm, xóa sinh viên
- Tìm kiếm theo tên, mã sinh viên, email, ngành học
- Lưu trữ thông tin: mã SV, họ tên, email, SĐT, ngành học, năm học
- Mỗi sinh viên có mã QR riêng (sử dụng mã sinh viên)

### 3. Quét mã QR
- Chọn booth trước khi quét
- Quét mã QR của sinh viên bằng camera
- Tự động ghi nhận tham dự
- Hiển thị thông báo thành công/lỗi
- Ngăn chặn quét trùng lặp

### 4. Phân quyền
- **Admin**: Quản lý toàn bộ hệ thống, thêm sinh viên, xem tất cả booth
- **Booth Manager**: Chỉ quét QR cho booth được gán

## Công nghệ sử dụng

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **tRPC** - Type-safe API
- **html5-qrcode** - QR code scanner
- **Wouter** - Routing

### Backend
- **Express 4** - Web framework
- **tRPC 11** - API layer
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **Manus OAuth** - Authentication

## Cài đặt và Chạy

### Yêu cầu
- Node.js 18+
- pnpm
- MySQL/TiDB database

### Cài đặt dependencies
```bash
pnpm install
```

### Cấu hình Database
```bash
# Push schema to database
pnpm db:push
```

### Chạy Development Server
```bash
pnpm dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc Database

### Bảng `users`
- Quản lý người dùng và phân quyền
- Roles: `admin`, `user` (booth manager)

### Bảng `booths`
- Thông tin các booth trong sự kiện
- Liên kết với admin quản lý booth

### Bảng `students`
- Thông tin sinh viên
- Mỗi sinh viên có mã QR riêng

### Bảng `attendance`
- Ghi nhận sinh viên tham dự booth
- Lưu thời gian quét và người quét

## Hướng dẫn sử dụng

### Dành cho Admin

1. **Thêm sinh viên**
   - Vào trang "Quản lý Sinh viên"
   - Nhấn "Thêm Sinh viên"
   - Điền thông tin và lưu

2. **Tạo booth** (Cần thêm tính năng này)
   - Hiện tại cần thêm booth qua database
   - Hoặc tạo trang quản lý booth

3. **Gán booth cho user**
   - Cập nhật `adminId` trong bảng `booths`

### Dành cho Booth Manager

1. **Quét mã QR**
   - Vào trang "Quét QR"
   - Chọn booth của bạn
   - Nhấn "Bắt đầu quét"
   - Hướng camera vào mã QR sinh viên
   - Hệ thống tự động ghi nhận

2. **Xem danh sách tham dự** (Cần thêm tính năng này)
   - Hiện tại cần query database
   - Hoặc tạo trang xem attendance

## Triển khai lên Firebase

Xem hướng dẫn chi tiết trong file [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)

## Tính năng cần bổ sung

1. **Quản lý Booth**
   - Trang CRUD booth cho admin
   - Gán booth manager

2. **Xem Attendance**
   - Trang xem danh sách sinh viên đã tham dự booth
   - Xuất báo cáo Excel/PDF

3. **Tạo QR Code**
   - Tự động tạo QR code cho sinh viên
   - Tải xuống QR code hàng loạt

4. **Import/Export**
   - Import danh sách sinh viên từ Excel
   - Export báo cáo tham dự

5. **Dashboard Analytics**
   - Biểu đồ thống kê tham dự
   - Top booth có nhiều lượt tham dự nhất

## Bảo mật

- Sử dụng Manus OAuth cho authentication
- JWT tokens cho session management
- Role-based access control (RBAC)
- Protected API endpoints với tRPC procedures

## License

MIT

## Liên hệ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ qua email hoặc tạo issue.

