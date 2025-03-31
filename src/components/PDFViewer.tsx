import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import FileUploader from './FileUploader';
import PDFDocumentViewer from './PDFDocument';
import { Annotation } from './AnnotationLayer';

// Configure PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.mjs',
	import.meta.url
).toString();

interface PDFViewerProps {
	onFileChange?: (file: File | null) => void;
	isTextToolActive?: boolean;
	onAnnotationsChange?: (annotations: Annotation[]) => void;
	fontSize?: number;
	fontFamily?: string;
}

const PDFViewer = ({ onFileChange, isTextToolActive = false, onAnnotationsChange, fontSize = 12, fontFamily = 'Arial' }: PDFViewerProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [numPages, setNumPages] = useState<number>(0);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files[0]) {
			setFile(files[0]);
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
		<div className='flex flex-col items-center w-full'>
			{!file ? (
				<FileUploader onFileChange={handleFileChange} />
			) : (
				<div className='w-full'>
					<PDFDocumentViewer
						file={file}
						onLoadSuccess={onDocumentLoadSuccess}
						isTextToolActive={isTextToolActive}
						onAnnotationsChange={onAnnotationsChange}
						fontSize={fontSize}
						fontFamily={fontFamily}
					/>
				</div>
			)}
		</div>
	);
};

export default PDFViewer;
