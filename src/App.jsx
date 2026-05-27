import { useState, useEffect, createContext, useContext } from "react";

// ─── DB helpers (localStorage) ───────────────────────────────────────────────
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) ?? null; } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  init: () => {
    if (!DB.get("hm_users")) {
      DB.set("hm_users", [
        { id: "t1", name: "Анна Сергеевна", email: "teacher@demo.com", password: "teacher123", role: "teacher" },
        { id: "s1", name: "Алибек Дауренов", email: "student@demo.com", password: "student123", role: "student" },
      ]);
    }
    if (!DB.get("hm_assignments")) DB.set("hm_assignments", []);
    if (!DB.get("hm_submissions")) DB.set("hm_submissions", []);
  },
  getUsers: () => DB.get("hm_users") || [],
  getAssignments: () => DB.get("hm_assignments") || [],
  getSubmissions: () => DB.get("hm_submissions") || [],
  saveAssignments: (a) => DB.set("hm_assignments", a),
  saveSubmissions: (s) => DB.set("hm_submissions", s),
  saveUsers: (u) => DB.set("hm_users", u),
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── Unique ID ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;800&family=Onest:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f;
    --bg2: #111118;
    --bg3: #1a1a26;
    --card: #13131e;
    --border: #2a2a3d;
    --accent: #7c6aff;
    --accent2: #ff6a9f;
    --accent3: #6affc4;
    --text: #f0f0fa;
    --text2: #9090b0;
    --text3: #5a5a7a;
    --radius: 16px;
    --shadow: 0 8px 40px rgba(0,0,0,.5);
  }
  html, body, #root { height: 100%; font-family: 'Onest', sans-serif; background: var(--bg); color: var(--text); }
  h1,h2,h3,h4 { font-family: 'Unbounded', sans-serif; }
  button { cursor: pointer; font-family: 'Onest', sans-serif; border: none; }
  input, textarea, select { font-family: 'Onest', sans-serif; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg2); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Animations */
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  @keyframes gradMove { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  .fadeUp { animation: fadeUp .5s ease forwards; }
  .fadeIn { animation: fadeIn .4s ease forwards; }

  /* Layout */
  .app { min-height: 100vh; }
  .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

  /* Navbar */
  .navbar {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,10,15,.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between;
  }
  .navbar-logo { font-family:'Unbounded',sans-serif; font-size:18px; font-weight:800; 
    background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .navbar-actions { display:flex; gap:12px; align-items:center; }

  /* Buttons */
  .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; transition:.2s; }
  .btn-primary { background:var(--accent); color:#fff; }
  .btn-primary:hover { background:#6c5aef; transform:translateY(-1px); box-shadow:0 4px 20px rgba(124,106,255,.4); }
  .btn-ghost { background:transparent; color:var(--text2); border:1px solid var(--border); }
  .btn-ghost:hover { color:var(--text); border-color:var(--accent); background:rgba(124,106,255,.08); }
  .btn-danger { background:rgba(255,80,80,.15); color:#ff6060; border:1px solid rgba(255,80,80,.2); }
  .btn-danger:hover { background:rgba(255,80,80,.25); }
  .btn-success { background:rgba(106,255,196,.12); color:var(--accent3); border:1px solid rgba(106,255,196,.2); }
  .btn-success:hover { background:rgba(106,255,196,.22); }
  .btn-sm { padding:6px 14px; font-size:13px; border-radius:8px; }
  .btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

  /* Forms */
  .field { display:flex; flex-direction:column; gap:8px; }
  .field label { font-size:13px; font-weight:600; color:var(--text2); text-transform:uppercase; letter-spacing:.05em; }
  .field input, .field textarea, .field select {
    background:var(--bg3); border:1px solid var(--border); color:var(--text);
    border-radius:10px; padding:12px 16px; font-size:15px; outline:none; transition:.2s;
    width:100%;
  }
  .field input:focus, .field textarea:focus, .field select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,106,255,.15); }
  .field textarea { resize:vertical; min-height:100px; }

  /* Cards */
  .card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; }
  .card-sm { padding:16px; border-radius:12px; }

  /* Badge */
  .badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600; }
  .badge-purple { background:rgba(124,106,255,.15); color:var(--accent); }
  .badge-pink { background:rgba(255,106,159,.15); color:var(--accent2); }
  .badge-green { background:rgba(106,255,196,.15); color:var(--accent3); }
  .badge-gray { background:rgba(144,144,176,.1); color:var(--text2); }
  .badge-orange { background:rgba(255,166,80,.15); color:#ffa650; }

  /* Toast */
  .toast {
    position:fixed; bottom:32px; right:32px; z-index:999;
    background:var(--card); border:1px solid var(--border); border-radius:12px;
    padding:14px 20px; display:flex; align-items:center; gap:12px;
    box-shadow:var(--shadow); animation:fadeUp .3s ease;
    max-width:340px;
  }
  .toast-success { border-color:rgba(106,255,196,.3); }
  .toast-error { border-color:rgba(255,80,80,.3); }

  /* Modal */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(4px);
    z-index:200; display:flex; align-items:center; justify-content:center; padding:24px;
    animation:fadeIn .2s ease;
  }
  .modal {
    background:var(--card); border:1px solid var(--border); border-radius:20px;
    padding:32px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto;
    box-shadow:var(--shadow); animation:fadeUp .3s ease;
  }
  .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
  .modal-title { font-size:20px; font-weight:700; }

  /* Dashboard layout */
  .dashboard { display:flex; min-height:calc(100vh - 64px); }
  .sidebar {
    width:260px; flex-shrink:0; background:var(--bg2); border-right:1px solid var(--border);
    padding:24px 16px; display:flex; flex-direction:column; gap:4px; position:sticky; top:64px; height:calc(100vh - 64px);
  }
  .sidebar-item {
    display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:10px;
    color:var(--text2); font-size:14px; font-weight:500; cursor:pointer; transition:.15s;
    border: none; background: transparent; width: 100%; text-align: left;
  }
  .sidebar-item:hover { color:var(--text); background:rgba(255,255,255,.04); }
  .sidebar-item.active { color:var(--accent); background:rgba(124,106,255,.1); }
  .sidebar-divider { height:1px; background:var(--border); margin:8px 0; }
  .main-content { flex:1; padding:32px; overflow-y:auto; }

  /* Stats row */
  .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }
  .stat-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; }
  .stat-value { font-family:'Unbounded',sans-serif; font-size:28px; font-weight:700; margin-bottom:4px; }
  .stat-label { font-size:13px; color:var(--text2); }

  /* Table */
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:12px 16px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text3); border-bottom:1px solid var(--border); }
  td { padding:14px 16px; border-bottom:1px solid rgba(42,42,61,.5); vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,.02); }

  /* Assignment card */
  .assignment-card {
    background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;
    transition:.2s; cursor:pointer;
  }
  .assignment-card:hover { border-color:var(--accent); box-shadow:0 4px 24px rgba(124,106,255,.15); }
  .assignment-title { font-size:16px; font-weight:600; margin-bottom:6px; }
  .assignment-meta { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }

  /* Period tabs */
  .period-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .period-tab { padding:8px 18px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid var(--border); background:transparent; color:var(--text2); cursor:pointer; transition:.15s; }
  .period-tab.active { background:var(--accent); color:#fff; border-color:var(--accent); }
  .period-tab:hover:not(.active) { color:var(--text); border-color:var(--accent); }

  /* Grid */
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  @media(max-width:700px) { .grid-2,.grid-3 { grid-template-columns:1fr; } .sidebar { display:none; } }

  /* ── LANDING ── */
  .landing { overflow-x:hidden; }
  .hero {
    min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:80px 24px; position:relative; overflow:hidden;
  }
  .hero-bg {
    position:absolute; inset:0; z-index:0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,106,255,.18) 0%, transparent 70%),
                radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,106,159,.12) 0%, transparent 60%),
                radial-gradient(ellipse 50% 50% at 20% 60%, rgba(106,255,196,.08) 0%, transparent 60%);
  }
  .hero-content { position:relative; z-index:1; max-width:780px; }
  .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; background:rgba(124,106,255,.12); border:1px solid rgba(124,106,255,.25); border-radius:999px; padding:6px 16px; font-size:13px; color:var(--accent); font-weight:600; margin-bottom:28px; }
  .hero-title { font-size:clamp(38px,7vw,80px); font-weight:800; line-height:1.05; margin-bottom:20px; letter-spacing:-.02em; }
  .hero-title .grad { background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-sub { font-size:18px; color:var(--text2); line-height:1.7; margin-bottom:40px; max-width:560px; margin-left:auto; margin-right:auto; }
  .hero-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
  .btn-xl { padding:14px 32px; font-size:16px; border-radius:12px; }

  .features { padding:100px 24px; }
  .section-label { text-align:center; font-size:13px; color:var(--accent); font-weight:600; text-transform:uppercase; letter-spacing:.1em; margin-bottom:12px; }
  .section-title { text-align:center; font-size:clamp(24px,4vw,42px); font-weight:800; margin-bottom:56px; line-height:1.2; }
  .feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; max-width:1000px; margin:0 auto; }
  .feat-card { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:28px; transition:.2s; }
  .feat-card:hover { border-color:var(--accent); transform:translateY(-4px); box-shadow:0 12px 40px rgba(124,106,255,.15); }
  .feat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .feat-title { font-size:18px; font-weight:700; margin-bottom:8px; }
  .feat-desc { color:var(--text2); font-size:14px; line-height:1.7; }

  .how { padding:80px 24px; background:var(--bg2); }
  .steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:32px; max-width:900px; margin:0 auto; }
  .step { text-align:center; }
  .step-num { font-family:'Unbounded',sans-serif; font-size:48px; font-weight:800; color:var(--border); line-height:1; margin-bottom:12px; }
  .step-title { font-size:16px; font-weight:700; margin-bottom:8px; }
  .step-desc { color:var(--text2); font-size:14px; line-height:1.6; }

  .cta-section { padding:100px 24px; text-align:center; }
  .cta-box { background:linear-gradient(135deg,rgba(124,106,255,.15),rgba(255,106,159,.1)); border:1px solid rgba(124,106,255,.2); border-radius:24px; padding:60px 40px; max-width:700px; margin:0 auto; }

  .footer { padding:32px 24px; border-top:1px solid var(--border); text-align:center; color:var(--text3); font-size:13px; }

  /* Auth page */
  .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; }
  .auth-bg {
    position:fixed; inset:0; z-index:0;
    background: radial-gradient(ellipse 60% 50% at 30% 40%, rgba(124,106,255,.12) 0%, transparent 60%),
                radial-gradient(ellipse 50% 40% at 70% 70%, rgba(255,106,159,.08) 0%, transparent 60%);
  }
  .auth-card { position:relative; z-index:1; background:var(--card); border:1px solid var(--border); border-radius:24px; padding:40px; width:100%; max-width:460px; box-shadow:var(--shadow); }
  .auth-title { font-size:26px; font-weight:800; margin-bottom:6px; }
  .auth-sub { color:var(--text2); font-size:14px; margin-bottom:32px; }
  .auth-form { display:flex; flex-direction:column; gap:20px; }
  .auth-switch { text-align:center; margin-top:20px; color:var(--text2); font-size:14px; }
  .auth-switch span { color:var(--accent); cursor:pointer; font-weight:600; }
  .auth-switch span:hover { text-decoration:underline; }
  .role-tabs { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .role-tab { padding:12px; border-radius:10px; border:2px solid var(--border); background:transparent; color:var(--text2); font-size:14px; font-weight:600; cursor:pointer; transition:.15s; text-align:center; }
  .role-tab.active { border-color:var(--accent); color:var(--accent); background:rgba(124,106,255,.1); }

  /* Page header */
  .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
  .page-title { font-size:26px; font-weight:800; }
  .page-sub { color:var(--text2); font-size:14px; margin-top:4px; }

  /* Empty state */
  .empty { text-align:center; padding:60px 20px; color:var(--text3); }
  .empty svg { margin-bottom:16px; opacity:.3; }
  .empty-title { font-size:16px; font-weight:600; color:var(--text2); margin-bottom:6px; }
  .empty-sub { font-size:14px; }

  /* Submission area */
  .submission-area { margin-top:12px; background:var(--bg3); border-radius:10px; padding:16px; }
  .submission-grade { display:inline-flex; align-items:center; gap:6px; font-size:22px; font-weight:800; font-family:'Unbounded',sans-serif; }

  /* Progress bar */
  .progress-bar { height:6px; background:var(--bg3); border-radius:3px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:3px; transition:.4s; }

  .divider { height:1px; background:var(--border); margin:20px 0; }
  .text-right { text-align:right; }
  .text-center { text-align:center; }
  .mt-4 { margin-top:16px; }
  .mt-6 { margin-top:24px; }
  .flex { display:flex; } .items-center { align-items:center; } .gap-2 { gap:8px; } .gap-3 { gap:12px; }
  .justify-between { justify-content:space-between; } .flex-wrap { flex-wrap:wrap; }
  .w-full { width:100%; }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast toast-${type}`}>
      <Icon name={type === "success" ? "check" : "alert"} size={18} color={type === "success" ? "var(--accent3)" : "#ff6060"} />
      <span style={{ fontSize: 14 }}>{message}</span>
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", color: "var(--text2)" }}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onNav }) {
  const features = [
    { icon: "edit", color: "#7c6aff", bg: "rgba(124,106,255,.15)", title: "Выдача заданий", desc: "Учитель создаёт задания за секунды — текст, срок сдачи, класс. Студенты получают мгновенно." },
    { icon: "check", color: "#6affc4", bg: "rgba(106,255,196,.15)", title: "Проверка и оценки", desc: "Удобный интерфейс проверки работ. Поставьте оценку и комментарий прямо в платформе." },
    { icon: "clock", color: "#ffa650", bg: "rgba(255,166,80,.15)", title: "Периоды и сроки", desc: "Задания сгруппированы по периодам — неделя, месяц. Студент всегда видит что и когда сдать." },
    { icon: "users", color: "#ff6a9f", bg: "rgba(255,106,159,.15)", title: "Управление классом", desc: "Учитель видит всех студентов, их прогресс и статус сданных работ на одном экране." },
    { icon: "award", color: "#7c6aff", bg: "rgba(124,106,255,.15)", title: "Прогресс студента", desc: "Наглядная статистика: сколько заданий сдано, средняя оценка, динамика по времени." },
    { icon: "eye", color: "#6affc4", bg: "rgba(106,255,196,.15)", title: "Прозрачность", desc: "Каждый видит только своё. Студент — свои задания, учитель — всё по классу." },
  ];

  return (
    <div className="landing">
      <nav className="navbar">
        <div className="navbar-logo">EduFlow</div>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={() => onNav("login")}>Войти</button>
          <button className="btn btn-primary" onClick={() => onNav("register")}>Начать бесплатно</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content fadeUp">
          <div className="hero-eyebrow"><Icon name="star" size={14} /> Платформа для образования</div>
          <h1 className="hero-title">Домашние задания<br /><span className="grad">нового поколения</span></h1>
          <p className="hero-sub">Учителя выдают задания, студенты сдают работы, оценки — в одном месте. Никаких тетрадей, мессенджеров и путаницы.</p>
          <div className="hero-btns">
            <button className="btn btn-primary btn-xl" onClick={() => onNav("register")}>
              <Icon name="plus" size={18} /> Создать аккаунт
            </button>
            <button className="btn btn-ghost btn-xl" onClick={() => onNav("login")}>Войти в систему</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-label">Возможности</div>
          <h2 className="section-title">Всё что нужно<br />учителям и студентам</h2>
          <div className="feat-grid">
            {features.map((f, i) => (
              <div className="feat-card" key={i} style={{ animationDelay: `${i * .08}s` }}>
                <div className="feat-icon" style={{ background: f.bg }}>
                  <Icon name={f.icon} size={22} color={f.color} />
                </div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container">
          <div className="section-label">Как это работает</div>
          <h2 className="section-title">Три шага до результата</h2>
          <div className="steps">
            {[
              { n: "01", t: "Зарегистрируйтесь", d: "Выберите роль — учитель или студент. Заполните профиль за 30 секунд." },
              { n: "02", t: "Выдайте задание", d: "Учитель пишет задание и выбирает срок. Студенты видят его сразу в дашборде." },
              { n: "03", t: "Сдайте и получите оценку", d: "Студент отправляет ответ, учитель проверяет и ставит оценку с комментарием." },
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Готовы начать?</h2>
          <p style={{ color: "var(--text2)", marginBottom: 28, fontSize: 16 }}>Присоединяйтесь бесплатно. Без карты, без ограничений.</p>
          <button className="btn btn-primary btn-xl" onClick={() => onNav("register")}>
            <Icon name="plus" size={18} /> Создать аккаунт
          </button>
        </div>
      </section>

      <footer className="footer">
        <div>© 2025 EduFlow — платформа для домашних заданий</div>
        <div style={{ marginTop: 4 }}>
          <span style={{ color: "var(--text2)" }}>Демо: </span>
          <span style={{ color: "var(--accent)" }}>teacher@demo.com</span> / teacher123 &nbsp;·&nbsp;
          <span style={{ color: "var(--accent)" }}>student@demo.com</span> / student123
        </div>
      </footer>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthPage({ mode, onNav, onLogin, showToast }) {
  const isLogin = mode === "login";
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = () => {
    setErr("");
    const users = DB.getUsers();
    if (isLogin) {
      const u = users.find(u => u.email === form.email && u.password === form.password);
      if (!u) { setErr("Неверный email или пароль"); return; }
      onLogin(u);
      showToast(`Добро пожаловать, ${u.name}!`, "success");
    } else {
      if (!form.name || !form.email || !form.password) { setErr("Заполните все поля"); return; }
      if (users.find(u => u.email === form.email)) { setErr("Email уже используется"); return; }
      const u = { id: uid(), name: form.name, email: form.email, password: form.password, role };
      DB.saveUsers([...users, u]);
      onLogin(u);
      showToast("Аккаунт создан!", "success");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, right: 0 }}>
        <div className="navbar-logo" onClick={() => onNav("landing")} style={{ cursor: "pointer" }}>EduFlow</div>
      </nav>
      <div className="auth-card fadeUp" style={{ marginTop: 64 }}>
        <div className="auth-title">{isLogin ? "Вход в систему" : "Создать аккаунт"}</div>
        <div className="auth-sub">{isLogin ? "Введите данные для входа" : "Выберите роль и заполните форму"}</div>
        <div className="auth-form">
          {!isLogin && (
            <>
              <div className="field">
                <label>Роль</label>
                <div className="role-tabs">
                  <button className={`role-tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>🎓 Студент</button>
                  <button className={`role-tab ${role === "teacher" ? "active" : ""}`} onClick={() => setRole("teacher")}>👩‍🏫 Учитель</button>
                </div>
              </div>
              <div className="field">
                <label>Полное имя</label>
                <input placeholder="Алибек Дауренов" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="example@mail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {err && <div style={{ color: "#ff6060", fontSize: 13, background: "rgba(255,80,80,.08)", padding: "10px 14px", borderRadius: 8 }}>{err}</div>}
          <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "14px" }} onClick={submit}>
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </div>
        <div className="auth-switch">
          {isLogin ? <>Нет аккаунта? <span onClick={() => onNav("register")}>Зарегистрироваться</span></> : <>Уже есть аккаунт? <span onClick={() => onNav("login")}>Войти</span></>}
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard({ user, onLogout, showToast }) {
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState(DB.getAssignments());
  const [submissions, setSubmissions] = useState(DB.getSubmissions());
  const [students, setStudents] = useState(DB.getUsers().filter(u => u.role === "student"));
  const [modal, setModal] = useState(null); // "new" | {assignment} for grading
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", subject: "" });
  const [gradeForm, setGradeForm] = useState({ grade: "", comment: "" });

  const refresh = () => {
    setAssignments(DB.getAssignments());
    setSubmissions(DB.getSubmissions());
    setStudents(DB.getUsers().filter(u => u.role === "student"));
  };

  const createAssignment = () => {
    if (!form.title || !form.dueDate) { showToast("Заполните название и срок", "error"); return; }
    const a = { id: uid(), teacherId: user.id, teacherName: user.name, ...form, createdAt: new Date().toISOString() };
    const all = [...DB.getAssignments(), a];
    DB.saveAssignments(all);
    refresh();
    setModal(null);
    setForm({ title: "", description: "", dueDate: "", subject: "" });
    showToast("Задание создано!", "success");
  };

  const gradeSubmission = (sub) => {
    if (!gradeForm.grade) { showToast("Введите оценку", "error"); return; }
    const all = DB.getSubmissions().map(s => s.id === sub.id ? { ...s, grade: gradeForm.grade, comment: gradeForm.comment, gradedAt: new Date().toISOString() } : s);
    DB.saveSubmissions(all);
    refresh();
    setModal(null);
    setGradeForm({ grade: "", comment: "" });
    showToast("Оценка выставлена!", "success");
  };

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const pending = submissions.filter(s => myAssignments.find(a => a.id === s.assignmentId) && !s.grade);
  const graded = submissions.filter(s => myAssignments.find(a => a.id === s.assignmentId) && s.grade);

  const sidebarItems = [
    { key: "overview", icon: "home", label: "Обзор" },
    { key: "assignments", icon: "book", label: "Задания" },
    { key: "students", icon: "users", label: "Студенты" },
    { key: "submissions", icon: "send", label: "На проверке" },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-logo">EduFlow</div>
        <div className="navbar-actions">
          <span className="badge badge-purple">👩‍🏫 Учитель</span>
          <span style={{ fontSize: 14, color: "var(--text2)" }}>{user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}><Icon name="logout" size={14} /> Выйти</button>
        </div>
      </nav>
      <div className="dashboard">
        <aside className="sidebar">
          {sidebarItems.map(item => (
            <button key={item.key} className={`sidebar-item ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
              <Icon name={item.icon} size={18} /> {item.label}
              {item.key === "submissions" && pending.length > 0 && (
                <span className="badge badge-orange" style={{ marginLeft: "auto", padding: "2px 8px" }}>{pending.length}</span>
              )}
            </button>
          ))}
          <div className="sidebar-divider" />
          <button className="sidebar-item" onClick={onLogout}><Icon name="logout" size={18} /> Выйти</button>
        </aside>

        <main className="main-content">
          {tab === "overview" && (
            <div className="fadeUp">
              <div className="page-header">
                <div><div className="page-title">Добро пожаловать, {user.name.split(" ")[0]}!</div>
                  <div className="page-sub">Обзор вашей активности</div></div>
                <button className="btn btn-primary" onClick={() => setModal("new")}><Icon name="plus" size={16} /> Новое задание</button>
              </div>
              <div className="stats-row">
                {[
                  { v: myAssignments.length, l: "Заданий создано", c: "var(--accent)" },
                  { v: students.length, l: "Студентов", c: "var(--accent2)" },
                  { v: pending.length, l: "На проверке", c: "#ffa650" },
                  { v: graded.length, l: "Проверено работ", c: "var(--accent3)" },
                ].map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className="stat-value" style={{ color: s.c }}>{s.v}</div>
                    <div className="stat-label">{s.l}</div>
                  </div>
                ))}
              </div>

              {pending.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⏳ Ожидают проверки</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                    {pending.slice(0, 3).map(sub => {
                      const a = myAssignments.find(a => a.id === sub.assignmentId);
                      const st = students.find(s => s.id === sub.studentId);
                      return (
                        <div key={sub.id} className="card card-sm flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{a?.title}</div>
                            <div style={{ color: "var(--text2)", fontSize: 13 }}>{st?.name} · {new Date(sub.submittedAt).toLocaleDateString("ru")}</div>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => { setModal({ sub, assignment: a }); setGradeForm({ grade: "", comment: "" }); }}>
                            <Icon name="eye" size={14} /> Проверить
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Последние задания</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myAssignments.slice(-4).reverse().map(a => {
                  const subs = submissions.filter(s => s.assignmentId === a.id);
                  return (
                    <div key={a.id} className="card card-sm flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.title}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13 }}>{a.subject && <><span className="badge badge-purple" style={{ fontSize: 11 }}>{a.subject}</span> · </>}Срок: {new Date(a.dueDate).toLocaleDateString("ru")}</div>
                      </div>
                      <span className="badge badge-gray">{subs.length}/{students.length} сдали</span>
                    </div>
                  );
                })}
                {myAssignments.length === 0 && <div className="empty"><Icon name="book" size={40} /><div className="empty-title">Нет заданий</div><div className="empty-sub">Создайте первое задание</div></div>}
              </div>
            </div>
          )}

          {tab === "assignments" && (
            <div className="fadeUp">
              <div className="page-header">
                <div><div className="page-title">Задания</div><div className="page-sub">Все созданные вами задания</div></div>
                <button className="btn btn-primary" onClick={() => setModal("new")}><Icon name="plus" size={16} /> Новое задание</button>
              </div>
              {myAssignments.length === 0 ? (
                <div className="empty"><Icon name="book" size={48} /><div className="empty-title">Нет заданий</div><div className="empty-sub">Нажмите «Новое задание» чтобы создать первое</div></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {myAssignments.reverse().map(a => {
                    const subs = submissions.filter(s => s.assignmentId === a.id);
                    const gradedCount = subs.filter(s => s.grade).length;
                    const pct = students.length ? Math.round(subs.length / students.length * 100) : 0;
                    return (
                      <div key={a.id} className="card">
                        <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 17 }}>{a.title}</div>
                            <div className="assignment-meta" style={{ marginTop: 4 }}>
                              {a.subject && <span className="badge badge-purple">{a.subject}</span>}
                              <span style={{ color: "var(--text2)", fontSize: 13 }}>Срок: {new Date(a.dueDate).toLocaleDateString("ru")}</span>
                              <span style={{ color: "var(--text2)", fontSize: 13 }}>Создано: {new Date(a.createdAt).toLocaleDateString("ru")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="badge badge-gray">{subs.length}/{students.length} сдали</span>
                            <span className="badge badge-green">{gradedCount} проверено</span>
                          </div>
                        </div>
                        {a.description && <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{a.description}</div>}
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{pct}% студентов сдали</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "students" && (
            <div className="fadeUp">
              <div className="page-header">
                <div><div className="page-title">Студенты</div><div className="page-sub">{students.length} студентов в системе</div></div>
              </div>
              {students.length === 0 ? (
                <div className="empty"><Icon name="users" size={48} /><div className="empty-title">Нет студентов</div><div className="empty-sub">Студенты появятся после регистрации</div></div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Студент</th><th>Email</th><th>Сдано работ</th><th>Проверено</th><th>Ср. оценка</th></tr></thead>
                      <tbody>
                        {students.map(st => {
                          const stSubs = submissions.filter(s => s.studentId === st.id && myAssignments.find(a => a.id === s.assignmentId));
                          const gradedS = stSubs.filter(s => s.grade);
                          const avg = gradedS.length ? (gradedS.reduce((acc, s) => acc + Number(s.grade), 0) / gradedS.length).toFixed(1) : "—";
                          return (
                            <tr key={st.id}>
                              <td><div style={{ fontWeight: 600 }}>{st.name}</div></td>
                              <td style={{ color: "var(--text2)", fontSize: 14 }}>{st.email}</td>
                              <td><span className="badge badge-gray">{stSubs.length}/{myAssignments.length}</span></td>
                              <td><span className="badge badge-green">{gradedS.length}</span></td>
                              <td><span style={{ fontWeight: 700, color: Number(avg) >= 4 ? "var(--accent3)" : Number(avg) >= 3 ? "#ffa650" : Number(avg) > 0 ? "#ff6060" : "var(--text2)" }}>{avg}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "submissions" && (
            <div className="fadeUp">
              <div className="page-header">
                <div><div className="page-title">На проверке</div><div className="page-sub">{pending.length} работ ожидают оценки</div></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {submissions.filter(s => myAssignments.find(a => a.id === s.assignmentId)).length === 0 && (
                  <div className="empty"><Icon name="send" size={48} /><div className="empty-title">Нет работ</div><div className="empty-sub">Студенты ещё не сдали ни одной работы</div></div>
                )}
                {submissions.filter(s => myAssignments.find(a => a.id === s.assignmentId)).map(sub => {
                  const a = myAssignments.find(a => a.id === sub.assignmentId);
                  const st = students.find(s => s.id === sub.studentId);
                  return (
                    <div key={sub.id} className="card">
                      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{a?.title}</div>
                          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
                            {st?.name} · {new Date(sub.submittedAt).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                          </div>
                        </div>
                        {sub.grade ? <span className="badge badge-green">✓ Оценка: {sub.grade}</span> : <span className="badge badge-orange">Не проверено</span>}
                      </div>
                      <div className="submission-area">
                        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Ответ студента</div>
                        <div style={{ fontSize: 14, lineHeight: 1.7 }}>{sub.answer}</div>
                      </div>
                      {sub.grade ? (
                        <div style={{ marginTop: 12, fontSize: 14, color: "var(--text2)" }}>
                          <span style={{ fontWeight: 600, color: "var(--accent3)" }}>Оценка: {sub.grade}</span>
                          {sub.comment && <> · {sub.comment}</>}
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm mt-4" onClick={() => { setModal({ sub, assignment: a }); setGradeForm({ grade: "", comment: "" }); }}>
                          <Icon name="check" size={14} /> Выставить оценку
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: New Assignment */}
      {modal === "new" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Новое задание</div>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-sm"><Icon name="close" size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="field"><label>Название *</label><input placeholder="Написать эссе на тему..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="field"><label>Предмет</label><input placeholder="Математика, История..." value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="field"><label>Описание задания</label><textarea placeholder="Подробное описание задания..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="field"><label>Срок сдачи *</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-ghost w-full" style={{ justifyContent: "center" }} onClick={() => setModal(null)}>Отмена</button>
                <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={createAssignment}><Icon name="plus" size={16} /> Создать</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Grade Submission */}
      {modal && modal.sub && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Проверка работы</div>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-sm"><Icon name="close" size={16} /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{modal.assignment?.title}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>{students.find(s => s.id === modal.sub.studentId)?.name}</div>
            </div>
            <div className="submission-area" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Ответ</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>{modal.sub.answer}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="field">
                <label>Оценка (1–5 или A–F)</label>
                <input placeholder="5" value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} />
              </div>
              <div className="field">
                <label>Комментарий</label>
                <textarea placeholder="Отличная работа!..." value={gradeForm.comment} onChange={e => setGradeForm({ ...gradeForm, comment: e.target.value })} style={{ minHeight: 80 }} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost w-full" style={{ justifyContent: "center" }} onClick={() => setModal(null)}>Отмена</button>
                <button className="btn btn-success w-full" style={{ justifyContent: "center" }} onClick={() => gradeSubmission(modal.sub)}><Icon name="check" size={16} /> Выставить оценку</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user, onLogout, showToast }) {
  const [tab, setTab] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [modal, setModal] = useState(null);
  const [answer, setAnswer] = useState("");

  const refresh = () => {
    setAssignments(DB.getAssignments());
    setSubmissions(DB.getSubmissions());
  };

  useEffect(() => { refresh(); }, []);

  const mySubs = submissions.filter(s => s.studentId === user.id);
  const getSubmission = (aId) => mySubs.find(s => s.assignmentId === aId);

  const submitAnswer = (assignment) => {
    if (!answer.trim()) { showToast("Напишите ответ", "error"); return; }
    const existing = getSubmission(assignment.id);
    let all = DB.getSubmissions();
    if (existing) {
      all = all.map(s => s.id === existing.id ? { ...s, answer, submittedAt: new Date().toISOString(), grade: null, comment: null } : s);
    } else {
      all = [...all, { id: uid(), assignmentId: assignment.id, studentId: user.id, answer, submittedAt: new Date().toISOString() }];
    }
    DB.saveSubmissions(all);
    refresh();
    setModal(null);
    setAnswer("");
    showToast("Работа сдана!", "success");
  };

  const periods = ["all", "week", "month", "overdue"];
  const periodLabels = { all: "Все", week: "Эта неделя", month: "Этот месяц", overdue: "Просроченные" };

  const now = new Date();
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  const monthEnd = new Date(now); monthEnd.setMonth(now.getMonth() + 1);

  const filtered = assignments.filter(a => {
    const due = new Date(a.dueDate);
    if (tab === "week") return due <= weekEnd && due >= now;
    if (tab === "month") return due <= monthEnd && due >= now;
    if (tab === "overdue") return due < now && !getSubmission(a.id)?.grade;
    return true;
  });

  const gradedSubs = mySubs.filter(s => s.grade);
  const avgGrade = gradedSubs.length
    ? gradedSubs.filter(s => !isNaN(s.grade)).reduce((acc, s) => acc + Number(s.grade), 0) / gradedSubs.filter(s => !isNaN(s.grade)).length
    : 0;

  const sidebarItems = [
    { key: "all", icon: "book", label: "Все задания" },
    { key: "week", icon: "clock", label: "Эта неделя" },
    { key: "month", icon: "star", label: "Этот месяц" },
    { key: "overdue", icon: "alert", label: "Просроченные" },
    { key: "grades", icon: "award", label: "Мои оценки" },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-logo">EduFlow</div>
        <div className="navbar-actions">
          <span className="badge badge-pink">🎓 Студент</span>
          <span style={{ fontSize: 14, color: "var(--text2)" }}>{user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}><Icon name="logout" size={14} /> Выйти</button>
        </div>
      </nav>
      <div className="dashboard">
        <aside className="sidebar">
          {sidebarItems.map(item => (
            <button key={item.key} className={`sidebar-item ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
              <Icon name={item.icon} size={18} /> {item.label}
            </button>
          ))}
          <div className="sidebar-divider" />
          <button className="sidebar-item" onClick={onLogout}><Icon name="logout" size={18} /> Выйти</button>
        </aside>

        <main className="main-content">
          {tab !== "grades" && (
            <div className="fadeUp">
              <div className="page-header">
                <div>
                  <div className="page-title">{periodLabels[tab]}</div>
                  <div className="page-sub">{filtered.length} заданий</div>
                </div>
              </div>

              {tab === "all" && (
                <div className="stats-row" style={{ marginBottom: 28 }}>
                  {[
                    { v: assignments.length, l: "Всего заданий", c: "var(--accent)" },
                    { v: mySubs.length, l: "Сдано работ", c: "var(--accent2)" },
                    { v: gradedSubs.length, l: "Проверено", c: "var(--accent3)" },
                    { v: avgGrade ? avgGrade.toFixed(1) : "—", l: "Средняя оценка", c: "#ffa650" },
                  ].map((s, i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-value" style={{ color: s.c }}>{s.v}</div>
                      <div className="stat-label">{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="empty"><Icon name="book" size={48} /><div className="empty-title">Нет заданий</div><div className="empty-sub">В этом периоде заданий нет</div></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filtered.map(a => {
                    const sub = getSubmission(a.id);
                    const due = new Date(a.dueDate);
                    const isOverdue = due < now && !sub;
                    const daysLeft = Math.ceil((due - now) / 86400000);
                    return (
                      <div key={a.id} className="card" style={{ cursor: "pointer" }} onClick={() => { setModal(a); setAnswer(sub?.answer || ""); }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{a.title}</div>
                            <div className="assignment-meta">
                              {a.subject && <span className="badge badge-purple">{a.subject}</span>}
                              <span style={{ color: "var(--text2)", fontSize: 13 }}>👩‍🏫 {a.teacherName}</span>
                              <span style={{ color: isOverdue ? "#ff6060" : daysLeft <= 2 ? "#ffa650" : "var(--text2)", fontSize: 13 }}>
                                <Icon name="clock" size={12} /> {isOverdue ? "Просрочено" : daysLeft === 0 ? "Сегодня" : `${daysLeft} дн.`}
                              </span>
                            </div>
                          </div>
                          <div>
                            {sub?.grade ? <span className="badge badge-green">✓ Оценка: {sub.grade}</span>
                              : sub ? <span className="badge badge-orange">Сдано, ждём проверки</span>
                                : <span className="badge badge-gray">Не сдано</span>}
                          </div>
                        </div>
                        {a.description && <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{a.description}</div>}
                        {sub?.grade && sub.comment && (
                          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(106,255,196,.06)", borderRadius: 8, border: "1px solid rgba(106,255,196,.15)", fontSize: 14 }}>
                            💬 Учитель: {sub.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "grades" && (
            <div className="fadeUp">
              <div className="page-header">
                <div><div className="page-title">Мои оценки</div><div className="page-sub">{gradedSubs.length} проверенных работ</div></div>
              </div>
              {gradedSubs.length === 0 ? (
                <div className="empty"><Icon name="award" size={48} /><div className="empty-title">Нет оценок</div><div className="empty-sub">Сдайте работы и дождитесь проверки учителем</div></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {gradedSubs.map(sub => {
                    const a = assignments.find(a => a.id === sub.assignmentId);
                    return (
                      <div key={sub.id} className="card">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{a?.title}</div>
                            <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
                              {a?.subject && <><span className="badge badge-purple" style={{ fontSize: 11 }}>{a.subject}</span> · </>}
                              Проверено {new Date(sub.gradedAt).toLocaleDateString("ru")}
                            </div>
                          </div>
                          <div className="submission-grade" style={{ color: Number(sub.grade) >= 4 ? "var(--accent3)" : Number(sub.grade) >= 3 ? "#ffa650" : "#ff6060" }}>
                            <Icon name="award" size={20} /> {sub.grade}
                          </div>
                        </div>
                        {sub.comment && (
                          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(124,106,255,.06)", borderRadius: 8, border: "1px solid rgba(124,106,255,.15)", fontSize: 14, color: "var(--text2)" }}>
                            💬 {sub.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Submit Assignment */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal.title}</div>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-sm"><Icon name="close" size={16} /></button>
            </div>
            {modal.subject && <span className="badge badge-purple" style={{ marginBottom: 12 }}>{modal.subject}</span>}
            {modal.description && (
              <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.7, color: "var(--text2)", marginBottom: 20 }}>
                {modal.description}
              </div>
            )}
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
              👩‍🏫 {modal.teacherName} · Срок: {new Date(modal.dueDate).toLocaleDateString("ru")}
            </div>
            {(() => {
              const sub = getSubmission(modal.id);
              if (sub?.grade) return (
                <div>
                  <div style={{ marginBottom: 12, fontWeight: 600, color: "var(--text2)" }}>Ваш ответ:</div>
                  <div className="submission-area">{sub.answer}</div>
                  <div style={{ marginTop: 16, padding: "16px", background: "rgba(106,255,196,.06)", borderRadius: 10, border: "1px solid rgba(106,255,196,.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600 }}>Оценка учителя</span>
                      <span className="submission-grade" style={{ color: "var(--accent3)", fontSize: 28 }}>{sub.grade}</span>
                    </div>
                    {sub.comment && <div style={{ marginTop: 8, color: "var(--text2)", fontSize: 14 }}>💬 {sub.comment}</div>}
                  </div>
                </div>
              );
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="field">
                    <label>Ваш ответ {sub && <span style={{ color: "var(--accent)" }}>(редактирование)</span>}</label>
                    <textarea placeholder="Напишите ваш ответ здесь..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ minHeight: 160 }} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost w-full" style={{ justifyContent: "center" }} onClick={() => setModal(null)}>Отмена</button>
                    <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={() => submitAnswer(modal)}>
                      <Icon name="send" size={16} /> {sub ? "Обновить ответ" : "Сдать работу"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  DB.init();
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setPage("landing"); };

  return (
    <>
      <style>{S}</style>
      {page === "landing" && <Landing onNav={setPage} />}
      {page === "login" && <AuthPage mode="login" onNav={setPage} onLogin={handleLogin} showToast={showToast} />}
      {page === "register" && <AuthPage mode="register" onNav={setPage} onLogin={handleLogin} showToast={showToast} />}
      {page === "dashboard" && user?.role === "teacher" && <TeacherDashboard user={user} onLogout={handleLogout} showToast={showToast} />}
      {page === "dashboard" && user?.role === "student" && <StudentDashboard user={user} onLogout={handleLogout} showToast={showToast} />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
