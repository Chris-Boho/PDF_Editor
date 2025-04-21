import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { pdfjs } from 'react-pdf';
import { pdf2svg } from '../utils/pdf2svg';

// Configure PDF.js worker source if not already configured elsewhere
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

interface FileUploaderProps {
  onFileChange: (file: (File & { pageCount?: number }) | React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const handleOpenDialog = async () => {
    try {
      // Open the native file dialog
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{
          name: 'PDF',
          extensions: ['pdf']
        }]
      });

      console.log("selected file: ", selected); // Add this line to log the selected value

      // If user selected a file
      if (selected) {
        // Read the file using Tauri's filesystem API
        const filePath = selected as string;
        const fileData = await readFile(filePath);

        // Create a File object from the binary data
        const fileName = filePath.split(/[\\/]/).pop() || 'document.pdf';
        const file = new File([fileData], fileName, { type: 'application/pdf' });

        pdf2svg(filePath);

        // Get the number of pages in the PDF
        const getPageCount = async (pdfData: ArrayBuffer): Promise<number> => {
          try {
            // Load the PDF document using pdfjs
            const pdf = await pdfjs.getDocument({ data: pdfData }).promise;

            // Get the number of pages
            const pageCount = pdf.numPages;
            return pageCount;
          } catch (error) {
            console.error('Error getting PDF page count:', error);
            return 0;
          }
        };

        // Get the page count
        const pageNum = await getPageCount(fileData.buffer);
        console.log('PDF page count:', pageNum);

        // Add page count as a custom property to the file object
        const fileWithPageCount = Object.assign(file, { pageCount: pageNum });

        // Pass the file to the parent component with page count information
        onFileChange(fileWithPageCount);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mb-6">
      <div
        onClick={handleOpenDialog}
        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-4 pb-4">
          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-1 text-sm text-gray-400">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-gray-400">PDF files only</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;