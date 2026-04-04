# ĐỒ ÁN CUỐI KỲ MÔN THIẾT KẾ WEB CƠ BẢN

## 1. Tên đề tài
**Đề tài 5: Tạo website quản lý danh sách sinh viên**

Đây là website front-end mô phỏng một hệ thống quản lý danh sách sinh viên dành cho giảng viên. Website hỗ trợ các chức năng cơ bản như đăng nhập, xem thông tin cá nhân, nhận thông báo, gửi thông báo cho sinh viên, xem lịch dạy, xem lịch coi thi, quản lý lớp học và nhập điểm sinh viên. Website được xây dựng bằng HTML, CSS, Bootstrap và JavaScript cơ bản, không sử dụng backend hoặc cơ sở dữ liệu.

## 2. Thành viên nhóm
- Lê Trần Diệu Quyên - 24126189 - Nhóm trưởng
- Hoàng Trung Kiên - 24126107 - Thành viên
- Trần Anh Khoa - 24126105 - Thành viên

## 3. Phân công công việc
- **Lê Trần Diệu Quyên**: phụ trách khung hệ thống và giao diện chung. Công việc chính gồm:
 + Lên ý tưởng đề tài, xây dựng cấu trúc thư mục, thiết kế layout tổng thể, tạo sidebar/header/footer dùng chung.
 + Xây dựng trang chủ.
 + Xây dựng trang lịch dạy.
 + Xây dựng trang lịch coi thi.
 + Đồng bộ giao diện, tích hợp Bootstrap và kiểm tra responsive. 
 Kết quả đạt được là hoàn thiện bộ khung giao diện thống nhất cho toàn website, các trang liên kết ổn định, giao diện đồng bộ và dễ sử dụng.

- **Hoàng Trung Kiên**: phụ trách hồ sơ cá nhân và thông báo. Công việc chính gồm:
 + Xây dựng trang thông tin cá nhân, chức năng chỉnh sửa thông tin, cập nhật ảnh đại diện, đổi mật khẩu
 + Xây dựng trang thông báo và tin tức, form gửi thông báo, modal xem chi tiết và lưu dữ liệu bằng localStorage. 
 + Xây dựng trang nhập điểm.
  Kết quả đạt được là hoàn thiện nhóm chức năng liên quan đến hồ sơ người dùng, thông báo và nhập điểm.

- **Trần Anh Khoa**: phụ trách quản lý học vụ và tài liệu. Công việc chính gồm:
 + Xây dựng trang đăng nhập.
 + Xây dựng trang khoa và lớp.
 + Xây dựng trang quản lý lớp học.
 + Kiểm thử các chức năng, tổng hợp README và hỗ trợ chuẩn bị báo cáo/demo. 
 Kết quả đạt được là hoàn thiện các chức năng nghiệp vụ chính của website và hỗ trợ hoàn thiện tài liệu nộp bài.

## 4. Tiến độ thực hiện
- **Giai đoạn 1**: Phân tích yêu cầu đề tài, xác định số trang, chức năng chính và hướng thiết kế giao diện. 
 + Thành viên tham gia: cả nhóm. 
 + Tiến độ: 100%.

- **Giai đoạn 2**: Xây dựng cấu trúc HTML, bố cục trang, thanh điều hướng và các thành phần dùng chung. 
 + Thành viên phụ trách chính: Lê Trần Diệu Quyên. 
 + Tiến độ: 100%.

- **Giai đoạn 3**: Phát triển các trang chức năng và xử lý JavaScript cho từng màn hình. 
 + Thành viên phụ trách chính: Hoàng Trung Kiên và Trần Anh Khoa. 
 + Tiến độ: 100%.

- **Giai đoạn 4**: Tích hợp dữ liệu localStorage, kiểm tra logic hoạt động, sửa lỗi giao diện và liên kết.
 + Thành viên tham gia: cả nhóm.
 + Tiến độ: 100%.

- **Giai đoạn 5**: Bổ sung Bootstrap, cải thiện semantic HTML, đồng bộ chiều rộng giao diện và responsive cơ bản.
 + Thành viên phụ trách chính: Lê Trần Diệu Quyên.
 + Tiến độ: 100%.

- **Giai đoạn 6**: Hoàn thiện README, chuẩn bị nội dung báo cáo và demo sản phẩm.
 + Thành viên phụ trách chính: Trần Anh Khoa, phối hợp cùng cả nhóm.
 + Tiến độ: 100%.

## 5. Chức năng chính của website
Website hiện có **9 trang HTML** và các chức năng chính sau:

### 5.1. Đăng nhập hệ thống
- Cho phép giảng viên đăng nhập bằng tài khoản mô phỏng.
- Có kiểm tra dữ liệu nhập vào (tối thiểu 6 kí tự).
- Có chức năng hiện/ẩn mật khẩu.

### 5.2. Trang chủ giảng viên
- Hiển thị danh sách thông báo mới.
- Cho phép xem chi tiết từng thông báo.
- Hỗ trợ hiển thị file đính kèm trong thông báo.

### 5.3. Quản lý thông tin cá nhân
- Hiển thị đầy đủ thông tin giảng viên.
- Cho phép chỉnh sửa học vị, email, số điện thoại, ngày sinh, địa chỉ.
- Hỗ trợ cập nhật ảnh đại diện.
- Có chức năng đổi mật khẩu với kiểm tra dữ liệu hợp lệ (mật khẩu mới không được trùng với mật khẩu cũ).

