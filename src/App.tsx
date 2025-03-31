import { useState, useEffect, useRef } from 'react';
import PDFViewer from './components/PDFViewer';
import Toolbar from './components/Toolbar';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import { exportPdfWithAnnotations } from './utils/pdfExport';
import { getExportedFilename } from './utils/pdfExport';
import { Annotation } from './components/AnnotationLayer';

interface AppContentProps {
	isTextToolActive: boolean;
	setIsTextToolActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContent = ({ isTextToolActive, setIsTextToolActive }: AppContentProps) => {
	const { theme } = useTheme();
	const [pdfTitle, setPdfTitle] = useState<string | null>(null);
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [annotations, setAnnotations] = useState<Annotation[]>([]);
	const [fontSize, setFontSize] = useState<number>(12);
	const [fontFamily, setFontFamily] = useState<string>('Arial');
	const fileRef = useRef<HTMLAnchorElement | null>(null);

	const handleTextToolToggle = () => {
		setIsTextToolActive((prev) => !prev);
	};

	const handleExportPdf = async () => {
		if (!pdfFile) return;

		try {
			// Read the PDF file as ArrayBuffer
			const fileBuffer = await pdfFile.arrayBuffer();

			// Export the PDF with annotations
			const exportedPdfBytes = await exportPdfWithAnnotations(fileBuffer, annotations);

			// Create a Blob from the PDF bytes
			const blob = new Blob([exportedPdfBytes], { type: 'application/pdf' });

			// Create a download link
			const url = URL.createObjectURL(blob);

			// Create filename for the exported PDF
			const exportedFilename = getExportedFilename(pdfFile.name);

			// Create a temporary anchor element if it doesn't exist
			if (!fileRef.current) {
				const a = document.createElement('a');
				a.style.display = 'none';
				document.body.appendChild(a);
				fileRef.current = a;
			}

			// Set the download attributes
			fileRef.current.href = url;
			fileRef.current.download = exportedFilename;

			// Trigger the download
			fileRef.current.click();

			// Clean up the URL object
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			alert('Failed to export PDF. Please try again.');
		}
	};

	return (
		<div
			className={`min-h-screen flex flex-col ${
				theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
			} p-8 pt-16 pb-16`}
		>
			<Toolbar
				pdfTitle={pdfTitle}
				isTextToolActive={isTextToolActive}
				onTextToolToggle={handleTextToolToggle}
				onExportPdf={handleExportPdf}
				fontSize={fontSize}
				fontFamily={fontFamily}
				onFontSizeChange={setFontSize}
				onFontFamilyChange={setFontFamily}
			/>
			<div className='mt-8 flex justify-center'>
				<PDFViewer
					onFileChange={(file) => {
						setPdfTitle(file ? file.name : null);
						setPdfFile(file);
					}}
					isTextToolActive={isTextToolActive}
					onAnnotationsChange={setAnnotations}
					fontSize={fontSize}
					fontFamily={fontFamily}
				/>
			</div>
		</div>
	);
};

function App() {
	const [isTextToolActive, setIsTextToolActive] = useState(false);

	useEffect(() => {
		const handleTextToolDeactivated = () => {
			setIsTextToolActive(false);
		};

		document.addEventListener('textToolDeactivated', handleTextToolDeactivated);
		return () => {
			document.removeEventListener('textToolDeactivated', handleTextToolDeactivated);
		};
	}, []);

	return (
		<ThemeProvider>
			<AppContent isTextToolActive={isTextToolActive} setIsTextToolActive={setIsTextToolActive} />
		</ThemeProvider>
	);
}

export default App;
