/* /../ =======================================================================
   /../ COMPONENT HE THONG - class My...
   /../ Chi khai bao class truoc de de tim component khung giao dien.
   /../ Phan customElements.define(...) duoc giu o cuoi file de khoi tao sau khi dong bo auth.
   /../ ======================================================================= */

class MySidebar extends HTMLElement {
  connectedCallback() {
    const currentPage = laytranghientai();
    const landingPage = laytrangmacdinhnguoidung(currentUser);

    this.innerHTML = `
      <aside class="sidebar">
        <header class="sidebar-header">
          <a href="${landingPage}" class="logo">
            <img src="https://tracuuxettuyen.hcmute.edu.vn/assets/img/logo/ute_logo.png" alt="Logo HCMUTE">
            <div class="logo-text">
              <span class="logo-sub">Hệ thống <br> quản lý</span>
            </div>
          </a>
        </header>
        <section class="sidebar-account" aria-label="User info">
          <div class="sidebar-account-name">${currentUser?.fullName || "Người dùng"}</div>
          <div class="sidebar-account-meta">
            <span class="user-role-badge ${layclassvaitro(currentUser?.role)}">${layshortvaitro(currentUser?.role)}</span>
            <span class="user-status-badge ${layclasstrangthai(currentUser?.status)}">${laynhantrangthai(currentUser?.status)}</span>
          </div>
        </section>
        <nav class="sidebar-content sidebar-nav" aria-label="Điều hướng chính">
          ${taomenusidebar(currentPage, currentUser)}
        </nav>
        <footer class="sidebar-footer">
          <a href="${LOGIN_PAGE}" class="logout-btn" data-action="logout-system">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Đăng xuất</span>
          </a>
        </footer>
      </aside>
    `;
  }
}

