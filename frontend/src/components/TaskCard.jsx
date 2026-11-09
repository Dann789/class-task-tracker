import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Pencil,
  Trash2,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function TaskCard({
  task,
  isTeacher,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const [toggling, setToggling] = useState(false);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = new Date(task.due_date) < new Date();

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await onToggleStatus(task.id);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`task-card ${task.is_done ? "card-completed" : ""}`}>
      <div className="task-card-header">
        <div className="task-class-badge">
          <span>{task.class_name || "Kelas"}</span>
        </div>

        {/* Status Badge */}
        {!isTeacher && (
          <div
            className={`status-pill ${
              task.is_done ? "status-done" : isOverdue ? "status-overdue" : "status-pending"
            }`}
          >
            {task.is_done ? (
              <>
                <CheckCircle size={14} /> Selesai
              </>
            ) : isOverdue ? (
              <>
                <AlertTriangle size={14} /> Terlewat
              </>
            ) : (
              <>
                <Clock size={14} /> Belum Selesai
              </>
            )}
          </div>
        )}

        {/* Teacher Student Progress */}
        {isTeacher && (
          <div className="teacher-progress-badge" title="Jumlah siswa yang sudah menyelesaikan tugas">
            <Users size={14} />
            <span>
              {task.completed_students_count || 0} / {task.total_students_count || 0} Siswa Selesai
            </span>
          </div>
        )}
      </div>

      <div className="task-card-body">
        <h4 className={`task-title ${task.is_done ? "title-completed" : ""}`}>
          {task.title}
        </h4>
        {task.description && <p className="task-description">{task.description}</p>}
      </div>

      <div className="task-card-footer">
        <div className={`task-due-date ${isOverdue && !task.is_done ? "text-danger" : ""}`}>
          <Calendar size={14} />
          <span>Tenggat: {formatDateTime(task.due_date)}</span>
        </div>

        <div className="task-actions">
          {/* Aksi Siswa: Toggle Selesai */}
          {!isTeacher && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`btn-toggle-task ${
                task.is_done ? "btn-toggle-done" : "btn-toggle-pending"
              }`}
            >
              {toggling ? (
                <>
                  <Loader2 size={15} className="spinner-icon" /> Memproses...
                </>
              ) : task.is_done ? (
                <>
                  <CheckCircle size={15} /> Selesai (Batal)
                </>
              ) : (
                <>
                  <Circle size={15} /> Tandai Selesai
                </>
              )}
            </button>
          )}

          {/* Aksi Guru: Edit & Hapus */}
          {isTeacher && (
            <div className="teacher-actions">
              <button
                onClick={() => onEdit(task)}
                className="btn-icon btn-edit"
                title="Ubah tugas"
              >
                <Pencil size={15} />
                <span>Ubah</span>
              </button>
              <button
                onClick={() => onDelete(task)}
                className="btn-icon btn-delete"
                title="Hapus tugas"
              >
                <Trash2 size={15} />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