### 5.4. Thông báo và tin tức
- Gửi thông báo đến sinh viên.
- Chọn đối tượng nhận thông báo.
- Đính kèm file vào thông báo.
- Lưu lịch sử thông báo bằng localStorage.
- Xem chi tiết thông báo đã gửi.

### 5.5. Lịch dạy
- Hiển thị thời khóa biểu giảng dạy theo năm học, học kỳ và tuần.
- Hỗ trợ lọc dữ liệu theo bộ chọn tương ứng.

### 5.6. Lịch coi thi
- Hiển thị lịch coi thi của giảng viên.
- Hỗ trợ lọc theo năm học và học kỳ.

### 5.7. Nhập điểm sinh viên
- Hiển thị danh sách sinh viên theo lớp.
- Nhập điểm quá trình và điểm cuối kỳ.
- Tự động tính điểm trung bình.
- Tự động bôi đen nội dung trong ô điểm khi bấm vào để nhập nhanh, không cần xóa thủ công.
- Tìm kiếm và lọc sinh viên.
- Highlight vàng sinh viên có rớt môn: điểm cuối kỳ dưới 3 hoặc điểm trung bình dưới 5.
- Cho phép xóa toàn bộ điểm của lớp đang chọn (nếu nhập nhầm).

### 5.8. Khoa và lớp
- Hiển thị danh sách lớp theo khoa.
- Có thể lọc lớp theo từng khoa.
- Cho phép chuyển sang trang xem danh sách sinh viên của lớp tương ứng.

### 5.9. Quản lý lớp học
- Hiển thị danh sách sinh viên trong lớp.
- Tìm kiếm sinh viên theo MSSV, họ tên hoặc email.
- Lọc theo khoa và lớp.
- Thêm sinh viên mới (không được trùng MSSV, email).
- Chỉnh sửa sinh viên.
- Xóa sinh viên.
- Dữ liệu được lưu bằng localStorage.

## 6. Công nghệ sử dụng
- **HTML5**: xây dựng cấu trúc trang web và semantic HTML.
- **CSS3**: thiết kế giao diện, bố cục, màu sắc, hiệu ứng, responsive cơ bản.
- **Bootstrap 5**: hỗ trợ card, button, table, form control, layout và responsive.
- **JavaScript cơ bản**: xử lý sự kiện, form, lọc dữ liệu, thay đổi giao diện, localStorage.
- **Font Awesome**: hiển thị icon cho giao diện.

## 7. Cấu trúc source code
- `dang_nhap.html`: Trang đăng nhập.
- `thong_tin_ca_nhan.html`: Trang thông tin cá nhân.
- `trang_chu.html`: Trang chủ giảng viên.
- `thong_bao_tin_tuc.html`: Trang thông báo & Tin tức.
- `lich_day.html`: Trang lịch dạy.
- `lich_coi_thi.html`: Trang lịch coi thi.
- `nhap_diem.html`: Trang nhập điểm sinh viên.
- `khoa_lop.html`: Trang danh sách khoa và lớp.
- `quan_ly_lop_hoc.html`: Trang quản lý danh sách sinh viên.
- `main.css`: File CSS dùng chung cho toàn bộ hệ thống.
- `he_thong.js`: File JavaScript dùng chung và dữ liệu hệ thống.

## 8. Hướng dẫn chạy chương trình
### Tài khoản demo
- Tên đăng nhập: `giangvien`
- Mật khẩu: `123456`

### Cách chạy
1. Mở project bằng Visual Studio Code.
2. Vào mục **Extensions**.
3. Tìm kiếm extension **Live Server**.
4. Cài đặt extension **Live Server**.
5. Sau khi cài đặt xong, mở file `dang_nhap.html` hoặc bất kì file nào có đuôi `.html`.
6. Nhấn chuột phải vào file và chọn **Open with Live Server**.
7. Trình duyệt sẽ tự động mở website.
8. Nên bắt đầu từ trang đăng nhập để trải nghiệm đúng luồng sử dụng.

Ngoài ra, website cũng có thể mở trực tiếp bằng trình duyệt thông qua file `.html`, tuy nhiên nhóm khuyến nghị sử dụng **Live Server** để:
- Giúp website chạy trên local server ổn định hơn.
- Hạn chế lỗi khi tải file, script và điều hướng giữa các trang.
- Tự động reload khi chỉnh sửa code.
- Thuận tiện cho việc kiểm tra và demo website.

### Lưu ý khi chạy
- Website là front-end thuần, không cần cài backend hay database.
- Dữ liệu người dùng, thông báo, danh sách sinh viên và điểm được lưu bằng `localStorage`.
- Nếu muốn đưa dữ liệu về trạng thái ban đầu, có thể xóa `localStorage` của trình duyệt.

## 9. Đánh giá ngắn về sản phẩm
- Website có 9 trang HTML, đáp ứng được yêu cầu tối thiểu của đồ án.
- Có menu điều hướng dùng chung giữa các trang.
- Khi màn hình thu nhỏ, giao diện hiển thị nút menu để bật/tắt thanh điều hướng, giúp website phù hợp hơn trên thiết bị, màn hình nhỏ.
- Có nhiều chức năng tương tác rõ ràng như tìm kiếm, lọc, thêm/xóa, nhập điểm, validation.
- Có sử dụng HTML, CSS, Bootstrap và JavaScript đúng phạm vi môn học.
- Nội dung website bám theo mô hình quản lý sinh viên và giảng viên thực tế.
