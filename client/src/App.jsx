import { useCallback, useEffect, useMemo, useState } from "react";
import { studentApi } from "./api";

const emptyForm = {
  fullName: "",
  rollNumber: "",
  email: "",
  course: "",
  year: "1",
  status: "Active"
};

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ST";
}

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStudents = useCallback(async (term = search) => {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getAll(term);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadStudents(search), 250);
    return () => clearTimeout(timer);
  }, [search, loadStudents]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((student) => student.status === "Active").length,
    inactive: students.filter((student) => student.status === "Inactive").length,
    courses: new Set(students.map((student) => student.course)).size
  }), [students]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(student) {
    setEditingId(student._id);
    setForm({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      email: student.email,
      course: student.course,
      year: String(student.year),
      status: student.status
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, year: Number(form.year) };
    try {
      if (editingId) {
        await studentApi.update(editingId, payload);
        setNotice("Student details updated successfully.");
      } else {
        await studentApi.create(payload);
        setNotice("Student added successfully.");
      }
      closeModal();
      await loadStudents(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(`Delete ${student.fullName}'s record? This cannot be undone.`);
    if (!confirmed) return;
    setError("");
    try {
      await studentApi.remove(student._id);
      setNotice("Student record deleted.");
      await loadStudents(search);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div><strong>FLEXI</strong><span>STUDENT PORTAL</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <div className="nav-item active"><span className="nav-icon">▦</span> Dashboard</div>
        <div className="nav-item"><span className="nav-icon">♙</span> Students <span className="nav-count">{stats.total}</span></div>
        <div className="nav-item muted"><span className="nav-icon">▤</span> Reports <span className="soon">SOON</span></div>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need help?</strong>
            <p>Manage student records in one simple place.</p>
          </div>
          <div className="profile">
            <div className="profile-avatar">AD</div>
            <div><strong>Admin User</strong><span>Administrator</span></div>
            <span className="profile-dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Dashboard</strong></div>
          <div className="topbar-right"><span className="live-dot"></span><span>System overview</span><div className="top-avatar">AD</div></div>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">OVERVIEW</div>
            <h1>Student Dashboard <span className="wave">✦</span></h1>
            <p>Welcome back! Here’s what’s happening with your students.</p>
          </div>
          <button className="primary-button" onClick={openAdd}><span className="plus">＋</span> Add Student</button>
        </section>

        {error && !modalOpen && <div className="alert error-alert"><span>!</span><div><strong>Something needs your attention</strong><p>{error}</p><button className="text-button" onClick={() => loadStudents(search)}>Try again</button></div></div>}
        {notice && <div className="toast"><span>✓</span>{notice}</div>}

        <section className="stats-grid">
          <StatCard title="Total Students" value={stats.total} note="Matching your current search" icon="♙" tone="purple" />
          <StatCard title="Active Students" value={stats.active} note="Currently active" icon="✓" tone="green" />
          <StatCard title="Inactive Students" value={stats.inactive} note="Not currently active" icon="◷" tone="orange" />
          <StatCard title="Courses" value={stats.courses} note="Unique courses represented" icon="▤" tone="blue" />
        </section>

        <section className="table-card">
          <div className="table-heading">
            <div><h2>All Students</h2><p>View and manage student information</p></div>
            <div className="table-actions">
              <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." aria-label="Search students" />{search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label>
              <button className="secondary-button" onClick={() => loadStudents(search)} title="Refresh list">↻ <span>Refresh</span></button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>COURSE</th><th>YEAR</th><th>STATUS</th><th className="actions-head">ACTIONS</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="empty-state"><div className="spinner"></div><strong>Loading students...</strong><span>Getting the latest records from MongoDB</span></td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state"><div className="empty-icon">♙</div><strong>{search ? "No students found" : "No students added yet"}</strong><span>{search ? "Try a different name, email, roll number, or course." : "Add your first student to get started."}</span>{!search && <button className="primary-button small" onClick={openAdd}>＋ Add Student</button>}</td></tr>
                ) : students.map((student) => (
                  <tr key={student._id}>
                    <td><div className="student-cell"><div className="student-avatar">{initials(student.fullName)}</div><div><strong>{student.fullName}</strong><span>{student.email}</span></div></div></td>
                    <td><span className="roll-number">{student.rollNumber}</span></td>
                    <td><span className="course-name">{student.course}</span></td>
                    <td><span className="year-pill">Year {student.year}</span></td>
                    <td><span className={`status-pill ${student.status.toLowerCase()}`}><span></span>{student.status}</span></td>
                    <td><div className="row-actions"><button className="icon-button edit" onClick={() => openEdit(student)} aria-label={`Edit ${student.fullName}`} title="Edit student">✎</button><button className="icon-button delete" onClick={() => handleDelete(student)} aria-label={`Delete ${student.fullName}`} title="Delete student">⌫</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer"><span>Showing <strong>{students.length}</strong> student{students.length === 1 ? "" : "s"}</span><span className="db-status"><span></span> Connected through API</span></div>
        </section>

        <footer className="footer"><span>© {new Date().getFullYear()} FLEXI Student Management</span><span>Made for learning · React + Node.js + MongoDB</span></footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-header"><div><div className="eyebrow">{editingId ? "EDIT RECORD" : "NEW RECORD"}</div><h2 id="modal-title">{editingId ? "Edit student" : "Add a student"}</h2><p>Fill in the student details below.</p></div><button className="close-button" onClick={closeModal} aria-label="Close">×</button></div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field full"><span>Full name <b>*</b></span><input required minLength="2" maxLength="80" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Aanya Sharma" /></label>
              <label className="field"><span>Roll number <b>*</b></span><input required maxLength="30" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="e.g. FLEXI-001" /></label>
              <label className="field"><span>Email address <b>*</b></span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" /></label>
              <label className="field full"><span>Course / Department <b>*</b></span><input required maxLength="80" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. Computer Science" /></label>
              <label className="field"><span>Academic year <b>*</b></span><select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>{[1,2,3,4,5,6].map((year) => <option key={year} value={year}>Year {year}</option>)}</select></label>
              <label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
            </div>
            {error && <div className="alert error-alert form-error"><span>!</span><p>{error}</p></div>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={closeModal}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Student"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function StatCard({ title, value, note, icon, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{title}</span><strong>{value}</strong><small>{note}</small></div><div className={`stat-accent ${tone}`}></div></article>;
}

export default App;