class MyHeader extends HTMLElement {
  connectedCallback() {
    const pendingCount = currentUser?.role === "admin" ? demtongyeucauadminchoduyet() : 0;
    const adminBellMarkup = currentUser?.role === "admin" ? `
      <a
        href="${ACCOUNT_MANAGEMENT_PAGE}#gradeUnlockRequests"
        class="header-bell-link ${pendingCount ? "has-pending" : ""}"
        id="adminRequestBellLink"
        title="Yêu cầu chờ xử lý"
      >
        <i class="fa-solid fa-bell"></i>
        <span class="header-bell-badge" id="adminRequestBellBadge" ${pendingCount ? "" : "hidden"}>
          ${pendingCount > 99 ? "99+" : pendingCount}
        </span>
      </a>
    ` : "";

    this.innerHTML = `
      <header class="header navbar navbar-expand-lg">
        <div class="header-left">
          <button class="menu-toggle" type="button">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
        <div class="header-right">
          ${adminBellMarkup}
          <div class="user header-user">
            <a href="thong_tin_ca_nhan.html" class="teacher-link">
              <span class="header-user-name">${currentUser?.fullName || "Người dùng"}</span>
              <span class="header-user-role">${laynhanvaitro(currentUser?.role)}</span>
            </a>
          </div>
        </div>
      </header>
    `;

    const bellLink = this.querySelector("#adminRequestBellLink");
    bellLink?.addEventListener("click", function (event) {
      danhdayeucauadminchodoc(laynguoidungdangnhap());
      capnhatbieututhongbaoadmin();

      if (laytranghientai() !== ACCOUNT_MANAGEMENT_PAGE) {
        return;
      }

      const target = document.getElementById("gradeUnlockRequests");
      if (!target) {
        return;
      }

      event.preventDefault();
      window.location.hash = "#gradeUnlockRequests";
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

class MyFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <p>Add: No 1 Vo Van Ngan Street, Thu Duc Ward, Ho Chi Minh City</p>
        <p>Tel: (+84 - 028) 38968641</p>
        <p>Email: oia@hcmute.edu.vn</p>
        <p>© 2026 HCMC University of Technology and Education</p>
      </footer>
    `;
  }
}

/* /../ =======================================================================
   /../ DUNG CHUNG + AUTH
   /../ Gom hang so he thong, helper dung chung, dang nhap, dong bo session,
   /../ menu/sidebar va cac tien ich duoc goi lai o nhieu trang.
   /../ ======================================================================= */

/* /../ =======================================================================
   /../ DÙNG CHUNG TOÀN HỆ THỐNG
   /../ Gồm component khung hệ thống, xác thực, phân quyền và helper tái sử dụng
   /../ ======================================================================= */

const LOGIN_PAGE = "index.html";
const ACCOUNT_MANAGEMENT_PAGE = "quan_ly_tai_khoan.html";
const MASTER_DATA_PAGE = "du_lieu_tong.html";
const USER_STORAGE_KEY = "accounts_hcmute";
const SESSION_STORAGE_KEY = "current_session_hcmute";
const LEGACY_PROFILE_STORAGE_KEY = "userInfo";
const AUTH_NOTICE_STORAGE_KEY = "auth_notice_hcmute";
const SYSTEM_LOG_STORAGE_KEY = "system_logs_hcmute";
const SYSTEM_LOG_LIMIT = 300;
const GRADE_STORAGE_KEY = "student_gradebook_hcmute";
const GRADE_LOCK_STORAGE_KEY = "student_grade_lock_state_hcmute";
const GRADE_UNLOCK_REQUEST_STORAGE_KEY = "grade_unlock_requests_hcmute";
const USER_NOTIFICATION_STORAGE_KEY = "user_notifications_hcmute";
const CURRENT_SCHOOL_YEAR = "2025-2026";
const CURRENT_SEMESTER = "Học kỳ 2";
const ADMIN_ONLY_PAGES = new Set([
  ACCOUNT_MANAGEMENT_PAGE,
  MASTER_DATA_PAGE
]);

const ROLE_CONFIG = {
  admin: { label: "Quản trị viên", shortLabel: "Admin", badgeClass: "is-admin" },
  lecturer: { label: "Giảng viên", shortLabel: "Giảng viên", badgeClass: "is-lecturer" }
};

const STATUS_CONFIG = {
  active: { label: "Hoạt động", badgeClass: "is-active" },
  locked: { label: "Đã khóa", badgeClass: "is-locked" }
};


let users = [];
let currentUser = null;

function laytranghientai() {
  return window.location.pathname.split("/").pop() || LOGIN_PAGE;
}

function taomaidinhdanh(prefix = "usr") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function docjsonlocalstorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function luujsonlocalstorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function laythoigianhethong() {
  return new Date().toISOString();
}

function dinhdangthoigianhethong(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

function xoadulieunhatkyhethong() {
  try {
    localStorage.removeItem(SYSTEM_LOG_STORAGE_KEY);
  } catch (error) {
    return false;
  }

  return true;
}

xoadulieunhatkyhethong();

function xoaphancongvayeucaulichcu() {
  [
    "teaching_assignments_hcmute",
    "exam_assignments_hcmute",
    "teaching_change_requests_hcmute"
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Bỏ qua dữ liệu cũ không thể xóa.
    }
  });
}

xoaphancongvayeucaulichcu();

function ghinhatkyhethong(payload = {}) {
  xoadulieunhatkyhethong();
  return null;
}


function chuanhoavaitro(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return ["admin", "quan tri", "quản trị", "quản trị viên"].includes(normalized) ? "admin" : "lecturer";
}

function chuanhoatrangthai(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return ["locked", "lock", "khoa", "khóa", "inactive"].includes(normalized) ? "locked" : "active";
}

function laynhanvaitro(role) {
  return ROLE_CONFIG[chuanhoavaitro(role)].label;
}

function layshortvaitro(role) {
  return ROLE_CONFIG[chuanhoavaitro(role)].shortLabel;
}

function laynhantrangthai(status) {
  return STATUS_CONFIG[chuanhoatrangthai(status)].label;
}

function layclassvaitro(role) {
  return ROLE_CONFIG[chuanhoavaitro(role)].badgeClass;
}

function layclasstrangthai(status) {
  return STATUS_CONFIG[chuanhoatrangthai(status)].badgeClass;
}

function chuanhoataikhoan(raw = {}, fallback = {}) {
  const merged = {
    id: fallback.id || taomaidinhdanh(),
    username: "",
    password: "",
    role: "lecturer",
    status: "active",
    fullName: "",
    degree: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    seniority: "",
    avatar: null,
    department: "",
    staffId: "",
    ...fallback,
    ...(raw && typeof raw === "object" ? raw : {})
  };

  return {
    id: String(merged.id || taomaidinhdanh()).trim(),
    username: String(merged.username || merged.taikhoan || "").trim(),
    password: String(merged.password ?? merged.matkhau ?? ""),
    role: chuanhoavaitro(merged.role || merged.vaitro),
    status: chuanhoatrangthai(merged.status || merged.trangthai),
    fullName: String(merged.fullName || merged.ten || "").trim(),
    degree: String(merged.degree || merged.hocvi || "").trim(),
    email: String(merged.email || "").trim(),
    phone: String(merged.phone || merged.sdt || "").trim(),
    birthDate: String(merged.birthDate || merged.ngaysinh || "").trim(),
    address: String(merged.address || merged.diachi || "").trim(),
    seniority: String(merged.seniority || merged.thamnien || "").trim(),
    avatar: typeof merged.avatar === "string" && merged.avatar ? merged.avatar : null,
    department: String(merged.department || merged.khoa || "").trim(),
    staffId: String(merged.staffId || merged.maSo || "").trim()
  };
}

function taodulieutaikhoanmacdinh() {
  const legacyProfile = chuyenhoplegacyprofile(docjsonlocalstorage(LEGACY_PROFILE_STORAGE_KEY, {}));

  return [
    chuanhoataikhoan({
      id: "lecturer_default",
      username: "giangvien",
      password: "123456",
      role: "lecturer",
      status: "active",
      ...lecturerProfileDefaults,
      ...legacyProfile
    }),
    chuanhoataikhoan({
      id: "admin_default",
      username: "admin",
      password: "123456",
      role: "admin",
      status: "active",
      ...adminProfileDefaults
    })
  ];
}

function luutaikhoan(records) {
  users = records.map((record) => chuanhoataikhoan(record)).filter((record) => record.username);
  luujsonlocalstorage(USER_STORAGE_KEY, users);
  dongbonguoidungdangnhap();
}

function taidulieutaikhoan() {
  const savedUsers = docjsonlocalstorage(USER_STORAGE_KEY, null);
  if (Array.isArray(savedUsers) && savedUsers.length > 0) {
    users = savedUsers.map((record) => chuanhoataikhoan(record)).filter((record) => record.username);
  } else {
    users = taodulieutaikhoanmacdinh();
    luujsonlocalstorage(USER_STORAGE_KEY, users);
  }

  if (!users.some((record) => record.role === "admin")) {
    users.push(chuanhoataikhoan({
      id: "admin_default",
      username: "admin",
      password: "123456",
      role: "admin",
      status: "active",
      ...adminProfileDefaults
    }));
  }

  return users.map((record) => ({ ...record }));
}

function laydanhsachtaikhoan() {
  return taidulieutaikhoan();
}

function laysessiondangnhap() {
  const session = docjsonlocalstorage(SESSION_STORAGE_KEY, null);
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    userId: String(session.userId || "").trim(),
    username: String(session.username || "").trim(),
    loginAt: String(session.loginAt || "").trim()
  };
}

function luusessiondangnhap(session) {
  luujsonlocalstorage(SESSION_STORAGE_KEY, session);
}

function xoasessiondangnhap() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function laytaikhoantheoid(id) {
  return taidulieutaikhoan().find((record) => record.id === String(id || "").trim()) || null;
}

function laytaikhoantheotendangnhap(username) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  return taidulieutaikhoan().find((record) => record.username.toLowerCase() === normalizedUsername) || null;
}

function taoUserInfoTuTaiKhoan(user) {
  const source = user || chuanhoataikhoan({
    username: "giangvien",
    role: "lecturer",
    status: "active",
    ...lecturerProfileDefaults
  });

  return {
    ten: source.fullName,
    hocvi: source.degree,
    email: source.email,
    sdt: source.phone,
    ngaysinh: source.birthDate,
    diachi: source.address,
    thamnien: source.seniority,
    avatar: source.avatar,
    khoa: source.department,
    maSo: source.staffId,
    taikhoan: source.username,
    vaitro: source.role,
    trangthai: source.status
  };
}

function dongbonguoidungdangnhap() {
  const session = laysessiondangnhap();
  if (!session) {
    currentUser = null;
    userInfo = taoUserInfoTuTaiKhoan(null);
    luujsonlocalstorage(LEGACY_PROFILE_STORAGE_KEY, userInfo);
    return currentUser;
  }

  const user = laytaikhoantheoid(session.userId) || laytaikhoantheotendangnhap(session.username);
  if (!user) {
    xoasessiondangnhap();
    currentUser = null;
    userInfo = taoUserInfoTuTaiKhoan(null);
    luujsonlocalstorage(LEGACY_PROFILE_STORAGE_KEY, userInfo);
    return null;
  }

  currentUser = { ...user };
  userInfo = taoUserInfoTuTaiKhoan(currentUser);
  luujsonlocalstorage(LEGACY_PROFILE_STORAGE_KEY, userInfo);
  return currentUser;
}

function laynguoidungdangnhap() {
  return dongbonguoidungdangnhap();
}

function laytrangmacdinhnguoidung(user = currentUser) {
  return "trang_chu.html";
}

function luuthongbaoauth(message) {
  sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, String(message || "").trim());
}

function laythongbaoauth() {
  const message = sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY) || "";
  sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
  return message;
}

function dangnhaphethong(username, password) {
  const user = laytaikhoantheotendangnhap(username);

  if (!user || user.password !== String(password || "")) {
    return { ok: false, reason: "INVALID_CREDENTIALS", message: "Sai tên đăng nhập hoặc mật khẩu." };
  }

  if (user.status === "locked") {
    return { ok: false, reason: "LOCKED", message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." };
  }

  luusessiondangnhap({
    userId: user.id,
    username: user.username,
    loginAt: new Date().toISOString()
  });

  dongbonguoidungdangnhap();
  ghinhatkyhethong({
    actor: user,
    category: "auth",
    action: "Đăng nhập",
    detail: `${user.fullName} đăng nhập vào hệ thống.`,
    status: "success"
  });

  return { ok: true, user: { ...user }, redirectTo: laytrangmacdinhnguoidung(user) };
}

function dangxuathethong(redirectTo = LOGIN_PAGE) {
  const actor = currentUser ? { ...currentUser } : null;
  if (actor) {
    ghinhatkyhethong({
      actor,
      category: "auth",
      action: "Đăng xuất",
      detail: `${actor.fullName} đăng xuất khỏi hệ thống.`,
      status: "success"
    });
  }

  xoasessiondangnhap();
  currentUser = null;
  userInfo = taoUserInfoTuTaiKhoan(null);
  luujsonlocalstorage(LEGACY_PROFILE_STORAGE_KEY, userInfo);

  if (redirectTo) {
    window.location.href = redirectTo;
  }
}


function dambaophanquyen() {
  taidulieutaikhoan();
  const currentPage = laytranghientai();
  const sessionUser = laynguoidungdangnhap();

  if (currentPage === LOGIN_PAGE) {
    if (sessionUser && sessionUser.status === "active") {
      window.location.replace(laytrangmacdinhnguoidung(sessionUser));
    } else if (sessionUser && sessionUser.status === "locked") {
      xoasessiondangnhap();
    }
    return;
  }

  if (!sessionUser) {
    luuthongbaoauth("Vui lòng đăng nhập để tiếp tục.");
    window.location.replace(LOGIN_PAGE);
    return;
  }

  if (sessionUser.status !== "active") {
    xoasessiondangnhap();
    luuthongbaoauth("Tài khoản của bạn đang bị khóa.");
    window.location.replace(LOGIN_PAGE);
    return;
  }

  if (ADMIN_ONLY_PAGES.has(currentPage) && sessionUser.role !== "admin") {
    luuthongbaoauth("Bạn không có quyền truy cập chức năng quản trị hệ thống.");
    window.location.replace(laytrangmacdinhnguoidung(sessionUser));
    return;
  }

}

function taomenusidebar(currentPage, user) {
  const systemMenuItems = user?.role === "admin"
    ? [
      { href: ACCOUNT_MANAGEMENT_PAGE, icon: "fa-solid fa-users-gear", label: "Quản lý tài khoản", active: currentPage === ACCOUNT_MANAGEMENT_PAGE },
      { href: MASTER_DATA_PAGE, icon: "fa-solid fa-layer-group", label: "Khoa & Lớp", active: currentPage === MASTER_DATA_PAGE || currentPage === "khoa_lop.html" || currentPage === "quan_ly_lop_hoc.html" },
      { href: "thong_bao_tin_tuc.html", icon: "fa-solid fa-bullhorn", label: "Thông báo & Tin tức", active: currentPage === "thong_bao_tin_tuc.html" },
      { href: "nhap_diem.html", icon: "fa-solid fa-file-pen", label: "Nhập điểm", active: currentPage === "nhap_diem.html" }
    ]
    : [
      { href: "khoa_lop.html", icon: "fa-solid fa-layer-group", label: "Khoa & Lớp", active: currentPage === "khoa_lop.html" || currentPage === "quan_ly_lop_hoc.html" },
      { href: "thong_bao_tin_tuc.html", icon: "fa-solid fa-bullhorn", label: "Thông báo & Tin tức", active: currentPage === "thong_bao_tin_tuc.html" },
      { href: "lich_day.html", icon: "fa-solid fa-calendar-check", label: "Lịch dạy", active: currentPage === "lich_day.html" },
      { href: "lich_coi_thi.html", icon: "fa-solid fa-clipboard-list", label: "Lịch coi thi", active: currentPage === "lich_coi_thi.html" },
      { href: "nhap_diem.html", icon: "fa-solid fa-file-pen", label: "Nhập điểm", active: currentPage === "nhap_diem.html" }
    ];

  const accountLabel = user?.role === "admin" ? "Thông tin cá nhân" : "Thông tin cá nhân";

  return `
    <div class="menu-section">
      <h2 class="menu-title">Tài khoản</h2>
      <ul class="menu-list">
        <li class="menu-item ${currentPage === "thong_tin_ca_nhan.html" ? "active" : ""}">
          <a href="thong_tin_ca_nhan.html">
            <i class="fa-solid fa-address-card"></i>
            <span>${accountLabel}</span>
          </a>
        </li>
        <li class="menu-item ${currentPage === "trang_chu.html" ? "active" : ""}">
          <a href="trang_chu.html">
            <i class="fa-solid fa-house-chimney-user"></i>
            <span>Trang chủ của bạn</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="menu-section">
      <h2 class="menu-title">Quản lý hệ thống</h2>
      <ul class="menu-list">
        ${systemMenuItems.map((item) => `
          <li class="menu-item ${item.active ? "active" : ""}">
            <a href="${item.href}">
              <i class="${item.icon}"></i>
              <span>${item.label}</span>
            </a>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function battatthanhben() {
  document.body.classList.toggle("show-sidebar");
}

function dongthanhben() {
  document.body.classList.remove("show-sidebar");
}

function hienhithongbao(message, type = "success") {
  const notification = document.createElement("div");
  const background = type === "error" ? "linear-gradient(135deg, #e03131, #c92a2a)" : "linear-gradient(135deg, #28a745, #20c997)";

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${background};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
    z-index: 3000;
    animation: slideIn 0.3s;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

function chuanhoatruongvanban(raw, fields) {
  return fields.reduce((result, field) => {
    result[field] = String(raw?.[field] ?? "").trim();
    return result;
  }, {});
}

function laygiatriduynhatdasapxep(values, removeEmpty = false) {
  const normalizedValues = removeEmpty ? values.filter(Boolean) : values;
  return [...new Set(normalizedValues)].sort();
}

function chuanhoakhotimkiem(value) {
  return String(value || "").trim().toLowerCase();
}

function sapxeptheochuoi(a, b) {
  return String(a || "").localeCompare(String(b || ""), "vi", { sensitivity: "base" });
}

function tachdanhsachtugiatrichuoi(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function gopdanhsachtugiatrichuoi(values) {
  return laygiatriduynhatdasapxep(values, true).join(", ");
}

/* /../ =======================================================================
   /../ TRANG CHU - trang_chu.html
   /../ Cum nay uu tien phan thong bao ca nhan va trang thai chuong thong bao o header.
   /../ Trang chu van dung them du lieu thong bao he thong o muc THONG_BAO_TIN_TUC ben duoi.
   /../ ======================================================================= */

function chuanhoathongbaocanhan(raw = {}) {
  return {
    id: String(raw.id || taomaidinhdanh("notice")).trim(),
    createdAt: String(raw.createdAt || laythoigianhethong()).trim(),
    recipientId: String(raw.recipientId || "").trim(),
    recipientName: String(raw.recipientName || "").trim(),
    title: String(raw.title || "Thông báo hệ thống").trim(),
    content: String(raw.content || "").trim(),
    link: String(raw.link || "trang_chu.html#lecturerNotifications").trim(),
    type: String(raw.type || "system").trim(),
    readAt: String(raw.readAt || "").trim(),
    readById: String(raw.readById || "").trim()
  };
}

function lathongbaoduyetyeucaugiangvien(notification = {}) {
  const type = String(notification?.type || "").trim();
  return [
    "grade_unlock_approved",
    "grade_unlock_rejected"
  ].includes(type) || /^(grade_unlock)_(approved|rejected)$/.test(type);
}

function laydanhsachthongbaocanhan() {
  const saved = docjsonlocalstorage(USER_NOTIFICATION_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.map(chuanhoathongbaocanhan) : [];
}

function luudanhsachthongbaocanhan(records = []) {
  luujsonlocalstorage(
    USER_NOTIFICATION_STORAGE_KEY,
    records.map(chuanhoathongbaocanhan)
  );
}

function themthongbaocanhan(payload = {}) {
  const nextNotification = chuanhoathongbaocanhan(payload);
  if (!nextNotification.recipientId) {
    return { ok: false, message: "Thiếu người nhận thông báo." };
  }

  luudanhsachthongbaocanhan([nextNotification, ...laydanhsachthongbaocanhan()]);
  return { ok: true, item: nextNotification };
}

function laythongbaocanhanchonguoidung(user = currentUser) {
  const activeUser = user || currentUser;
  if (!activeUser?.id) {
    return [];
  }

  return laydanhsachthongbaocanhan().filter((item) => item.recipientId === activeUser.id);
}

function demthongbaocanhanchuadoc(user = currentUser) {
  return laythongbaocanhanchonguoidung(user).filter((item) => !item.readAt).length;
}

function danhdaumotthongbaocanhanchodoc(notificationId, user = currentUser) {
  const activeUser = user || currentUser;
  const targetId = String(notificationId || "").trim();
  if (!activeUser?.id || !targetId) {
    return false;
  }

  const readAt = laythoigianhethong();
  let hasChanges = false;
  const nextRecords = laydanhsachthongbaocanhan().map((item) => {
    if (item.id !== targetId || item.recipientId !== activeUser.id || item.readAt) {
      return item;
    }

    hasChanges = true;
    return chuanhoathongbaocanhan({
      ...item,
      readAt,
      readById: activeUser.id
    });
  });

  if (hasChanges) {
    luudanhsachthongbaocanhan(nextRecords);
  }

  return hasChanges;
}

/* /../ =======================================================================
   /../ THONG TIN CA NHAN - thong_tin_ca_nhan.html
   /../ Gom profile mac dinh, bien userInfo legacy va helper chuyen doi thong tin nguoi dung.
   /../ ======================================================================= */

const lecturerProfileDefaults = {
  fullName: "Nguyễn Thị Diễm Quỳnh",
  degree: "Tiến sĩ",
            email: "quynh.nguyen@hcmute.edu.vn",
  phone: "0909 123 456",
  birthDate: "1985-05-15",
  address: "Quận 1, TP.HCM",
  seniority: "10 năm",
  avatar: null,
  department: "Khoa Công nghệ Thông tin",
  staffId: "GV2024001"
};

const adminProfileDefaults = {
  fullName: "Hoàng Minh Thư",
  degree: "Thạc sĩ",
  email: "admin@hcmute.edu.vn",
  phone: "0908 456 789",
  birthDate: "1982-08-20",
  address: "TP. Thủ Đức, TP.HCM",
  seniority: "12 năm",
  avatar: null,
  department: "Phòng quản trị hệ thống",
  staffId: "QT2024001"
};

const legacyProfileFixups = {
  ten: "Nguyễn Thị Diễm Quỳnh",
  hocvi: "Tiến sĩ",
  diachi: "Quận 1, TP.HCM",
  thamnien: "10 năm"
};


let userInfo = {
  ten: lecturerProfileDefaults.fullName,
  hocvi: lecturerProfileDefaults.degree,
  email: lecturerProfileDefaults.email,
  sdt: lecturerProfileDefaults.phone,
  ngaysinh: lecturerProfileDefaults.birthDate,
  diachi: lecturerProfileDefaults.address,
  thamnien: lecturerProfileDefaults.seniority,
  avatar: lecturerProfileDefaults.avatar,
  khoa: lecturerProfileDefaults.department,
  maSo: lecturerProfileDefaults.staffId,
  taikhoan: "giangvien",
  vaitro: "lecturer",
  trangthai: "active"
};

function chuyenhoplegacyprofile(savedProfile) {
  const profile = savedProfile && typeof savedProfile === "object" ? { ...savedProfile } : {};

  Object.entries(legacyProfileFixups).forEach(([key, legacyValue]) => {
    if (profile[key] === legacyValue) {
      if (key === "ten") profile[key] = lecturerProfileDefaults.fullName;
      if (key === "hocvi") profile[key] = lecturerProfileDefaults.degree;
      if (key === "diachi") profile[key] = lecturerProfileDefaults.address;
      if (key === "thamnien") profile[key] = lecturerProfileDefaults.seniority;
    }
  });

  return {
    fullName: String(profile.ten || lecturerProfileDefaults.fullName).trim(),
    degree: String(profile.hocvi || lecturerProfileDefaults.degree).trim(),
    email: String(profile.email || lecturerProfileDefaults.email).trim(),
    phone: String(profile.sdt || lecturerProfileDefaults.phone).trim(),
    birthDate: String(profile.ngaysinh || lecturerProfileDefaults.birthDate).trim(),
    address: String(profile.diachi || lecturerProfileDefaults.address).trim(),
    seniority: String(profile.thamnien || lecturerProfileDefaults.seniority).trim(),
    avatar: typeof profile.avatar === "string" && profile.avatar ? profile.avatar : null,
    department: String(profile.khoa || lecturerProfileDefaults.department).trim(),
    staffId: String(profile.maSo || lecturerProfileDefaults.staffId).trim()
  };
}

function taoUserInfoTuTaiKhoan(user) {
  const source = user || chuanhoataikhoan({
    username: "giangvien",
    role: "lecturer",
    status: "active",
    ...lecturerProfileDefaults
  });

  return {
    ten: source.fullName,
    hocvi: source.degree,
    email: source.email,
    sdt: source.phone,
    ngaysinh: source.birthDate,
    diachi: source.address,
    thamnien: source.seniority,
    avatar: source.avatar,
    khoa: source.department,
    maSo: source.staffId,
    taikhoan: source.username,
    vaitro: source.role,
    trangthai: source.status
  };
}

/* /../ =======================================================================
   /../ QUAN LY TAI KHOAN - quan_ly_tai_khoan.html
   /../ Gom helper CRUD tai khoan va validate thong tin phuc vu trang quan ly tai khoan.
   /../ ======================================================================= */

function demadmin(records = taidulieutaikhoan()) {
  return records.filter((record) => record.role === "admin").length;
}

function demadminhoatdong(records = taidulieutaikhoan()) {
  return records.filter((record) => record.role === "admin" && record.status === "active").length;
}

function kiemtratruongtrung(payload, excludeId = "") {
  const normalizedUsername = String(payload.username || "").trim().toLowerCase();
  const normalizedEmail = String(payload.email || "").trim().toLowerCase();
  const normalizedStaffId = String(payload.staffId || "").trim().toLowerCase();

  const duplicate = taidulieutaikhoan().find((record) => {
    if (record.id === excludeId) {
      return false;
    }

    const sameUsername = normalizedUsername && record.username.toLowerCase() === normalizedUsername;
    const sameEmail = normalizedEmail && record.email.toLowerCase() === normalizedEmail;
    const sameStaffId = normalizedStaffId && record.staffId.toLowerCase() === normalizedStaffId;

    return sameUsername || sameEmail || sameStaffId;
  });

  if (!duplicate) return "";
  if (normalizedUsername && duplicate.username.toLowerCase() === normalizedUsername) return "Tên đăng nhập đã tồn tại.";
  if (normalizedEmail && duplicate.email.toLowerCase() === normalizedEmail) return "Email đã tồn tại.";
  return "Mã cán bộ đã tồn tại.";
}

function kiemtrahoplethongtintaikhoan(payload, options = {}) {
  const isEditing = Boolean(options.isEditing);
  const password = String(payload.password || "");
  const username = String(payload.username || "").trim();

  if (!username) return "Vui lòng nhập tên đăng nhập.";
  if (!isEditing && username.length < 8) return "Tên đăng nhập phải có ít nhất 8 ký tự.";
  if (!String(payload.fullName || "").trim()) return "Vui lòng nhập họ và tên.";
  if (!String(payload.email || "").trim()) return "Vui lòng nhập email.";
  if (!isEditing && !String(payload.staffId || "").trim()) return "Vui lòng nhập mã cán bộ.";
  if (!isEditing && !String(payload.phone || "").trim()) return "Vui lòng nhập số điện thoại.";
  if (!isEditing && !String(payload.department || "").trim()) return "Vui lòng nhập khoa / đơn vị.";
  if (!isEditing && !String(payload.degree || "").trim()) return "Vui lòng nhập học vị.";
  if (!isEditing && !String(payload.birthDate || "").trim()) return "Vui lòng nhập ngày sinh.";
  if (!isEditing && !String(payload.seniority || "").trim()) return "Vui lòng nhập thâm niên.";
  if (!isEditing && !String(payload.address || "").trim()) return "Vui lòng nhập địa chỉ.";
  if (!isEditing && password.trim().length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
  if (isEditing && password.trim() && password.trim().length < 6) return "Mật khẩu mới phải có ít nhất 6 ký tự.";

  return kiemtratruongtrung(payload, options.excludeId || "");
}

function themtaikhoanmoi(payload) {
  const normalized = chuanhoataikhoan({ ...payload, id: taomaidinhdanh("account") });
  const validationMessage = kiemtrahoplethongtintaikhoan(normalized, { isEditing: false });
  if (validationMessage) return { ok: false, message: validationMessage };

  luutaikhoan([normalized, ...taidulieutaikhoan()]);
  ghinhatkyhethong({
    category: "account",
    action: "Tạo tài khoản",
    detail: `Tạo tài khoản ${normalized.fullName} (${normalized.username}).`,
    status: "success"
  });
  return { ok: true, user: normalized, message: "Đã tạo tài khoản mới thành công!" };
}

function capnhattaikhoan(id, payload = {}) {
  const targetId = String(id || "").trim();
  const records = taidulieutaikhoan();
  const targetIndex = records.findIndex((record) => record.id === targetId);
  if (targetIndex === -1) return { ok: false, message: "Không tìm thấy tài khoản cần cập nhật." };

  const currentRecord = records[targetIndex];
  const nextPassword = String(payload.password || "").trim() ? String(payload.password).trim() : currentRecord.password;
  const nextRecord = chuanhoataikhoan({ ...currentRecord, ...payload, password: nextPassword }, currentRecord);
  const validationMessage = kiemtrahoplethongtintaikhoan(nextRecord, { isEditing: true, excludeId: targetId });

  if (validationMessage) return { ok: false, message: validationMessage };
  if (currentUser && currentUser.id === targetId && nextRecord.status === "locked") {
    return { ok: false, message: "Không thể tự khóa tài khoản đang đăng nhập." };
  }

  const nextUsers = records.map((record, index) => (index === targetIndex ? nextRecord : record));
  if (currentRecord.role === "admin" && nextRecord.role !== "admin" && demadminhoatdong(nextUsers) === 0) {
    return { ok: false, message: "Hệ thống phải luôn có ít nhất một quản trị viên." };
  }
  if (currentRecord.role === "admin" && nextRecord.status === "locked" && demadminhoatdong(nextUsers) === 0) {
    return { ok: false, message: "Hệ thống phải luôn có ít nhất một quản trị viên đang hoạt động." };
  }

  luutaikhoan(nextUsers);
  ghinhatkyhethong({
    category: "account",
    action: "Cập nhật tài khoản",
    detail: `Cập nhật tài khoản ${nextRecord.fullName} (${nextRecord.username}).`,
    status: "success"
  });
  return { ok: true, user: nextRecord, message: "Đã cập nhật tài khoản thành công!" };
}

function capnhattrangthaitaikhoan(id, nextStatus) {
  return capnhattaikhoan(id, { status: chuanhoatrangthai(nextStatus) });
}

function xoataikhoan(id) {
  const targetId = String(id || "").trim();
  const records = taidulieutaikhoan();
  const target = records.find((record) => record.id === targetId);

  if (!target) return { ok: false, message: "Không tìm thấy tài khoản cần xóa." };
  if (currentUser && currentUser.id === targetId) return { ok: false, message: "Không thể xóa tài khoản đang đăng nhập." };

  const nextUsers = records.filter((record) => record.id !== targetId);
  if (target.role === "admin" && demadminhoatdong(nextUsers) === 0) {
    return { ok: false, message: "Không thể xóa quản trị viên đang hoạt động cuối cùng của hệ thống." };
  }

  luutaikhoan(nextUsers);
  ghinhatkyhethong({
    category: "account",
    action: "Xóa tài khoản",
    detail: `Xóa tài khoản ${target.fullName} (${target.username}).`,
    status: "warning"
  });
  return { ok: true, message: "Đã xóa tài khoản thành công!" };
}


/* /../ =======================================================================
   /../ DU LIEU TONG - du_lieu_tong.html
   /../ Gom chuan hoa khoa/lop va CRUD master data dung cho cac man hinh lien quan.
   /../ ======================================================================= */

function chuanhoamakhhoacu(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return normalizedCode === "TMĐT" ? "KINH_TE" : normalizedCode;
}

function chuanhoatenkhoacu(name) {
  const normalizedName = String(name || "").trim();
  const searchName = chuanhoakhotimkiem(normalizedName);
  return searchName === "khoa thương mại điện tử" ? "Khoa Kinh tế" : normalizedName;
}

const LEGACY_CLASS_CODE_MAP = Object.freeze({
  "24CNTT": "PY24CNTT",
  "24TMDT": "WEB24TMDT"
});

const FIXED_CLASSES = Object.freeze([
  { id: "class_24cntt", name: "PY24CNTT", displayName: "Lập trình Python (PY24CNTT)", departmentCode: "CNTT", advisorId: "lecturer_default", advisor: "Nguyễn Thị Diễm Quỳnh", managedClasses: "241421A, 241421B, 241422C" },
  { id: "class_24tmdt", name: "WEB24TMDT", displayName: "Thiết kế Web (WEB24TMDT)", departmentCode: "KINH_TE", advisorId: "lecturer_default", advisor: "Nguyễn Thị Diễm Quỳnh", managedClasses: "241261A, 241261B" }
]);

function chuanhoamalop(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return LEGACY_CLASS_CODE_MAP[normalizedCode] || normalizedCode;
}

function lamalopsinhvien(code = "") {
  return /^\d{6}[A-Z]$/.test(chuanhoamalop(code));
}

/* /../ =======================================================================
   /../ DỮ LIỆU TỔNG / MASTER DATA
   /../ Quản lý khoa, lớp, năm học, học kỳ và làm dữ liệu dùng chung
   /../ ======================================================================= */

const MASTER_DATA_STORAGE_KEY = "master_data_hcmute";
let masterData = null;
const FIXED_DEPARTMENTS = [
  {
    id: "dept_dien_dien_tu",
    code: "DIEN_DIEN_TU",
    name: "Khoa Điện - Điện tử",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_co_khi_che_tao_may",
    code: "CO_KHI_CTM",
    name: "Khoa Cơ khí Chế tạo máy",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_kinh_te",
    code: "KINH_TE",
    name: "Khoa Kinh tế",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_giao_thong_nang_luong",
    code: "GT_NL",
    name: "Khoa Giao thông và Năng lượng",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_hoa_hoc_thuc_pham",
    code: "CN_HOA_TP",
    name: "Khoa Công nghệ Hóa học và Thực phẩm",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_cntt",
    code: "CNTT",
    name: "Khoa Công nghệ Thông tin",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_xay_dung",
    code: "XAY_DUNG",
    name: "Khoa Xây dựng",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_clc",
    code: "CLC",
    name: "Khoa Đào tạo Chất lượng cao",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_chinh_tri_luat",
    code: "CT_LUAT",
    name: "Khoa Chính trị và Luật",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_in_truyen_thong",
    code: "IN_TT",
    name: "Khoa In - Truyền thông",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_khoa_hoc_ung_dung",
    code: "KHUD",
    name: "Khoa Khoa học Ứng dụng",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_ngoai_ngu",
    code: "NGOAI_NGU",
    name: "Khoa Ngoại ngữ",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  },
  {
    id: "dept_thoi_trang_du_lich",
    code: "TTDL",
    name: "Khoa Thời trang và Du lịch",
    description: "Danh mục khoa cố định dùng để phân loại lớp và sinh viên."
  }
];

function chuanhoakhoa(raw = {}) {
  return {
    id: String(raw.id || taomaidinhdanh("dept")).trim(),
    code: chuanhoamakhhoacu(raw.code),
    name: chuanhoatenkhoacu(raw.name),
    description: String(raw.description || "").trim()
  };
}

function laytenhienthimacdinhcholop(classCode = "") {
  const normalizedClassCode = chuanhoamalop(classCode);
  if (normalizedClassCode === "PY24CNTT") {
    return "Lập trình Python (PY24CNTT)";
  }

  if (normalizedClassCode === "WEB24TMDT") {
    return "Thiết kế Web (WEB24TMDT)";
  }

  return "";
}

function dinhdangtenhienthihocphan(displayName = "", classCode = "") {
  const normalizedClassCode = chuanhoamalop(classCode);
  const normalizedDisplayName = String(displayName || "").trim();
  if (!normalizedClassCode) {
    return normalizedDisplayName;
  }

  if (!normalizedDisplayName || normalizedDisplayName === normalizedClassCode) {
    return normalizedClassCode;
  }

  const suffix = `(${normalizedClassCode})`;
  if (normalizedDisplayName.endsWith(suffix) || normalizedDisplayName.includes(suffix)) {
    return normalizedDisplayName;
  }

  return `${normalizedDisplayName} ${suffix}`;
}

function chuanhoalophocmaster(raw = {}) {
  const classCode = chuanhoamalop(raw.name);
  const normalizedAdvisorId = String(raw.advisorId || raw.lecturerId || "").trim();
  const advisorAccount = normalizedAdvisorId ? laytaikhoantheoid(normalizedAdvisorId) : null;
  const advisorMatches = raw.advisor && !normalizedAdvisorId
    ? laydanhsachgiangvien().filter((account) => chuanhoakhotimkiem(account.fullName) === chuanhoakhotimkiem(raw.advisor))
    : [];
  const resolvedAdvisorAccount = advisorAccount?.role === "lecturer"
    ? advisorAccount
    : (advisorMatches.length === 1 ? advisorMatches[0] : null);
  const advisorName = resolvedAdvisorAccount?.fullName || String(raw.advisor || raw.advisorName || "").trim();
  return {
    id: String(raw.id || taomaidinhdanh("class")).trim(),
    name: classCode,
    displayName: dinhdangtenhienthihocphan(
      String(raw.displayName || raw.classDisplayName || laytenhienthimacdinhcholop(classCode)).trim(),
      classCode
    ),
    departmentCode: chuanhoamakhhoacu(raw.departmentCode || raw.faculty),
    advisorId: String(resolvedAdvisorAccount?.id || "").trim(),
    advisor: advisorName,
    managedClasses: gopdanhsachtugiatrichuoi(tachdanhsachtugiatrichuoi(raw.managedClasses || raw.studentClassNames || ""))
  };
}

function laydanhsachkhoacodinh() {
  return FIXED_DEPARTMENTS.map((item) => chuanhoakhoa(item));
}

function hopnhatdanhsachkhoa(savedDepartments = []) {
  const merged = [];
  const seenCodes = new Set();
  const seenNames = new Set();

  laydanhsachkhoacodinh().forEach((item) => {
    merged.push(item);
    seenCodes.add(item.code);
    seenNames.add(chuanhoakhotimkiem(item.name));
  });

  savedDepartments
    .map(chuanhoakhoa)
    .forEach((item) => {
      const normalizedName = chuanhoakhotimkiem(item.name);
      if (!item.code || !item.name || seenCodes.has(item.code) || seenNames.has(normalizedName)) {
        return;
      }

      merged.push(item);
      seenCodes.add(item.code);
      seenNames.add(normalizedName);
    });

  return merged;
}

function taodulieumastermacdinh() {
  return {
    departments: laydanhsachkhoacodinh(),
    classes: FIXED_CLASSES.map((item) => chuanhoalophocmaster(item))
  };
}

function hopnhatdanhsachlopmacdinh(savedClasses = []) {
  const merged = [];
  const seenClassCodes = new Set();

  FIXED_CLASSES
    .map((item) => chuanhoalophocmaster(item))
    .forEach((item) => {
      merged.push(item);
      seenClassCodes.add(chuanhoamalop(item.name));
    });

  savedClasses
    .map(chuanhoalophocmaster)
    .filter((item) => !lamalopsinhvien(item.name))
    .forEach((item) => {
      const normalizedClassCode = chuanhoamalop(item.name);
      if (!normalizedClassCode || seenClassCodes.has(normalizedClassCode)) {
        return;
      }

      merged.push(item);
      seenClassCodes.add(normalizedClassCode);
    });

  return merged;
}

function sapxepdulieumaster(data) {
  return {
    departments: [...data.departments].sort((a, b) => sapxeptheochuoi(a.name, b.name)),
    classes: [...data.classes].sort((a, b) => sapxeptheochuoi(a.name, b.name))
  };
}

function chuanhoadulieumaster(raw = {}) {
  const fallback = taodulieumastermacdinh();
  const normalizedClasses = Array.isArray(raw.classes) && raw.classes.length
    ? hopnhatdanhsachlopmacdinh(raw.classes)
    : fallback.classes;
  const normalized = {
    departments: hopnhatdanhsachkhoa(Array.isArray(raw.departments) ? raw.departments : fallback.departments),
    classes: normalizedClasses.length ? normalizedClasses : fallback.classes
  };

  return sapxepdulieumaster(normalized);
}

function luudulieumaster(data) {
  masterData = chuanhoadulieumaster(data);
  luujsonlocalstorage(MASTER_DATA_STORAGE_KEY, masterData);
}

function taidulieumaster() {
  if (masterData) {
    return {
      departments: masterData.departments.map((item) => ({ ...item })),
      classes: masterData.classes.map((item) => ({ ...item }))
    };
  }

  const saved = docjsonlocalstorage(MASTER_DATA_STORAGE_KEY, null);
  masterData = chuanhoadulieumaster(saved || taodulieumastermacdinh());
  luujsonlocalstorage(MASTER_DATA_STORAGE_KEY, masterData);

  return taidulieumaster();
}

function laydanhsachkhoa() {
  return taidulieumaster().departments;
}

function laydanhsachlopmaster() {
  return taidulieumaster().classes.filter((item) => !lamalopsinhvien(item.name));
}

function laydanhsachlopsinhvien(faculty = "") {
  const normalizedFaculty = String(faculty || "").trim();
  return laygiatriduynhatdasapxep(
    taidanhsachsinhvien()
      .filter((student) => !normalizedFaculty || normalizedFaculty === "all" || student.faculty === normalizedFaculty)
      .map((student) => chuanhoamalop(student.className))
      .filter(Boolean),
    true
  );
}

function laykhoatheocode(code) {
  const normalizedCode = chuanhoamakhhoacu(code);
  return laydanhsachkhoa().find((item) => item.code === normalizedCode) || null;
}

function laylophocmastertheoid(id) {
  const normalizedId = String(id || "").trim();
  return laydanhsachlopmaster().find((item) => item.id === normalizedId) || null;
}

function laylophocmastertheoten(classCode = "") {
  const normalizedClassCode = chuanhoamalop(classCode);
  if (!normalizedClassCode) {
    return null;
  }

  return laydanhsachlopmaster().find((item) => chuanhoamalop(item.name) === normalizedClassCode) || null;
}

function laytenhienthilop(classCode = "") {
  const classItem = laylophocmastertheoten(classCode);
  if (!classItem) {
    return String(classCode || "").trim();
  }

  return dinhdangtenhienthihocphan(classItem.displayName || "", classItem.name || "");
}

function tachthongtinmonhoc(raw = {}) {
  const code = chuanhoamalop(raw.name || raw.code || "");
  const displayValue = dinhdangtenhienthihocphan(
    String(raw.displayName || raw.classDisplayName || "").trim(),
    code
  );
  const normalizedSuffix = code ? `(${code})` : "";
  let subject = displayValue;

  if (displayValue && normalizedSuffix && displayValue.endsWith(normalizedSuffix)) {
    subject = displayValue.slice(0, -normalizedSuffix.length).trim();
  }

  subject = String(subject || code || "").trim();

  return {
    subject,
    code,
    displayValue: String(displayValue || (subject && code ? `${subject} (${code})` : (subject || code))).trim(),
    managedClasses: gopdanhsachtugiatrichuoi(tachdanhsachtugiatrichuoi(raw.managedClasses || raw.className || ""))
  };
}

function coquyenquanlydulieutong() {
  const activeUser = laynguoidungdangnhap();
  return Boolean(activeUser && activeUser.role === "admin");
}

function taoloiquyenquanlydulieutong() {
  return {
    ok: false,
    message: "Chỉ quản trị viên mới có quyền thêm, cập nhật, xóa khoa và lớp."
  };
}

function kiemtratrumglophoc(payload, excludeId = "") {
  const normalizedName = chuanhoakhotimkiem(payload.name);
  return laydanhsachlopmaster().find((item) => item.id !== excludeId && chuanhoakhotimkiem(item.name) === normalizedName) || null;
}

function themlophocmaster(payload = {}) {
  if (!coquyenquanlydulieutong()) return taoloiquyenquanlydulieutong();

  const nextClass = chuanhoalophocmaster({ ...payload, id: taomaidinhdanh("class") });
  if (!nextClass.name) return { ok: false, message: "Vui lòng nhập mã học phần." };
  if (!nextClass.departmentCode) return { ok: false, message: "Vui lòng chọn khoa cho học phần." };
  if (!nextClass.advisorId) return { ok: false, message: "Vui lòng chọn tài khoản giảng viên phụ trách học phần." };
  if (!laykhoatheocode(nextClass.departmentCode)) return { ok: false, message: "Khoa đã chọn không tồn tại." };
  if (kiemtratrumglophoc(nextClass)) return { ok: false, message: "Mã học phần đã tồn tại." };

  const data = taidulieumaster();
  data.classes.push(nextClass);
  luudulieumaster(data);
  ghinhatkyhethong({
    category: "master-data",
    action: "Thêm học phần",
    detail: `Thêm học phần ${nextClass.name} thuộc ${laykhoatheocode(nextClass.departmentCode)?.name || nextClass.departmentCode}.`,
    status: "success"
  });
  return { ok: true, item: nextClass, message: "Đã thêm học phần thành công!" };
}

function capnhatlophocmaster(id, payload = {}) {
  if (!coquyenquanlydulieutong()) return taoloiquyenquanlydulieutong();

  const targetId = String(id || "").trim();
  const data = taidulieumaster();
  const targetIndex = data.classes.findIndex((item) => item.id === targetId);
  if (targetIndex === -1) return { ok: false, message: "Không tìm thấy học phần cần cập nhật." };

  const currentClass = data.classes[targetIndex];
  const nextClass = chuanhoalophocmaster({ ...currentClass, ...payload, id: targetId });
  if (!nextClass.name) return { ok: false, message: "Vui lòng nhập mã học phần." };
  if (!nextClass.departmentCode) return { ok: false, message: "Vui lòng chọn khoa cho học phần." };
  if (!nextClass.advisorId) return { ok: false, message: "Vui lòng chọn tài khoản giảng viên phụ trách học phần." };
  if (!laykhoatheocode(nextClass.departmentCode)) return { ok: false, message: "Khoa đã chọn không tồn tại." };
  if (kiemtratrumglophoc(nextClass, targetId)) return { ok: false, message: "Mã học phần đã tồn tại." };

  data.classes[targetIndex] = nextClass;

  if (currentClass.name !== nextClass.name || currentClass.departmentCode !== nextClass.departmentCode) {
    luudanhsachsinhvien(taidanhsachsinhvien().map((student) => {
      if (student.className !== currentClass.name) {
        return student;
      }

      return {
        ...student,
        className: nextClass.name,
        faculty: nextClass.departmentCode
      };
    }));
  }

  luudulieumaster(data);
  ghinhatkyhethong({
    category: "master-data",
    action: "Cập nhật học phần",
    detail: `Cập nhật học phần ${nextClass.name} thuộc ${laykhoatheocode(nextClass.departmentCode)?.name || nextClass.departmentCode}.`,
    status: "success"
  });
  return { ok: true, item: nextClass, message: "Đã cập nhật học phần thành công!" };
}

function xoalophocmaster(id) {
  if (!coquyenquanlydulieutong()) return taoloiquyenquanlydulieutong();

  const targetId = String(id || "").trim();
  const data = taidulieumaster();
  const targetClass = data.classes.find((item) => item.id === targetId);
  if (!targetClass) return { ok: false, message: "Không tìm thấy học phần cần xóa." };

  luudanhsachsinhvien(
    taidanhsachsinhvien().filter((student) => student.className !== targetClass.name)
  );
  data.classes = data.classes.filter((item) => item.id !== targetId);
  luudulieumaster(data);
  ghinhatkyhethong({
    category: "master-data",
    action: "Xóa học phần",
    detail: `Xóa học phần ${targetClass.name}.`,
    status: "warning"
  });
  return { ok: true, message: "Đã xóa học phần thành công!" };
}


/* /../ =======================================================================
   /../ KHOA LOP - khoa_lop.html
   /../ Gom helper danh sach giang vien va danh sach lop giang vien quan ly.
   /../ ======================================================================= */

function laydanhsachgiangvien() {
  return taidulieutaikhoan()
    .filter((account) => account.role === "lecturer")
    .sort((a, b) => sapxeptheochuoi(a.fullName, b.fullName));
}

function laydanhsachgiangvientheoten(fullName = "") {
  const normalizedFullName = chuanhoakhotimkiem(fullName);
  if (!normalizedFullName) {
    return [];
  }

  return laydanhsachgiangvien().filter((account) => chuanhoakhotimkiem(account.fullName) === normalizedFullName);
}

function laydanhsachlopgiangvienquanly(user = currentUser) {
  const activeUser = user || currentUser;
  if (!activeUser || activeUser.role !== "lecturer") {
    return [];
  }

  const classSet = new Set();
  const activeUserId = String(activeUser.id || "").trim();
  const normalizedLecturerName = chuanhoakhotimkiem(activeUser.fullName);
  const canUseLegacyNameMatch = Boolean(
    activeUserId
    && normalizedLecturerName
    && laydanhsachgiangvientheoten(activeUser.fullName).length === 1
  );
  const addClassName = (className) => {
    const normalizedClassName = chuanhoamalop(className);
    const masterClass = laylophocmastertheoten(normalizedClassName);
    if (masterClass) {
      classSet.add(masterClass.name);
    }
  };

  laydanhsachlopmaster().forEach((item) => {
    const normalizedAdvisorId = String(item.advisorId || "").trim();
    const isAssignedById = Boolean(activeUserId && normalizedAdvisorId && normalizedAdvisorId === activeUserId);
    const isAssignedByLegacyName = !normalizedAdvisorId
      && canUseLegacyNameMatch
      && normalizedLecturerName
      && chuanhoakhotimkiem(item.advisor) === normalizedLecturerName;
    if (isAssignedById || isAssignedByLegacyName) {
      addClassName(item.name);
    }
  });

  return Array.from(classSet).sort((a, b) => sapxeptheochuoi(a, b));
}

/* /../ =======================================================================
   /../ QUAN LY LOP HOC - quan_ly_lop_hoc.html
   /../ Gom du lieu sinh vien, danh ba lop hoc va helper loc theo khoa/lop cho trang quan ly lop.
   /../ ======================================================================= */

/* /../ =======================================================================
   /../ TỪNG TRANG: SINH VIÊN / KHOA LỚP / QUẢN LÝ LỚP / NHẬP ĐIỂM
   /../ Gom dữ liệu nguồn, chuẩn hóa, localStorage và helper lọc theo khoa/lớp
   /../ ======================================================================= */

const STUDENT_STORAGE_KEY = "students_hcmute";
const STUDENT_DIRECTORY_STORAGE_KEY = "student_directory_hcmute";
const studentSeedCsv = `STT,MSSV,Ho va Ten,Gioi tinh,Khoa,Lop,Email
1,24126001,Nguyễn An Bình,Nam,TMĐT,WEB24TMDT,24126001@student.hcmute.edu.vn
2,24126002,Trần Bảo Châu,Nữ,TMĐT,WEB24TMDT,24126002@student.hcmute.edu.vn
3,24126003,Lê Duy Đăng,Nam,TMĐT,WEB24TMDT,24126003@student.hcmute.edu.vn
4,24126004,Phạm Minh Đạt,Nam,TMĐT,WEB24TMDT,24126004@student.hcmute.edu.vn
5,24126005,Đỗ Thùy Dương,Nữ,TMĐT,WEB24TMDT,24126005@student.hcmute.edu.vn
6,24126006,Hoàng Gia Bảo,Nam,TMĐT,WEB24TMDT,24126006@student.hcmute.edu.vn
7,24126007,Phan Thanh Hà,Nữ,TMĐT,WEB24TMDT,24126007@student.hcmute.edu.vn
8,24126008,Vũ Thu Hiền,Nữ,TMĐT,WEB24TMDT,24126008@student.hcmute.edu.vn
9,24126009,Bùi Thái Hòa,Nam,TMĐT,WEB24TMDT,24126009@student.hcmute.edu.vn
10,24126010,Ngô Văn Hùng,Nam,TMĐT,WEB24TMDT,24126010@student.hcmute.edu.vn
11,24126011,Đặng Thị Hương,Nữ,TMĐT,WEB24TMDT,24126011@student.hcmute.edu.vn
12,24126012,Lý Minh Huy,Nam,TMĐT,WEB24TMDT,24126012@student.hcmute.edu.vn
13,24126013,Trương Mỹ Huyền,Nữ,TMĐT,WEB24TMDT,24126013@student.hcmute.edu.vn
14,24126014,Võ Ngọc Khoa,Nam,TMĐT,WEB24TMDT,24126014@student.hcmute.edu.vn
15,24126015,Diệp Gia Kiệt,Nam,TMĐT,WEB24TMDT,24126015@student.hcmute.edu.vn
16,24126016,Lâm Khánh Linh,Nữ,TMĐT,WEB24TMDT,24126016@student.hcmute.edu.vn
17,24126017,Đoàn Văn Lộc,Nam,TMĐT,WEB24TMDT,24126017@student.hcmute.edu.vn
18,24126018,Mai Tuyết Mai,Nữ,TMĐT,WEB24TMDT,24126018@student.hcmute.edu.vn
19,24126019,Tạ Công Minh,Nam,TMĐT,WEB24TMDT,24126019@student.hcmute.edu.vn
20,24126020,Hứa Thanh Nam,Nam,TMĐT,WEB24TMDT,24126020@student.hcmute.edu.vn
21,24126021,Cao Thảo Nguyên,Nữ,TMĐT,WEB24TMDT,24126021@student.hcmute.edu.vn
22,24126022,Lương Trọng Nghĩa,Nam,TMĐT,WEB24TMDT,24126022@student.hcmute.edu.vn
23,24126023,Phùng Minh Nhật,Nam,TMĐT,WEB24TMDT,24126023@student.hcmute.edu.vn
24,24126024,Quách Hồng Nhung,Nữ,TMĐT,WEB24TMDT,24126024@student.hcmute.edu.vn
25,24126025,Âu Thiên Phúc,Nam,TMĐT,WEB24TMDT,24126025@student.hcmute.edu.vn
26,24126026,Vương Đình Quân,Nam,TMĐT,WEB24TMDT,24126026@student.hcmute.edu.vn
27,24126027,Tống Minh Quang,Nam,TMĐT,WEB24TMDT,24126027@student.hcmute.edu.vn
28,24126028,Giang Kiều Quyên,Nữ,TMĐT,WEB24TMDT,24126028@student.hcmute.edu.vn
29,24126029,Chu Văn Sang,Nam,TMĐT,WEB24TMDT,24126029@student.hcmute.edu.vn
30,24126030,Tăng Ngọc Sơn,Nam,TMĐT,WEB24TMDT,24126030@student.hcmute.edu.vn
31,24126031,Trịnh Minh Tâm,Nam,TMĐT,WEB24TMDT,24126031@student.hcmute.edu.vn
32,24126032,Đào Quốc Thái,Nam,TMĐT,WEB24TMDT,24126032@student.hcmute.edu.vn
33,24126033,Thạch Kim Thanh,Nữ,TMĐT,WEB24TMDT,24126033@student.hcmute.edu.vn
34,24126034,Dương Minh Thành,Nam,TMĐT,WEB24TMDT,24126034@student.hcmute.edu.vn
35,24126035,Thân Ngọc Thảo,Nữ,TMĐT,WEB24TMDT,24126035@student.hcmute.edu.vn
36,24126036,Nghiêm Văn Thịnh,Nam,TMĐT,WEB24TMDT,24126036@student.hcmute.edu.vn
37,24126037,Lưu Đức Toàn,Nam,TMĐT,WEB24TMDT,24126037@student.hcmute.edu.vn
38,24126038,Kiều Bảo Trâm,Nữ,TMĐT,WEB24TMDT,24126038@student.hcmute.edu.vn
39,24126039,Kim Quốc Việt,Nam,TMĐT,WEB24TMDT,24126039@student.hcmute.edu.vn
40,24126040,Vũ Hoàng Yến,Nữ,TMĐT,WEB24TMDT,24126040@student.hcmute.edu.vn
41,24131001,Phạm Minh Anh,Nữ,CNTT,PY24CNTT,24131001@student.hcmute.edu.vn
42,24131002,Đỗ Quang Dũng,Nam,CNTT,PY24CNTT,24131002@student.hcmute.edu.vn
43,24131003,Ngô Thị Giang,Nữ,CNTT,PY24CNTT,24131003@student.hcmute.edu.vn
44,24131004,Nguyễn Văn Hải,Nam,CNTT,PY24CNTT,24131004@student.hcmute.edu.vn
45,24131005,Trần Thị Hoa,Nữ,CNTT,PY24CNTT,24131005@student.hcmute.edu.vn
46,24131006,Lê Hữu Hùng,Nam,CNTT,PY24CNTT,24131006@student.hcmute.edu.vn
47,24131007,Hoàng Minh Huy,Nam,CNTT,PY24CNTT,24131007@student.hcmute.edu.vn
48,24131008,Phan Ngọc Khải,Nam,CNTT,PY24CNTT,24131008@student.hcmute.edu.vn
49,24131009,Vũ Đình Lâm,Nam,CNTT,PY24CNTT,24131009@student.hcmute.edu.vn
50,24131010,Bùi Thị Lan,Nữ,CNTT,PY24CNTT,24131010@student.hcmute.edu.vn
51,24131011,Ngô Quốc Long,Nam,CNTT,PY24CNTT,24131011@student.hcmute.edu.vn
52,24131012,Đặng Công Minh,Nam,CNTT,PY24CNTT,24131012@student.hcmute.edu.vn
53,24131013,Lý Thanh Nga,Nữ,CNTT,PY24CNTT,24131013@student.hcmute.edu.vn
54,24131014,Trương Văn Nam,Nam,CNTT,PY24CNTT,24131014@student.hcmute.edu.vn
55,24131015,Võ Ngọc Phát,Nam,CNTT,PY24CNTT,24131015@student.hcmute.edu.vn
56,24131016,Diệp Minh Quân,Nam,CNTT,PY24CNTT,24131016@student.hcmute.edu.vn
57,24131017,Lâm Quốc Quyết,Nam,CNTT,PY24CNTT,24131017@student.hcmute.edu.vn
58,24131018,Đoàn Thị Sen,Nữ,CNTT,PY24CNTT,24131018@student.hcmute.edu.vn
59,24131019,Mai Văn Tài,Nam,CNTT,PY24CNTT,24131019@student.hcmute.edu.vn
60,24131020,Tạ Minh Tâm,Nam,CNTT,PY24CNTT,24131020@student.hcmute.edu.vn
61,24131021,Hứa Văn Thắng,Nam,CNTT,PY24CNTT,24131021@student.hcmute.edu.vn
62,24131022,Cao Diễm Thúy,Nữ,CNTT,PY24CNTT,24131022@student.hcmute.edu.vn
63,24131023,Lương Văn Tiến,Nam,CNTT,PY24CNTT,24131023@student.hcmute.edu.vn
64,24131024,Phùng Minh Trí,Nam,CNTT,PY24CNTT,24131024@student.hcmute.edu.vn
65,24131025,Quách Thị Trinh,Nữ,CNTT,PY24CNTT,24131025@student.hcmute.edu.vn
66,24131026,Âu Quốc Tuấn,Nam,CNTT,PY24CNTT,24131026@student.hcmute.edu.vn
67,24131027,Vương Minh Tùng,Nam,CNTT,PY24CNTT,24131027@student.hcmute.edu.vn
68,24131028,Tống Văn Uy,Nam,CNTT,PY24CNTT,24131028@student.hcmute.edu.vn
69,24131029,Giang Thanh Vân,Nữ,CNTT,PY24CNTT,24131029@student.hcmute.edu.vn
70,24131030,Chu Công Vinh,Nam,CNTT,PY24CNTT,24131030@student.hcmute.edu.vn
71,24131031,Tăng Bảo Xuân,Nữ,CNTT,PY24CNTT,24131031@student.hcmute.edu.vn
72,24131032,Trịnh Quốc Anh,Nam,CNTT,PY24CNTT,24131032@student.hcmute.edu.vn
73,24131033,Đào Thị Bích,Nữ,CNTT,PY24CNTT,24131033@student.hcmute.edu.vn
74,24131034,Thạch Văn Cường,Nam,CNTT,PY24CNTT,24131034@student.hcmute.edu.vn
75,24131035,Dương Thị Đào,Nữ,CNTT,PY24CNTT,24131035@student.hcmute.edu.vn
76,24131036,Thân Văn Hiệp,Nam,CNTT,PY24CNTT,24131036@student.hcmute.edu.vn
77,24131037,Nghiêm Thị Kim,Nữ,CNTT,PY24CNTT,24131037@student.hcmute.edu.vn
78,24131038,Lưu Văn Long,Nam,CNTT,PY24CNTT,24131038@student.hcmute.edu.vn
79,24131039,Kiều Thị Mai,Nữ,CNTT,PY24CNTT,24131039@student.hcmute.edu.vn
80,24131040,Trương Quốc Việt,Nam,CNTT,PY24CNTT,24131040@student.hcmute.edu.vn`;

function chuanhoabanghidanhsachsinhvien(raw) {
  const normalized = chuanhoatruongvanban(raw, ["mssv", "name", "gender", "email", "phone", "faculty", "className"]);
  return {
    ...normalized,
    faculty: chuanhoamakhhoacu(normalized.faculty),
    className: chuanhoamalop(normalized.className)
  };
}

const studentSeedData = studentSeedCsv
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const parts = line.split(",");
    return chuanhoabanghidanhsachsinhvien({
      mssv: parts[1],
      name: parts[2],
      gender: parts[3],
      faculty: parts[4],
      className: parts[5],
      email: parts[6],
      phone: ""
    });
  });

const REMOVED_CLASS_NAMES = new Set(["22DTH1", "22DTH2"]);

function nengiubanghisinhvien(record) {
  return !REMOVED_CLASS_NAMES.has(String(record?.className ?? "").trim());
}

function chuyenthanhbanghisinhvien(record) {
  return {
    mssv: record.mssv,
    name: record.name,
    email: record.email,
    phone: record.phone,
    faculty: record.faculty,
    className: record.className
  };
}

function chuyenthanhbanghilophoc(record) {
  return {
    mssv: record.mssv,
    name: record.name,
    gender: record.gender,
    faculty: record.faculty,
    className: record.className,
    email: record.email
  };
}

const CLASSROOM_STORAGE_KEY = "classroom_students_hcmute";
let classroomStudents = [];

function taidanhsachsinhvien() {
  try {
    const savedDirectory = JSON.parse(localStorage.getItem(STUDENT_DIRECTORY_STORAGE_KEY));
    if (Array.isArray(savedDirectory) && savedDirectory.length > 0) {
      const filteredRecords = savedDirectory
        .map(chuanhoabanghidanhsachsinhvien)
        .filter(nengiubanghisinhvien);

      if (filteredRecords.length !== savedDirectory.length) {
        luudanhsachsinhvien(filteredRecords);
      }

      return filteredRecords;
    }
  } catch (error) {
    // Fallback to seed data below.
  }

  const mergedDirectory = new Map(
    studentSeedData.map((record) => [record.mssv.toLowerCase(), chuanhoabanghidanhsachsinhvien(record)])
  );

  [CLASSROOM_STORAGE_KEY, STUDENT_STORAGE_KEY].forEach((key) => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!Array.isArray(saved)) {
        return;
      }

      saved.forEach((record) => {
        const normalized = chuanhoabanghidanhsachsinhvien(record);
        if (!normalized.mssv || !nengiubanghisinhvien(normalized)) {
          return;
        }

        const mapKey = normalized.mssv.toLowerCase();
        mergedDirectory.set(mapKey, {
          ...(mergedDirectory.get(mapKey) || {}),
          ...normalized
        });
      });
    } catch (error) {
      // Skip invalid legacy storage.
    }
  });

  const records = Array.from(mergedDirectory.values());
  luudanhsachsinhvien(records);
  return records;
}

function hopnhatbanghidanhsachsinhvien(records) {
  const currentDirectory = taidanhsachsinhvien();
  const directoryMap = new Map(
    currentDirectory.map((record) => [record.mssv.toLowerCase(), record])
  );

  return records.map((record) => {
    const key = String(record?.mssv ?? "").trim().toLowerCase();
    return chuanhoabanghidanhsachsinhvien({
      ...(directoryMap.get(key) || {}),
      ...record
    });
  });
}

function luudanhsachsinhvien(records) {
  const normalizedRecords = records
    .map(chuanhoabanghidanhsachsinhvien)
    .filter(nengiubanghisinhvien);

  localStorage.setItem(STUDENT_DIRECTORY_STORAGE_KEY, JSON.stringify(normalizedRecords));
  localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(normalizedRecords.map(chuyenthanhbanghisinhvien)));
  localStorage.setItem(CLASSROOM_STORAGE_KEY, JSON.stringify(normalizedRecords.map(chuyenthanhbanghilophoc)));
}

function chuanhoasinhvienlophoc(raw) {
  const normalized = chuanhoatruongvanban(raw, ["mssv", "name", "gender", "faculty", "className", "email"]);
  return {
    ...normalized,
    faculty: chuanhoamakhhoacu(normalized.faculty),
    className: chuanhoamalop(normalized.className)
  };
}

function taisinhvienlophoc() {
  classroomStudents = taidanhsachsinhvien().map(chuanhoasinhvienlophoc);
}

function luusinhvienlophoc() {
  luudanhsachsinhvien(hopnhatbanghidanhsachsinhvien(classroomStudents));
}

function laydanhsachkhoalophoc() {
  let masterFaculties = [];
  try {
    masterFaculties = laydanhsachkhoa().map((item) => item.code);
  } catch (error) {
    masterFaculties = [];
  }

  return laygiatriduynhatdasapxep([...classroomStudents.map((student) => student.faculty), ...masterFaculties], true);
}

function laydanhsachloptheokhoa(faculty) {
  try {
    return laydanhsachlopmaster()
      .filter((item) => !faculty || faculty === "all" || item.departmentCode === faculty)
      .map((item) => item.name);
  } catch (error) {
    return [];
  }
}


/* /../ =======================================================================
   /../ THONG BAO TIN TUC - thong_bao_tin_tuc.html
   /../ Gom du lieu thong bao he thong; Trang chu cung dung lai cum nay de hien thi thong bao noi bo.
   /../ ======================================================================= */

/* /../ =======================================================================
   /../ TỪNG TRANG: TRANG CHỦ + THÔNG BÁO - trang_chu.html / thong_bao_tin_tuc.html
   /../ Dữ liệu thông báo dùng chung giữa danh sách và lịch sử thông báo
   /../ ======================================================================= */

const ANNOUNCEMENT_STORAGE_KEY = "announcements_hcmute";
const ANNOUNCEMENT_READ_STORAGE_KEY = "announcement_read_state_hcmute";
let announcements = [];
const ANNOUNCEMENT_MAX_FILE_SIZE = 1024 * 1024;

function xacdinhdoituongthongbaomacdinh(target) {
  const normalizedTarget = chuanhoakhotimkiem(target);
  if (normalizedTarget.includes("giảng viên") || normalizedTarget.includes("giang vien")) {
    return "all_lecturers";
  }

  if (normalizedTarget.includes("sinh viên") || normalizedTarget.includes("sinh vien")) {
    return "all_students";
  }

  return "legacy";
}

function xacdinhnhomnguoinhanthongbaomacdinh(item = {}) {
  const normalizedGroup = chuanhoakhotimkiem(item?.recipientGroup || item?.audienceGroup || "");
  if (normalizedGroup.includes("lecturer") || normalizedGroup.includes("giang vien")) {
    return "lecturer";
  }

  if (normalizedGroup.includes("student") || normalizedGroup.includes("sinh vien")) {
    return "student";
  }

  const audienceType = String(item?.audienceType || "").trim();
  if (["all_lecturers", "lecturer"].includes(audienceType)) {
    return "lecturer";
  }

  if (audienceType === "all_students") {
    return "student";
  }

  const normalizedTarget = chuanhoakhotimkiem(item?.target);
  if (normalizedTarget.includes("giảng viên") || normalizedTarget.includes("giang vien")) {
    return "lecturer";
  }

  return "student";
}

function chuanhoathongbao(item) {
  const audienceType = String(item?.audienceType || "").trim() || xacdinhdoituongthongbaomacdinh(item?.target);
  const audienceValue = audienceType === "department"
    ? chuanhoamakhhoacu(item?.audienceValue)
    : String(item?.audienceValue || "").trim();
  const recipientGroup = xacdinhnhomnguoinhanthongbaomacdinh(item);
  const scopeDepartmentCode = chuanhoamakhhoacu(item?.scopeDepartmentCode || "");
  const scopeClassName = String(item?.scopeClassName || "").trim();

  return {
    id: Number(item?.id) || Date.now(),
    title: String(item?.title || "").trim(),
    target: String(item?.target || "").trim(),
    date: String(item?.date || "").trim(),
    createdAt: String(item?.createdAt || chuyenthoigianthongbaoveiso(item?.date) || laythoigianhethong()).trim(),
    content: String(item?.content || "").trim(),
    audienceType,
    audienceValue,
    recipientGroup,
    scopeDepartmentCode,
    scopeClassName,
    createdById: String(item?.createdById || "").trim(),
    createdByName: String(item?.createdByName || "").trim(),
    attachment: item?.attachment && item.attachment.name && item.attachment.dataUrl ? {
      name: String(item.attachment.name).trim(),
      type: String(item.attachment.type || "").trim(),
      size: Number(item.attachment.size) || 0,
      dataUrl: String(item.attachment.dataUrl || "")
    } : null
  };
}

function chuyenthoigianthongbaoveiso(value = "") {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return "";
  }

  const parsedDate = new Date(normalizedValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  const match = normalizedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    return "";
  }

  const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  const normalizedDate = new Date(isoDate);
  return Number.isNaN(normalizedDate.getTime()) ? "" : normalizedDate.toISOString();
}

function laymocsapxepthongbao(item = {}) {
  return String(item?.createdAt || chuyenthoigianthongbaoveiso(item?.date) || "").trim();
}

function doctrangthaidadocthongbaonoibo() {
  const saved = docjsonlocalstorage(ANNOUNCEMENT_READ_STORAGE_KEY, {});
  return saved && typeof saved === "object" ? { ...saved } : {};
}

function luutrangthaidadocthongbaonoibo(records = {}) {
  luujsonlocalstorage(ANNOUNCEMENT_READ_STORAGE_KEY, records && typeof records === "object" ? records : {});
}

function taokhoadadocnoibo(user = currentUser, announcementId = "") {
  const activeUserId = String(user?.id || "").trim();
  const normalizedAnnouncementId = String(announcementId || "").trim();
  return activeUserId && normalizedAnnouncementId ? `${activeUserId}__${normalizedAnnouncementId}` : "";
}

function lathongbaonoibochuadoc(item = {}, user = currentUser) {
  const readKey = taokhoadadocnoibo(user, item?.id);
  if (!readKey) {
    return false;
  }

  return !doctrangthaidadocthongbaonoibo()[readKey];
}

function danhdauthongbaonoibodadoc(announcementId, user = currentUser) {
  const readKey = taokhoadadocnoibo(user, announcementId);
  if (!readKey) {
    return false;
  }

  const records = doctrangthaidadocthongbaonoibo();
  if (records[readKey]) {
    return false;
  }

  records[readKey] = laythoigianhethong();
  luutrangthaidadocthongbaonoibo(records);
  return true;
}

function luuthongbao() {
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(announcements));
}

function taithongbao() {
  try {
    const saved = JSON.parse(localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY));
    announcements = Array.isArray(saved) ? saved.map(chuanhoathongbao) : [];
  } catch (error) {
    announcements = [];
  }

  announcements = announcements.filter((item) => item.title !== "Lịch nghỉ lễ 30/4 - 1/5");
  luuthongbao();

  if (!localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)) {
    luuthongbao();
  }
}

function themthongbaohethong(payload = {}) {
  taithongbao();
  const createdBy = payload.createdById ? laytaikhoantheoid(payload.createdById) : currentUser;
  const nextAnnouncement = chuanhoathongbao({
    ...payload,
    id: payload.id || Date.now(),
    createdById: payload.createdById || createdBy?.id || "",
    createdByName: payload.createdByName || createdBy?.fullName || ""
  });

  if (createdBy?.role === "lecturer") {
    if (nextAnnouncement.audienceType !== "class" || nextAnnouncement.recipientGroup !== "student") {
      return { ok: false, message: "Giảng viên chỉ được gửi thông báo đến sinh viên thuộc học phần mình phụ trách." };
    }

    const managedClasses = laydanhsachlopgiangvienquanly(createdBy);
    if (!managedClasses.length) {
      return { ok: false, message: "Giảng viên chưa được gán phụ trách học phần nào để gửi thông báo." };
    }

    const targetClassName = String(nextAnnouncement.audienceValue || nextAnnouncement.scopeClassName || "").trim();
    if (!targetClassName || !managedClasses.includes(targetClassName)) {
      return { ok: false, message: "Bạn chỉ được gửi thông báo đến sinh viên thuộc học phần mình phụ trách." };
    }

    nextAnnouncement.recipientGroup = "student";
    nextAnnouncement.audienceType = "class";
    nextAnnouncement.audienceValue = targetClassName;
    nextAnnouncement.scopeClassName = targetClassName;
    nextAnnouncement.scopeDepartmentCode = "";
    nextAnnouncement.target = `Sinh viên học phần ${laytenhienthilop(targetClassName) || targetClassName}`;
  }

  announcements.unshift(nextAnnouncement);
  luuthongbao();
  ghinhatkyhethong({
    category: "announcement",
    action: "Gửi thông báo",
    detail: `Gửi thông báo "${nextAnnouncement.title}" tới ${nextAnnouncement.target || "đối tượng đã chọn"}.`,
    status: "success"
  });
  return { ok: true, item: nextAnnouncement, message: "Đã gửi thông báo thành công!" };
}

function laythongbaohethong() {
  taithongbao();
  return announcements.map((item) => ({ ...item }));
}

function laylichsuthongbaodagui(user = currentUser) {
  const activeUser = user || currentUser;
  if (!activeUser) {
    return [];
  }

  return laythongbaohethong().filter((item) => {
    if (item.createdById) {
      return item.createdById === activeUser.id;
    }

    return activeUser.role === "admin";
  });
}

function laymakhoanguoidung(user = currentUser) {
  const activeUser = user || currentUser;
  const rawDepartment = String(activeUser?.department || "").trim();
  if (!rawDepartment) {
    return "";
  }

  const matchedByCode = laykhoatheocode(rawDepartment);
  if (matchedByCode) {
    return matchedByCode.code;
  }

  const normalizedDepartmentName = chuanhoakhotimkiem(chuanhoatenkhoacu(rawDepartment));
  const matchedByName = laydanhsachkhoa().find((item) => chuanhoakhotimkiem(item.name) === normalizedDepartmentName);
  return matchedByName?.code || "";
}

function laythongbaonoibochogiangvien(user = currentUser) {
  const activeUser = user || currentUser;
  if (!activeUser) {
    return [];
  }

  const records = laythongbaohethong().filter((item) => item.recipientGroup === "lecturer");
  if (activeUser.role === "admin") {
    return records.filter((item) => ["all_lecturers", "department", "lecturer", "class"].includes(item.audienceType));
  }

  const assignedCourseClassSet = new Set(laydanhsachlopgiangvienquanly(activeUser));
  const lecturerDepartmentCode = laymakhoanguoidung(activeUser);

  return records.filter((item) => {
    if (item.audienceType === "all_lecturers") {
      return true;
    }

    if (item.audienceType === "department") {
      const targetDepartmentCode = chuanhoamakhhoacu(item.scopeDepartmentCode || item.audienceValue);
      if (targetDepartmentCode && lecturerDepartmentCode) {
        return targetDepartmentCode === lecturerDepartmentCode;
      }

      const targetDepartmentName = laykhoatheocode(targetDepartmentCode || item.audienceValue)?.name || String(item.audienceValue || "").trim();
      const normalizedTargetDepartment = chuanhoakhotimkiem(chuanhoatenkhoacu(targetDepartmentName));
      const normalizedLecturerDepartment = chuanhoakhotimkiem(chuanhoatenkhoacu(activeUser.department));
      return Boolean(normalizedTargetDepartment && normalizedTargetDepartment === normalizedLecturerDepartment);
    }

    if (item.audienceType === "lecturer") {
      return item.audienceValue === activeUser.id;
    }

    if (item.audienceType === "class") {
      const targetClassCode = chuanhoamalop(item.audienceValue || item.scopeClassName);
      return assignedCourseClassSet.has(targetClassCode);
    }

    return false;
  });
}

function dinhdangkichthuoctepthongbao(size) {
  if (!size) {
    return "0 KB";
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}


/* /../ =======================================================================
   /../ NHAP DIEM - nhap_diem.html
   /../ Gom logic mo khoa diem, phe duyet yeu cau va cap nhat chuong thong bao quan tri.
   /../ ======================================================================= */

function chuanhoamalopyeucau(code = "") {
  return String(code || "").trim().toUpperCase();
}

function chuanhoadangdocyeucaumokhoadiem(raw = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return Object.entries(raw).reduce((result, [adminId, record]) => {
    const normalizedAdminId = String(adminId || "").trim();
    if (!normalizedAdminId) {
      return result;
    }

    result[normalizedAdminId] = {
      readAt: String(record?.readAt || "").trim(),
      readByName: String(record?.readByName || "").trim()
    };
    return result;
  }, {});
}

function chuanhoayeucaumokhoadiem(raw = {}) {
  const legacyReadById = String(raw.readById || "").trim();
  const normalizedReadByAdmins = chuanhoadangdocyeucaumokhoadiem(raw.readByAdmins);
  if (legacyReadById && !normalizedReadByAdmins[legacyReadById]) {
    normalizedReadByAdmins[legacyReadById] = {
      readAt: String(raw.readAt || "").trim(),
      readByName: String(raw.readByName || "").trim()
    };
  }

  return {
    id: String(raw.id || taomaidinhdanh("grade_req")).trim(),
    createdAt: String(raw.createdAt || laythoigianhethong()).trim(),
    lecturerId: String(raw.lecturerId || "").trim(),
    lecturerName: String(raw.lecturerName || "").trim(),
    faculty: String(raw.faculty || "").trim(),
    className: chuanhoamalopyeucau(raw.className || ""),
    classDisplayName: String(raw.classDisplayName || raw.className || "").trim(),
    subject: String(raw.subject || "").trim(),
    status: ["approved", "rejected"].includes(String(raw.status || "").trim()) ? String(raw.status).trim() : "pending",
    readAt: String(raw.readAt || "").trim(),
    readById: String(raw.readById || "").trim(),
    readByName: String(raw.readByName || "").trim(),
    readByAdmins: normalizedReadByAdmins,
    resolvedAt: String(raw.resolvedAt || "").trim(),
    resolvedById: String(raw.resolvedById || "").trim(),
    resolvedByName: String(raw.resolvedByName || "").trim(),
    note: String(raw.note || "").trim()
  };
}

function laydanhsachyeucaumokhoadiem() {
  const saved = docjsonlocalstorage(GRADE_UNLOCK_REQUEST_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.map(chuanhoayeucaumokhoadiem) : [];
}

function luudanhsachyeucaumokhoadiem(records = []) {
  luujsonlocalstorage(
    GRADE_UNLOCK_REQUEST_STORAGE_KEY,
    records.map(chuanhoayeucaumokhoadiem)
  );
}

function timyeucaumokhoadiemdangcho(lecturerId = "", className = "") {
  const normalizedLecturerId = String(lecturerId || "").trim();
  const normalizedClassName = chuanhoamalopyeucau(className);
  if (!normalizedLecturerId || !normalizedClassName) {
    return null;
  }

  return laydanhsachyeucaumokhoadiem().find((item) => {
    return item.status === "pending"
      && item.lecturerId === normalizedLecturerId
      && item.className === normalizedClassName;
  }) || null;
}

function kiemtrayeucaumokhoadiemdadocboiadmin(item = {}, actor = currentUser) {
  const adminId = String(actor?.id || "").trim();
  if (!adminId) {
    return false;
  }

  if (item.readByAdmins && item.readByAdmins[adminId]?.readAt) {
    return true;
  }

  return item.readById === adminId && Boolean(item.readAt);
}

function demyeucaumokhoadiemchoduyet(actor = currentUser) {
  return laydanhsachyeucaumokhoadiem().filter((item) => {
    return item.status === "pending" && !kiemtrayeucaumokhoadiemdadocboiadmin(item, actor);
  }).length;
}

function taikhoadiemdangluu() {
  const saved = docjsonlocalstorage(GRADE_LOCK_STORAGE_KEY, {});
  return saved && typeof saved === "object" ? { ...saved } : {};
}

function guiyeucaumokhoadiem(payload = {}) {
  const lecturerId = String(payload.lecturerId || currentUser?.id || "").trim();
  const lecturer = laytaikhoantheoid(lecturerId);
  const className = chuanhoamalopyeucau(payload.className || "");
  if (!lecturerId || !className) {
    return { ok: false, message: "Thiếu thông tin học phần hoặc giảng viên để gửi yêu cầu." };
  }

  const existingPending = timyeucaumokhoadiemdangcho(lecturerId, className);
  if (existingPending) {
    return { ok: false, message: "Yêu cầu mở khóa cho học phần này đang chờ quản trị viên xử lý." };
  }

  const nextRequest = chuanhoayeucaumokhoadiem({
    ...payload,
    lecturerId,
    lecturerName: payload.lecturerName || lecturer?.fullName || currentUser?.fullName || "Giảng viên"
  });

  luudanhsachyeucaumokhoadiem([nextRequest, ...laydanhsachyeucaumokhoadiem()]);
  ghinhatkyhethong({
    category: "assignment",
    action: "Yêu cầu mở khóa nhập điểm",
    detail: `${nextRequest.lecturerName} yêu cầu mở khóa điểm học phần ${nextRequest.className}.`,
    status: "warning"
  });
  return { ok: true, item: nextRequest, message: "Đã gửi yêu cầu mở khóa nhập điểm tới quản trị viên." };
}

function danhdayeucaumokhoadiemdadoc(actor = currentUser) {
  const readerId = String(actor?.id || "").trim();
  const readerName = String(actor?.fullName || "Quản trị viên").trim();
  if (!readerId || actor?.role !== "admin") {
    return false;
  }

  const readAt = laythoigianhethong();
  let hasChanges = false;

  const nextRecords = laydanhsachyeucaumokhoadiem().map((item) => {
    if (item.status !== "pending" || kiemtrayeucaumokhoadiemdadocboiadmin(item, actor)) {
      return item;
    }

    hasChanges = true;
    const nextReadByAdmins = {
      ...(item.readByAdmins || {}),
      [readerId]: {
        readAt,
        readByName: readerName
      }
    };
    return chuanhoayeucaumokhoadiem({
      ...item,
      readAt,
      readById: readerId,
      readByName: readerName,
      readByAdmins: nextReadByAdmins
    });
  });

  if (hasChanges) {
    luudanhsachyeucaumokhoadiem(nextRecords);
  }

  return hasChanges;
}

function chapnhanyeucaumokhoadiem(id, actor = currentUser) {
  const targetId = String(id || "").trim();
  const records = laydanhsachyeucaumokhoadiem();
  const target = records.find((item) => item.id === targetId);
  if (!target) {
    return { ok: false, message: "Không tìm thấy yêu cầu mở khóa cần xử lý." };
  }

  if (target.status !== "pending") {
    return { ok: false, message: "Yêu cầu này đã được xử lý trước đó." };
  }

  const key = `${target.faculty}__${chuanhoamalopyeucau(target.className)}`;
  const nextLockState = taikhoadiemdangluu();
  delete nextLockState[key];
  luujsonlocalstorage(GRADE_LOCK_STORAGE_KEY, nextLockState);

  const resolvedAt = laythoigianhethong();
  const resolvedById = String(actor?.id || "").trim();
  const resolvedByName = String(actor?.fullName || "Quản trị viên").trim();

  luudanhsachyeucaumokhoadiem(records.map((item) => {
    const sameClass = item.status === "pending"
      && item.faculty === target.faculty
      && item.className === target.className;
    if (!sameClass) {
      return item;
    }

    const nextReadByAdmins = {
      ...(item.readByAdmins || {}),
      ...(resolvedById ? {
        [resolvedById]: {
          readAt: item.readByAdmins?.[resolvedById]?.readAt || resolvedAt,
          readByName: item.readByAdmins?.[resolvedById]?.readByName || resolvedByName
        }
      } : {})
    };
    return chuanhoayeucaumokhoadiem({
      ...item,
      status: "approved",
      readAt: item.readAt || resolvedAt,
      readById: item.readById || resolvedById,
      readByName: item.readByName || resolvedByName,
      readByAdmins: nextReadByAdmins,
      resolvedAt,
      resolvedById,
      resolvedByName,
      note: item.note || "Đã chấp nhận mở khóa nhập điểm."
    });
  }));

  ghinhatkyhethong({
    category: "assignment",
    action: "Chấp nhận yêu cầu mở khóa nhập điểm",
    detail: `${resolvedByName} đã mở khóa điểm học phần ${target.className} theo yêu cầu của ${target.lecturerName}.`,
    status: "success"
  });
  themthongbaocanhan({
    recipientId: target.lecturerId,
    recipientName: target.lecturerName,
    title: "Yêu cầu nhập điểm đã được chấp nhận",
    content: `${resolvedByName} đã chấp nhận yêu cầu mở khóa điểm cho học phần ${target.className}. Bạn có thể quay lại trang nhập điểm để thao tác.`,
    type: "grade_unlock_approved",
    link: "trang_chu.html#lecturerNotifications"
  });
  return { ok: true, item: { ...target, status: "approved", resolvedAt, resolvedById, resolvedByName }, message: `Đã mở khóa điểm học phần ${target.className}.` };
}

function tuchoiyeucaumokhoadiem(id, actor = currentUser) {
  const targetId = String(id || "").trim();
  const records = laydanhsachyeucaumokhoadiem();
  const target = records.find((item) => item.id === targetId);
  if (!target) {
    return { ok: false, message: "Không tìm thấy yêu cầu mở khóa cần xử lý." };
  }

  if (target.status !== "pending") {
    return { ok: false, message: "Yêu cầu này đã được xử lý trước đó." };
  }

  const resolvedAt = laythoigianhethong();
  const resolvedById = String(actor?.id || "").trim();
  const resolvedByName = String(actor?.fullName || "Quản trị viên").trim();

  luudanhsachyeucaumokhoadiem(records.map((item) => {
    if (item.id !== targetId) {
      return item;
    }

    const nextReadByAdmins = {
      ...(item.readByAdmins || {}),
      ...(resolvedById ? {
        [resolvedById]: {
          readAt: item.readByAdmins?.[resolvedById]?.readAt || resolvedAt,
          readByName: item.readByAdmins?.[resolvedById]?.readByName || resolvedByName
        }
      } : {})
    };
    return chuanhoayeucaumokhoadiem({
      ...item,
      status: "rejected",
      readAt: item.readAt || resolvedAt,
      readById: item.readById || resolvedById,
      readByName: item.readByName || resolvedByName,
      readByAdmins: nextReadByAdmins,
      resolvedAt,
      resolvedById,
      resolvedByName,
      note: item.note || "Đã từ chối yêu cầu mở khóa nhập điểm."
    });
  }));

  ghinhatkyhethong({
    category: "assignment",
    action: "Từ chối yêu cầu mở khóa nhập điểm",
    detail: `${resolvedByName} đã từ chối yêu cầu mở khóa điểm học phần ${target.className} của ${target.lecturerName}.`,
    status: "warning"
  });
  themthongbaocanhan({
    recipientId: target.lecturerId,
    recipientName: target.lecturerName,
    title: "Yêu cầu nhập điểm đã bị từ chối",
    content: `${resolvedByName} đã từ chối yêu cầu mở khóa điểm cho học phần ${target.className}.`,
    type: "grade_unlock_rejected",
    link: "trang_chu.html#lecturerNotifications"
  });
  return { ok: true, item: { ...target, status: "rejected", resolvedAt, resolvedById, resolvedByName }, message: `Đã từ chối yêu cầu mở khóa điểm học phần ${target.className}.` };
}

function danhdayeucauadminchodoc(actor = currentUser) {
  return Boolean(danhdayeucaumokhoadiemdadoc(actor));
}

function demtongyeucauadminchoduyet(actor = currentUser) {
  return demyeucaumokhoadiemchoduyet(actor);
}

function capnhatbieututhongbaoadmin() {
  const badge = document.getElementById("adminRequestBellBadge");
  const link = document.getElementById("adminRequestBellLink");
  const activeUser = laynguoidungdangnhap();
  const count = activeUser?.role === "admin"
    ? demtongyeucauadminchoduyet(activeUser)
    : demthongbaocanhanchuadoc(activeUser);
  const label = activeUser?.role === "admin"
    ? (count > 0
      ? `Có ${count} yêu cầu mới đang chờ xử lý`
      : "Không có yêu cầu mới")
    : (count > 0
      ? `Có ${count} thông báo mới`
      : "Không có thông báo mới");

  if (badge) {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count === 0;
  }

  if (link) {
    link.classList.toggle("has-pending", count > 0);
    link.setAttribute("aria-label", label);
  }

  return count;
}


/* /../ =======================================================================
   /../ KHOI TAO CUOI FILE
   /../ Dong bo phien dang nhap truoc, sau do moi dang ky custom element va gan su kien chung.
   /../ ======================================================================= */

dambaophanquyen();
dongbonguoidungdangnhap();

customElements.define("my-sidebar", MySidebar);
customElements.define("my-header", MyHeader);
customElements.define("my-footer", MyFooter);

/* /../ =======================================================================
   /../ KHỞI TẠO CUỐI FILE
   /../ Đăng ký sự kiện chung và nạp dữ liệu ban đầu cho các trang cần dùng
   /../ ======================================================================= */

document.addEventListener("click", function (e) {
  const logoutButton = e.target.closest("[data-action='logout-system']");
  if (logoutButton) {
    e.preventDefault();
    dangxuathethong();
    return;
  }

  const menuToggle = e.target.closest(".menu-toggle");
  if (menuToggle) {
    battatthanhben();
    return;
  }

  const overlay = e.target.closest(".sidebar-overlay");
  if (overlay) {
    dongthanhben();
    return;
  }

  if (window.innerWidth <= 900) {
    const clickedMenuLink = e.target.closest(".menu-item a");
    if (clickedMenuLink) {
      dongthanhben();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  capnhatbieututhongbaoadmin();
  const authMessage = laythongbaoauth();
  if (!authMessage) {
    return;
  }

  if (laytranghientai() === LOGIN_PAGE && typeof showLoginToast === "function") {
    showLoginToast(authMessage, "error");
    return;
  }

  hienhithongbao(authMessage, "error");
});

window.addEventListener("storage", function (event) {
  if (
    event.key !== GRADE_UNLOCK_REQUEST_STORAGE_KEY
    && event.key !== USER_NOTIFICATION_STORAGE_KEY
  ) {
    return;
  }

  capnhatbieututhongbaoadmin();
});