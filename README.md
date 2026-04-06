# Website Quản Lý Sinh Viên — Đồ Án Môn Thiết Kế Web 

## 1. Giới thiệu

Website front-end mô phỏng hệ thống quản lý danh sách sinh viên dành cho giảng viên. Toàn bộ ứng dụng được xây dựng bằng các công nghệ web cơ bản (HTML, CSS, JavaScript), không sử dụng backend hay cơ sở dữ liệu — dữ liệu được lưu trữ cục bộ trên trình duyệt thông qua `localStorage`.

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích sử dụng |
|-----------|-----------|-----------------|
| **HTML5** | — | Cấu trúc trang, semantic markup (`<nav>`, `<section>`, `<article>`, ...) |
| **CSS3** | — | Giao diện, bố cục Flexbox/Grid, hiệu ứng, responsive media queries |
| **Bootstrap** | 5.x | Layout lưới, component (card, modal, table, form), responsive utility |
| **JavaScript** | ES6+ | Xử lý DOM, sự kiện, lọc/tìm kiếm dữ liệu, validation, localStorage |
| **Font Awesome** | 6.x | Icon vector cho giao diện |

### Kỹ thuật nổi bật
- **localStorage API**: lưu trữ và đồng bộ dữ liệu (tài khoản, thông báo, danh sách sinh viên, điểm số) giữa các phiên truy cập mà không cần backend.
- **Client-side validation**: kiểm tra dữ liệu đầu vào hoàn toàn phía trình duyệt (độ dài mật khẩu, trùng MSSV/email, ràng buộc điểm số).
- **Dynamic DOM manipulation**: render danh sách, bảng và modal động bằng JavaScript thuần, không dùng thư viện rendering.
- **Responsive design**: giao diện thích ứng màn hình nhỏ bằng Bootstrap grid kết hợp CSS media queries tùy chỉnh.

## 3. Kiến trúc hệ thống

Website theo kiến trúc **Multi-Page Application (MPA)** — mỗi chức năng là một file HTML riêng biệt, dùng chung một file CSS (`main.css`) và một file JavaScript (`he_thong.js`).

```
hcmute-student-management/
├── index.html              # Trang đăng nhập (entry point)
├── trang_chu.html          # Trang chủ
├── thong_tin_ca_nhan.html  # Thông tin cá nhân giảng viên
├── thong_bao_tin_tuc.html  # Thông báo & tin tức
├── lich_day.html           # Thời khóa biểu giảng dạy
├── lich_coi_thi.html       # Lịch coi thi
├── nhap_diem.html          # Nhập & quản lý điểm sinh viên
├── khoa_lop.html           # Danh sách khoa và lớp
├── quan_ly_lop_hoc.html    # Quản lý danh sách sinh viên
├── du_lieu_tong.html       # Tổng hợp dữ liệu
├── lam_sach_luu_tru.html   # Công cụ reset localStorage
├── main.css                # Stylesheet dùng chung
└── he_thong.js             # Logic và dữ liệu dùng chung
```

## 4. Chức năng chính

### 4.1. Xác thực người dùng (`index.html`)
- Đăng nhập bằng tài khoản mô phỏng với validation phía client.
- Kiểm tra độ dài tối thiểu mật khẩu (6 ký tự).
- Toggle hiện/ẩn mật khẩu.
- Lưu trạng thái đăng nhập vào `sessionStorage`.

### 4.2. Trang chủ (`trang_chu.html`)
- Hiển thị danh sách thông báo mới nhất được lưu trong `localStorage`.
- Xem chi tiết thông báo và file đính kèm qua modal Bootstrap.

### 4.3. Thông tin cá nhân (`thong_tin_ca_nhan.html`)
- Hiển thị và chỉnh sửa thông tin giảng viên (học vị, email, số điện thoại, ngày sinh, địa chỉ).
- Cập nhật ảnh đại diện từ file cục bộ, lưu dưới dạng base64 trong `localStorage`.
- Đổi mật khẩu với ràng buộc: mật khẩu mới không được trùng mật khẩu cũ.

### 4.4. Thông báo & tin tức (`thong_bao_tin_tuc.html`)
- Soạn và gửi thông báo đến sinh viên, lưu lịch sử vào `localStorage`.
- Chọn đối tượng nhận thông báo (theo lớp/khoa).
- Hỗ trợ đính kèm file.

### 4.5. Lịch dạy & lịch coi thi (`lich_day.html`, `lich_coi_thi.html`)
- Hiển thị thời khóa biểu dạng bảng, lọc theo năm học, học kỳ và tuần.
- Render động dữ liệu lịch từ mảng JavaScript trong `he_thong.js`.

### 4.6. Nhập điểm sinh viên (`nhap_diem.html`)
- Hiển thị danh sách sinh viên theo lớp, nhập điểm quá trình và cuối kỳ.
- **Tự động tính điểm trung bình** theo công thức có trọng số.
- Tự động bôi chọn nội dung ô điểm khi focus (UX).
- **Highlight** hàng sinh viên rớt môn (điểm cuối kỳ < 3 hoặc trung bình < 5).
- Tìm kiếm và lọc sinh viên theo tên/MSSV.
- Lưu toàn bộ điểm vào `localStorage`, hỗ trợ xóa điểm theo lớp.

### 4.7. Quản lý lớp học (`quan_ly_lop_hoc.html`)
- CRUD sinh viên đầy đủ: thêm, xem, chỉnh sửa, xóa.
- Validation: không cho trùng MSSV hoặc email.
- Tìm kiếm theo MSSV, họ tên, email; lọc theo khoa và lớp.
- Toàn bộ dữ liệu được persist trong `localStorage`.

### 4.8. Khoa và lớp (`khoa_lop.html`)
- Hiển thị danh sách lớp theo khoa, lọc động.
- Liên kết trực tiếp đến trang quản lý sinh viên của từng lớp.

## 5. Hướng dẫn chạy

### Tài khoản demo
```
Tên đăng nhập : giangvien
Mật khẩu      : 123456
```

### Chạy với Live Server (khuyến nghị)
1. Mở thư mục project bằng **Visual Studio Code**.
2. Cài extension **Live Server** (Extensions → tìm "Live Server").
3. Mở file `index.html`, nhấn chuột phải → **Open with Live Server**.
4. Trình duyệt tự động mở tại trang đăng nhập.

> Có thể mở file `.html` trực tiếp bằng trình duyệt, nhưng Live Server giúp tránh lỗi CORS khi tải script và hỗ trợ auto-reload khi chỉnh sửa code.

### Lưu ý
- Không cần cài đặt backend hay database.
- Để reset toàn bộ dữ liệu, truy cập trang `lam_sach_luu_tru.html` hoặc xóa `localStorage` thủ công qua DevTools (`F12 → Application → Local Storage`).
