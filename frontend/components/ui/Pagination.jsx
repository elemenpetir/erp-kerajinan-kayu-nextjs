export default function Pagination({ page, pageSize, count, basePath }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
      {page > 1 && (
        <a className="btn-outline mb-0" href={`${basePath}?page=${page - 1}`}>
          ← Prev
        </a>
      )}
      <span style={{ fontSize: 14, color: '#64748b' }}>
        Hal {page} / {totalPages} ({count} data)
      </span>
      {page < totalPages && (
        <a className="btn-outline mb-0" href={`${basePath}?page=${page + 1}`}>
          Next →
        </a>
      )}
    </div>
  );
}
