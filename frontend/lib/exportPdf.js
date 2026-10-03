import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF builder: title + subtitle + tabel + baris footer opsional + timestamp.
// Dipanggil dari handler klik (dynamic import disarankan agar jspdf tak masuk bundle awal).
export function buildPdf({ title, subtitle = '', headers, rows, footer = null }) {
  const doc = new jsPDF({ unit: 'pt' });
  const margin = 40;
  let y = 48;

  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 16;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(subtitle, margin, y);
    y += 12;
  }
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Diunduh ${new Date().toLocaleString('id-ID')}`, margin, y);

  autoTable(doc, {
    startY: y + 10,
    margin: { left: margin, right: margin },
    head: [headers],
    body: rows,
    foot: footer ? [footer] : undefined,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  return doc;
}

export function downloadPdf(doc, filename) {
  doc.save(filename);
}
