"use client";

import { Button } from "primereact/button";

const PDFViewer = ({ pdfUrl, fileName, onClose }) => {
  if (!pdfUrl) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
    >
      <div
        className="bg-white border-round-xl shadow-8 overflow-hidden flex flex-column"
        style={{ width: "92vw", height: "92vh" }}
      >
        {/* Header */}
        <div className="flex align-items-center justify-content-between p-3 border-bottom-1 surface-border surface-50">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-file-pdf text-red-500 text-xl" />
            <span className="font-bold text-900">{fileName}</span>
          </div>
          <div className="flex gap-2">
            <a href={pdfUrl} download={fileName}>
              <Button icon="pi pi-download" label="Unduh PDF" severity="success" size="small" />
            </a>
            <Button icon="pi pi-times" severity="secondary" size="small" onClick={onClose} />
          </div>
        </div>

        {/* iFrame */}
        <iframe src={pdfUrl} className="flex-1 w-full" style={{ border: "none" }} />
      </div>
    </div>
  );
};

export default PDFViewer;
