import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import FileUploader from './FileUploader';
import PDFDocumentViewer from './PDFDocument';

// Configure PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();;

interface PDFViewerProps {
  onFileChange?: (file: File | null) => void;
}

const PDFViewer = ({ onFileChange }: PDFViewerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const handleFileChange = (eventOrFile: React.ChangeEvent<HTMLInputElement> | (File & { pageCount?: number })) => {
    if (eventOrFile instanceof File) {
      // If a File object is passed directly
      setFile(eventOrFile);

      // If the file has a pageCount property, update numPages
      if ('pageCount' in eventOrFile && eventOrFile.pageCount) {
        setNumPages(eventOrFile.pageCount);
        console.log('Setting numPages from file:', eventOrFile.pageCount);
      }
    } else {
      // If an input event is passed
      const files = eventOrFile.target.files;
      if (files && files[0]) {
        setFile(files[0]);
      }
    }
  };

  useEffect(() => {
    if (onFileChange) {
      onFileChange(file);
    }
  }, [file, onFileChange]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {!file && (
        <FileUploader onFileChange={handleFileChange} />
      )}

      {/* {file && (
        <PDFDocumentViewer
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
        />
      )} */}
    </div>
  );
};

export default PDFViewer;