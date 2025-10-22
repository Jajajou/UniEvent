# Hướng dẫn Triển khai lên Firebase

## Yêu cầu

- Node.js 18+ đã được cài đặt
- Tài khoản Firebase (miễn phí)
- Firebase CLI đã được cài đặt

## Bước 1: Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
```

## Bước 2: Đăng nhập Firebase

```bash
firebase login
```

## Bước 3: Khởi tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Trong terminal, chạy:

```bash
firebase init
```

4. Chọn các tính năng:
   - **Hosting**: Để deploy ứng dụng web
   - **Functions** (tùy chọn): Nếu muốn sử dụng Firebase Functions cho backend

5. Cấu hình Hosting:
   - **Public directory**: `dist` (thư mục build của Vite)
   - **Configure as single-page app**: Yes
   - **Set up automatic builds**: No (hoặc Yes nếu muốn CI/CD)

## Bước 4: Cấu hình Database

### Sử dụng Firebase Firestore

Ứng dụng hiện tại sử dụng MySQL/TiDB. Để triển khai lên Firebase, bạn có 2 lựa chọn:

#### Lựa chọn 1: Sử dụng Firestore (Khuyến nghị cho Firebase)

1. Trong Firebase Console, bật Firestore Database
2. Cập nhật code để sử dụng Firestore thay vì MySQL
3. Cài đặt Firebase SDK:

```bash
pnpm add firebase
```

#### Lựa chọn 2: Giữ MySQL/TiDB và deploy Backend riêng

1. Deploy backend lên Cloud Run, App Engine, hoặc dịch vụ khác
2. Cập nhật `DATABASE_URL` trong environment variables
3. Cấu hình CORS để frontend trên Firebase có thể gọi backend

## Bước 5: Cấu hình Environment Variables

Tạo file `.env.production`:

```env
# Database
DATABASE_URL=your_production_database_url

# OAuth (Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=your_jwt_secret

# App Info
VITE_APP_TITLE=University Event Admin
VITE_APP_LOGO=your_logo_url

# Owner Info
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=your_owner_name

# Built-in APIs
BUILT_IN_FORGE_API_URL=your_forge_api_url
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

## Bước 6: Build ứng dụng

```bash
# Build frontend
pnpm build
```

Lệnh này sẽ tạo thư mục `dist` chứa các file tĩnh đã được tối ưu.

## Bước 7: Deploy lên Firebase

```bash
firebase deploy --only hosting
```

Sau khi deploy thành công, bạn sẽ nhận được URL của ứng dụng, ví dụ:
```
https://your-project-id.web.app
```

## Bước 8: Cấu hình Backend (Nếu cần)

### Sử dụng Firebase Functions

1. Cài đặt dependencies:

```bash
cd functions
pnpm install
```

2. Deploy functions:

```bash
firebase deploy --only functions
```

### Sử dụng Cloud Run (Khuyến nghị cho Express backend)

1. Tạo Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Build và deploy:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/university-event-admin
gcloud run deploy university-event-admin --image gcr.io/PROJECT_ID/university-event-admin --platform managed
```

## Bước 9: Cấu hình Custom Domain (Tùy chọn)

1. Trong Firebase Console, vào **Hosting**
2. Nhấn **Add custom domain**
3. Làm theo hướng dẫn để verify domain và cấu hình DNS

## Lưu ý quan trọng

### Authentication
- Ứng dụng sử dụng Manus OAuth, đảm bảo cấu hình callback URL trong Manus dashboard
- Callback URL: `https://your-domain.com/api/oauth/callback`

### Database
- Nếu sử dụng MySQL/TiDB, đảm bảo database có thể truy cập từ internet
- Cấu hình IP whitelist nếu cần
- Sử dụng SSL/TLS cho kết nối database

### CORS
- Cấu hình CORS trong backend để cho phép frontend truy cập
- Thêm domain Firebase vào whitelist

### Environment Variables
- **KHÔNG** commit file `.env` lên Git
- Sử dụng Firebase Environment Config hoặc Cloud Secret Manager

## Troubleshooting

### Lỗi 404 khi refresh trang
- Đảm bảo cấu hình `rewrites` trong `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Lỗi CORS
- Cấu hình CORS trong backend
- Kiểm tra headers trong response

### Lỗi Database Connection
- Kiểm tra `DATABASE_URL` trong environment variables
- Đảm bảo database có thể truy cập từ Firebase/Cloud Run

## Tài liệu tham khảo

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

