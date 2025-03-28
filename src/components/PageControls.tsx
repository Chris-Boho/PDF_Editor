import React from 'react';

interface PageControlsProps {
  pageNumber: number;
  numPages: number;
  previousPage: () => void;
  nextPage: () => void;
  fileName: string;
}

const PageControls: React.FC<PageControlsProps> = ({ 
  pageNumber, 
  numPages, 
  previousPage, 
  nextPage,
  fileName 
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white truncate max-w-xs">
        {fileName}
      </h2>
      <div className="flex items-center space-x-2">
        <button 
          onClick={previousPage} 
          disabled={pageNumber <= 1}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-white">
          Page {pageNumber} of {numPages}
        </span>
        <button 
          onClick={nextPage} 
          disabled={pageNumber >= numPages}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PageControls;