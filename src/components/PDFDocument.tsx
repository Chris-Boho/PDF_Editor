import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import PageInfoBar from './PageInfoBar';
import AnnotationLayer from './AnnotationLayer';

interface Annotation {
	id: string;
	type: 'textbox';
	x: number;
	y: number;
	width: number;
	height: number;
	content: string;
	pageNumber: number;
}

interface PDFDocumentViewerProps {
	file: File;
	onLoadSuccess: ({ numPages }: { numPages: number }) => void;
	isTextToolActive?: boolean;
	onAnnotationsChange?: (annotations: Annotation[]) => void;
	fontSize?: number;
	fontFamily?: string;
}

const PDFDocumentViewer: React.FC<PDFDocumentViewerProps> = ({
	file,
	onLoadSuccess,
	isTextToolActive = false,
	onAnnotationsChange,
	fontSize = 12,
	fontFamily = 'Arial'
}) => {
	const [numPages, setNumPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [scale, setScale] = useState(1);
	const [annotations, setAnnotations] = useState<Annotation[]>([]);

	// Pass annotations to parent component when they change
	useEffect(() => {
		if (onAnnotationsChange) {
			onAnnotationsChange(annotations);
		}
	}, [annotations, onAnnotationsChange]);
	const [localTextToolActive, setLocalTextToolActive] = useState(isTextToolActive);
	const [editMode, setEditMode] = useState(true); // Default to edit mode

	useEffect(() => {
		setLocalTextToolActive(isTextToolActive);
	}, [isTextToolActive]);

	useEffect(() => {
		const handleTextAnnotationCreated = () => {
			setLocalTextToolActive(false);
			// Notify parent components that text tool should be deactivated
			const event = new CustomEvent('textToolDeactivated');
			document.dispatchEvent(event);
		};

		document.addEventListener('textAnnotationCreated', handleTextAnnotationCreated);
		return () => {
			document.removeEventListener('textAnnotationCreated', handleTextAnnotationCreated);
		};
	}, []);

	const handleLoadSuccess = (data: { numPages: number }) => {
		setNumPages(data.numPages);
		onLoadSuccess(data);
	};
	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const toggleEditMode = () => {
		setEditMode((prevMode) => !prevMode);
	};

	return (
		<div className='flex flex-col items-center w-full overflow-auto pb-12'>
			<Document
				file={file}
				onLoadSuccess={handleLoadSuccess}
				className='max-w-full'
				error={<p className='text-red-500'>Failed to load PDF file.</p>}
				loading={<p className='text-white'>Loading PDF...</p>}
			>
				{Array.from(new Array(numPages), (_, index) => {
					const pageNumber = index + 1;
					return (
						<div
							key={`page_${pageNumber}`}
							className='mb-4'
							id={`page-${pageNumber}`}
							onFocus={() => handlePageChange(pageNumber)}
							onMouseEnter={() => handlePageChange(pageNumber)}
						>
							<div className='relative'>
								<Page
									pageNumber={pageNumber}
									renderTextLayer={true}
									renderAnnotationLayer={true}
									className='max-w-full shadow-lg'
									scale={scale}
								/>
								<AnnotationLayer
									pageNumber={pageNumber}
									scale={scale}
									isTextToolActive={localTextToolActive}
									annotations={annotations}
									editMode={editMode}
									fontSize={fontSize}
									fontFamily={fontFamily}
									onAnnotationAdded={(annotation) => {
										setAnnotations((prev) => [...prev, annotation]);
									}}
									onAnnotationUpdated={(updatedAnnotation) => {
										setAnnotations((prev) =>
											prev.map((anno) => (anno.id === updatedAnnotation.id ? updatedAnnotation : anno))
										);
									}}
								/>
							</div>
						</div>
					);
				})}
			</Document>
			{numPages > 0 && (
				<PageInfoBar
					currentPage={currentPage}
					totalPages={numPages}
					scale={scale}
					onScaleChange={setScale}
					editMode={editMode}
					onEditModeToggle={toggleEditMode}
				/>
			)}
		</div>
	);
};

export default PDFDocumentViewer;
