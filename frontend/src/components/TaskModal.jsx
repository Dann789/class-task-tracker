import React, { useState, useEffect } from "react";
import api from "../services/api";
import { X, Calendar, BookCheck, AlertCircle, Loader2 } from "lucide-react";

export default function TaskModal({ isOpen, onClose, onTaskSaved, editingTask = null, classes = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [classId, setClassId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setClassId(editingTask.class_id || "");

      // Format due_date ke format datetime-local (YYYY-MM-DDTHH:mm)
      if (editingTask.due_date) {
        const d = new Date(editingTask.due_date);
        const pad = (n) => String(n).padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(formatted);
      } else {
        setDueDate("");
      }
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setClassId(classes.length > 0 ? classes[0].id : "");
    }
    setErrorMessage("");
    setFieldErrors({});
  }, [editingTask, isOpen, classes]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const payload = {
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        class_id: Number(classId),
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      onTaskSaved();
      onClose();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        const errorsObj = {};
        resp.errors.forEach((e) => {
          errorsObj[e.field] = e.message;
        });
        setFieldErrors(errorsObj);
        setErrorMessage(resp.message || "Validasi gagal");
      } else {
        setErrorMessage(resp?.message || "Terjadi kesalahan saat menyimpan tugas");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            <BookCheck size={20} className="icon-blue" />
            {editingTask ? "Ubah Tugas" : "Buat Tugas Baru"}
          </h3>
          <button className="btn-close" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Judul Tugas *</label>
            <input
              id="title"
              type="text"
              className={`form-input ${fieldErrors.title ? "input-error" : ""}`}
              placeholder="Contoh: Membuat ERD Basis Data Perpustakaan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="classId">Kelas *</label>
              <select
                id="classId"
                className={`form-select ${fieldErrors.class_id ? "input-error" : ""}`}
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="" disabled>Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {fieldErrors.class_id && <span className="field-error-text">{fieldErrors.class_id}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="dueDate">Tenggat Waktu (Due Date) *</label>
              <input
                id="dueDate"
                type="datetime-local"
                className={`form-input ${fieldErrors.due_date ? "input-error" : ""}`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              {fieldErrors.due_date && <span className="field-error-text">{fieldErrors.due_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Deskripsi Tugas</label>
            <textarea
              id="description"
              rows={4}
              className="form-textarea"
              placeholder="Tuliskan instruksi atau rincian pengerjaan tugas di sini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spinner-icon" /> Menyimpan...
                </>
              ) : editingTask ? (
                "Simpan Perubahan"
              ) : (
                "Buat Tugas"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

