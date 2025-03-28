import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import PageInfoBar from './PageInfoBar';

interface PDFDocumentViewerProps {
  file: File;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

const PDFDocumentViewer: React.FC<PDFDocumentViewerProps> = ({
  file,
  onLoadSuccess
}) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);

  const handleLoadSuccess = (data: { numPages: number }) => {
    setNumPages(data.numPages);
    onLoadSuccess(data);
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col items-center w-full overflow-auto pb-12">
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        className="max-w-full"
        error={<p className="text-red-500">Failed to load PDF file.</p>}
        loading={<p className="text-white">Loading PDF...</p>}
      >
        {Array.from(new Array(numPages), (_, index) => {
          const pageNumber = index + 1;
          return (
            <div
              key={`page_${pageNumber}`}
              className="mb-4"
              id={`page-${pageNumber}`}
              onFocus={() => handlePageChange(pageNumber)}
              onMouseEnter={() => handlePageChange(pageNumber)}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="max-w-full shadow-lg"
                scale={scale}
              />
            </div>
          );
        })}
      </Document>
      {numPages > 0 && <PageInfoBar currentPage={currentPage} totalPages={numPages} scale={scale} onScaleChange={setScale} />}
    </div>
  );
};

export default PDFDocumentViewer;