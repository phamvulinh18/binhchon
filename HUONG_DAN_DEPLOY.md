# Hướng Dẫn Deploy Google Apps Script & Kết Nối Web App

Tài liệu này hướng dẫn chi tiết cách tạo Google Sheet, cài đặt Google Apps Script làm backend, lấy link API Web App, và cấu hình vào mã nguồn frontend để chạy hệ thống quay thưởng Locket Gold.

---

## 📋 Mục lục
1. [Bước 1: Tạo Google Sheet](#bước-1-tạo-google-sheet)
2. [Bước 2: Mở và dán mã nguồn vào Google Apps Script](#bước-2-mở-và-dán-mã-nguồn-vào-google-apps-script)
3. [Bước 3: Triển khai (Deploy) thành Web App](#bước-3-triển-khai-deploy-thành-web-app)
4. [Bước 4: Cấp quyền truy cập (Authorization)](#bước-4-cấp-quyền-truy-cập-authorization)
5. [Bước 5: Cập nhật URL API vào frontend](#bước-5-cập-nhật-url-api-vào-frontend)

---

## 🛠️ Hướng dẫn chi tiết

### Bước 1: Tạo Google Sheet
1. Truy cập [Google Sheets (Trình duyệt Bảng tính)](https://sheets.google.com) và tạo một bảng tính mới trống (Blank).
2. Đặt tên bảng tính ở góc trên bên trái (ví dụ: `Danh Sách Quay Thưởng Locket Gold`).
3. Bạn **không cần tạo tiêu đề cột trước**. Hệ thống sẽ tự động tạo dòng tiêu đề gồm:
   - `Thời gian`
   - `Họ và tên`
   - `Gmail`
   - `Số điện thoại Zalo`
   - `Trạng thái mua hàng`
   khi có lượt gửi đầu tiên.

### Bước 2: Mở và dán mã nguồn vào Google Apps Script
1. Trên thanh menu của Google Sheet, chọn **Tiện ích mở rộng** (Extensions) ➔ **Apps Script**.
2. Một dự án Apps Script mới sẽ mở ra. Đặt tên cho dự án (ví dụ: `Locket Gold Backend`).
3. Xóa toàn bộ mã mặc định (`function myFunction() { ... }`) trong cửa sổ code.
4. Mở tệp [Code.gs](file:///Users/macbookpro/Downloads/binhchon/Code.gs) vừa được tạo trong thư mục dự án của bạn, sao chép toàn bộ mã nguồn và dán vào cửa sổ Apps Script.
5. Nhấp vào biểu tượng **Lưu** (Save 💾) trên thanh công cụ hoặc nhấn `Ctrl + S` (`Cmd + S` trên Mac).

### Bước 3: Triển khai (Deploy) thành Web App
1. Ở góc trên bên phải giao diện Apps Script, nhấp vào nút **Triển khai** (Deploy) ➔ Chọn **Triển khai mới** (New deployment).
2. Trong hộp thoại hiện ra, nhấp vào biểu tượng bánh răng bên cạnh chữ "Chọn loại" (Select type) ➔ Chọn **Ứng dụng web** (Web app).
3. Thiết lập các thông số cấu hình chính xác như sau:
   - **Mô tả** (Description): `Locket Gold Lucky Draw API v1`
   - **Thực thi dưới dạng** (Execute as): **Tôi (Địa chỉ Gmail của bạn)** (Me - your-email@gmail.com).
   - **Ai có quyền truy cập** (Who has access): **Bất kỳ ai** (Anyone).
     > [!IMPORTANT]
     > Bắt buộc phải chọn **Bất kỳ ai** (Anyone) để người dùng bên ngoài có thể gửi dữ liệu lên Sheet mà không cần đăng nhập tài khoản Google của bạn. Tránh chọn "Bất kỳ ai có tài khoản Google" hoặc "Chỉ mình tôi".

4. Nhấp vào nút **Triển khai** (Deploy).

### Bước 4: Cấp quyền truy cập (Authorization)
Nếu đây là lần đầu bạn chạy script, Google sẽ yêu cầu cấp quyền truy cập bảng tính:
1. Nhấp vào nút **Cấp quyền truy cập** (Authorize access).
2. Chọn tài khoản Google của bạn.
3. Google sẽ hiển thị cảnh báo "Google chưa xác minh ứng dụng này" (Google hasn't verified this app).
   - Nhấp vào chữ **Nâng cao** (Advanced) ở phía dưới bên trái.
   - Nhấp tiếp vào đường link **Đi tới Locket Gold Backend (không an toàn)** / **Go to Locket Gold Backend (unsafe)**.
4. Nhấp vào nút **Cho phép** (Allow) ở màn hình tiếp theo.
5. Sau khi triển khai hoàn tất, Google sẽ hiển thị một hộp thoại chứa **URL của ứng dụng web** (Web app URL). Nó sẽ có định dạng như sau:
   `https://script.google.com/macros/s/AKfycb.../exec`
6. Nhấp vào nút **Sao chép** (Copy) để lưu link này vào Clipboard.

### Bước 5: Cập nhật URL API vào frontend
1. Mở file [script.js](file:///Users/macbookpro/Downloads/binhchon/script.js) trong dự án của bạn bằng trình soạn thảo mã nguồn.
2. Tìm dòng thứ 7:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   ```
3. Thay thế `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'` bằng URL bạn vừa copy ở Bước 4 (nhớ giữ nguyên cặp dấu nháy đơn). Ví dụ:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXxX..._xXxX/exec';
   ```
4. Lưu tệp tin lại.

---

## ⚡ Cập nhật Code Apps Script sau này (Nếu có chỉnh sửa)
Nếu sau này bạn chỉnh sửa file `Code.gs` trên Apps Script, bạn cần làm theo các bước sau để thay đổi có hiệu lực:
1. Nhấp vào **Triển khai** (Deploy) ➔ **Quản lý các bản triển khai** (Manage deployments).
2. Chọn bản triển khai hiện tại của bạn, nhấp vào biểu tượng **Chỉnh sửa** (Edit ✏️).
3. Tại phần **Phiên bản** (Version), chọn **Phiên bản mới** (New version).
4. Nhấp **Triển khai** (Deploy). Link API của bạn sẽ được giữ nguyên không đổi.
