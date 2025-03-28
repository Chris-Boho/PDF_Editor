import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Document, Page } from 'react-pdf';
import { PDFDocument as PDFLib } from 'pdf-lib';
import { DndContext, DragOverlay, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import PageInfoBar from './PageInfoBar';
import TextBox from './TextBox';

export interface PDFDocumentRef {
  setIsAddingText: (isAdding: boolean) => void;
  exportPDF: () => Promise<void>;
}

interface Annotation {
  text: string;
  position: { x: number; y: number };
  pageNumber: number;
}

interface PDFDocumentViewerProps {
  file: File;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

const PDFDocumentViewer = forwardRef<PDFDocumentRef, PDFDocumentViewerProps>(({
  file,
  onLoadSuccess
}, ref) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  const handleLoadSuccess = (data: { numPages: number }) => {
    setNumPages(data.numPages);
    onLoadSuccess(data);
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingText || !containerRef.current) return;

    const pageElement = document.getElementById(`page-${currentPage}`);
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Check if click is within page bounds
    if (clickX < pageRect.left || clickX > pageRect.right ||
      clickY < pageRect.top || clickY > pageRect.bottom) {
      return;
    }

    const x = clickX - pageRect.left;
    const y = clickY - pageRect.top;

    setAnnotationPosition({
      x: x,
      y: y
    });
  };

  const handleAnnotationSave = (text: string, position: { x: number; y: number }) => {
    setAnnotations([...annotations, { text, position, pageNumber: currentPage }]);
    setIsAddingText(false);
    setAnnotationPosition(null);
  };

  const handleAnnotationCancel = () => {
    setIsAddingText(false);
    setAnnotationPosition(null);
  };

  const exportPDF = async () => {
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFLib.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Add annotations to PDF
      annotations.forEach(({ text, position, pageNumber }) => {
        const page = pages[pageNumber - 1];
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();

        // Calculate the position in PDF coordinates
        const pdfX = (position.x / scale) * (pageWidth / containerRef.current!.clientWidth);
        const pdfY = pageHeight - ((position.y / scale) * (pageHeight / containerRef.current!.clientHeight));

        page.drawText(text, {
          x: pdfX,
          y: pdfY,
          size: 12 / scale, // Adjust font size based on scale
        });
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'annotated-document.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    setIsAddingText: (isAdding: boolean) => setIsAddingText(isAdding),
    exportPDF
  }));

  return (
    <DndContext sensors={sensors} onDragEnd={({ delta }) => {
      if (annotationPosition && delta) {
        setAnnotationPosition(prev => prev ? {
          x: prev.x + delta.x,
          y: prev.y + delta.y
        } : null);
      }
    }}>
      <div className="flex flex-col items-center w-full overflow-auto pb-12" ref={containerRef} onClick={handlePageClick}>
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
        {annotationPosition && (() => {
          const pageElement = document.getElementById(`page-${currentPage}`);
          const pageRect = pageElement?.getBoundingClientRect();

          if (!pageRect) return null;

          const adjustedPosition = {
            x: pageRect.left + annotationPosition.x,
            y: pageRect.top + annotationPosition.y
          };

          return (
            <TextBox
              position={adjustedPosition}
              onSave={handleAnnotationSave}
              onCancel={handleAnnotationCancel}
            />
          );
        })()}
        {annotations
          .filter(annotation => annotation.pageNumber === currentPage)
          .map((annotation, index) => {
            const pageElement = document.getElementById(`page-${annotation.pageNumber}`);
            const pageRect = pageElement?.getBoundingClientRect();

            if (!pageRect) return null;

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${pageRect.left + annotation.position.x}px`,
                  top: `${pageRect.top + annotation.position.y}px`,
                  zIndex: 1000
                }}
              >
                <div className="bg-transparent text-black">
                  {annotation.text}
                </div>
              </div>
            );
          })}
      </div>
    </DndContext>
  );
});

export default PDFDocumentViewer;