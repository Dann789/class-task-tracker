import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import Pagination from "../components/Pagination";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ListFilter,
  AlertCircle,
  Loader2,
  BookOpen,
  Trash2,
  RefreshCw,
  FolderPlus,
} from "lucide-react";

export default function TasksPage() {
  const { user, isTeacher, isStudent } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allAvailableClasses, setAllAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("semua");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Delete Confirmation Modal State
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Classes
  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes");
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar kelas:", err);
    }
  };

  // Fetch All Classes for quick enrollment if student has no classes
  const fetchAllClasses = async () => {
    if (isStudent) {
      try {
        const res = await api.get("/classes/all");
        if (res.data.success) {
          setAllAvailableClasses(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat semua kelas:", err);
      }
    }
  };

  // Fetch Tasks with query params
  const fetchTasks = useCallback(
    async (pageToLoad = pagination.page) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const params = {
          search,
          status,
          page: pageToLoad,
          limit: pagination.limit,
        };
        if (selectedClassId) {
          params.class_id = selectedClassId;
        }

        const res = await api.get("/tasks", { params });
        if (res.data.success) {
          setTasks(res.data.data);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "Gagal memuat daftar tugas. Periksa koneksi backend."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status, selectedClassId, pagination.limit]
  );

  // Initial load
  useEffect(() => {
    fetchClasses();
    fetchAllClasses();
  }, []);

  // Reload tasks when filter changes (debounced search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, selectedClassId]);

  // Handler Page Change
  const handlePageChange = (newPage) => {
    fetchTasks(newPage);
  };

  // Handler Siswa Toggle Task Status
  const handleToggleStatus = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/toggle-status`);
      if (res.data.success) {
        // Update state lokal secara instan
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, is_done: res.data.data.is_done } : t
          )
        );

        // Berikan feedback ringkas
        setSuccessMessage(
          res.data.data.is_done
            ? "Tugas berhasil ditandai selesai! ✓"
            : "Tugas dikembalikan ke status belum selesai."
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal mengubah status tugas."
      );
    }
  };

  // Handler Guru Create / Edit Task
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Handler Guru Delete Task
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);

    try {
      await api.delete(`/tasks/${deletingTask.id}`);
      setSuccessMessage("Tugas berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeletingTask(null);
      fetchTasks(pagination.page);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal menghapus tugas."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler Siswa bergabung kelas jika kelas masih kosong
  const handleJoinClass = async (classId) => {
    try {
      await api.post("/classes/join", { class_id: classId });
      setSuccessMessage("Berhasil bergabung ke kelas!");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchClasses();
      fetchTasks(1);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Gagal bergabung ke kelas");
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Banner Notifikasi */}
        {successMessage && (
          <div className="alert-box alert-success animate-fade">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="alert-box alert-error animate-fade">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dashboard Title & Actions */}
        <div className="dashboard-header">
          <div>
            <h2>Daftar Tugas Kelas</h2>
            <p className="dashboard-subtitle">
              {isTeacher
                ? "Kelola tugas, pantau pengerjaan siswa, dan tambahkan tugas baru."
                : "Pantau tenggat waktu dan tandai tugas yang sudah Anda selesaikan."}
            </p>
          </div>

          <div className="header-actions">
            {isTeacher && (
              <button
                className="btn btn-primary"
                onClick={handleOpenCreateModal}
              >
                <Plus size={18} />
                <span>Buat Tugas Baru</span>
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => fetchTasks(pagination.page)}
              title="Perbarui data"
            >
              <RefreshCw size={16} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* Info siswa belum masuk kelas */}
        {isStudent && classes.length === 0 && !loading && (
          <div className="join-class-banner">
            <div className="join-content">
              <h4>Anda belum terdaftar di kelas manapun</h4>
              <p>Pilih kelas yang tersedia di bawah ini untuk melihat tugas:</p>
              <div className="class-pills">
                {allAvailableClasses.map((cls) => (
                  <button
                    key={cls.id}
                    className="btn-join-pill"
                    onClick={() => handleJoinClass(cls.id)}
                  >
                    <FolderPlus size={14} /> Gabung ke {cls.name} ({cls.teacher_name})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="filter-card">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari tugas berdasarkan judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="btn-clear-search"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-group">
            {/* Filter Status (khusus Siswa atau filter umum) */}
            {isStudent && (
              <div className="select-wrapper">
                <ListFilter size={16} className="select-icon" />
                <select
                  className="filter-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="semua">Semua Status</option>
                  <option value="belum">Belum Selesai</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            )}

            {/* Filter Kelas */}
            {classes.length > 0 && (
              <div className="select-wrapper">
                <Filter size={16} className="select-icon" />
                <select
                  className="filter-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Task Cards Container */}
        {loading ? (
          <div className="loading-state">
            <Loader2 size={36} className="spinner-icon spinner-large" />
            <p>Memuat daftar tugas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} className="empty-icon" />
            <h3>Tidak Ada Tugas Ditemukan</h3>
            <p>
              {search || status !== "semua" || selectedClassId
                ? "Tidak ada tugas yang sesuai dengan kriteria filter atau pencarian Anda."
                : isTeacher
                ? "Anda belum membuat tugas untuk kelas ini. Klik '+ Buat Tugas Baru' untuk memulai."
                : "Belum ada tugas yang diberikan untuk kelas Anda saat ini."}
            </p>
            {isTeacher && !search && (
              <button
                className="btn btn-primary mt-3"
                onClick={handleOpenCreateModal}
              >
                <Plus size={16} /> Buat Tugas Sekarang
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isTeacher={isTeacher}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEditModal}
                  onDelete={(t) => setDeletingTask(t)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Task Create / Edit Modal (Guru Only) */}
      {isTeacher && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskSaved={() => fetchTasks(pagination.page)}
          editingTask={editingTask}
          classes={classes}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="modal-backdrop">
          <div className="modal-card modal-delete">
            <div className="modal-header">
              <h3 className="text-danger">
                <Trash2 size={20} /> Konfirmasi Hapus Tugas
              </h3>
            </div>
            <p className="delete-desc">
              Apakah Anda yakin ingin menghapus tugas{" "}
              <strong>"{deletingTask.title}"</strong>? Seluruh catatan penyelesaian siswa pada tugas ini akan ikut terhapus secara permanen.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingTask(null)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="spinner-icon" /> Menghapus...
                  </>
                ) : (
                  "Ya, Hapus Tugas"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

