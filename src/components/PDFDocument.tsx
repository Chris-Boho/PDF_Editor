import React, { useState, useEffect } from 'react';
import { convertPdfToSvg, initMuPdfWasm } from '../utils/pdf2svg';
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
  const [svgPages, setSvgPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setLoading(true);
      setError(null);
      
      // Initialize MuPDF WASM before converting
      initMuPdfWasm('/wasm/')
        .then(() => {
          console.log('MuPDF initialized successfully, converting PDF...');
          return convertPdfToSvg(file);
        })
        .then(pages => {
          setSvgPages(pages);
          setNumPages(pages.length);
          setCurrentPage(1);
          setLoading(false);
          onLoadSuccess({ numPages: pages.length });
        })
        .catch(err => {
          console.error('Error processing PDF:', err);
          if (err.message && err.message.includes('MuPDF WASM is not initialized')) {
            setError('Failed to initialize PDF converter. Please check your internet connection and try again.');
          } else {
            setError('Failed to convert PDF to SVG. Please try another file.');
          }
          setLoading(false);
        });
    }
  }, [file, onLoadSuccess]);

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  return (
    <div className="flex flex-col items-center w-full overflow-auto pb-12">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3">
            {svgPages.length > 0 ? 'Processing PDF pages...' : 'Initializing PDF converter...'}
          </span>
        </div>
      )}

      {error && (
        <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50 my-4">
          {error}
        </div>
      )}

      {!loading && !error && svgPages.length > 0 && (
        <>
          <div className="flex justify-between items-center w-full mb-4">
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {numPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage >= numPages}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div 
            className="border border-gray-300 rounded shadow-lg bg-white" 
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center', margin: '20px 0' }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: svgPages[currentPage - 1] || '' }} 
              className="svg-container"
            />
          </div>

          <PageInfoBar 
            currentPage={currentPage} 
            totalPages={numPages} 
            scale={scale} 
            onScaleChange={handleScaleChange} 
          />
        </>
      )}
    </div>
  );
};

export default PDFDocumentViewer;