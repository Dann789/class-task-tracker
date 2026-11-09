import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalItems, limit } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Menampilkan <strong>{startItem}</strong> - <strong>{endItem}</strong> dari total{" "}
        <strong>{totalItems}</strong> tugas
      </div>

      <div className="pagination-controls">
        <button
          className="btn-page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span className="pagination-current">
          Hal {page} dari {totalPages}
        </span>

        <button
          className="btn-page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Halaman Berikutnya"
        >
          <span>Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

