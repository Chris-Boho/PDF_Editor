import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

/**
 * Exports a PDF with text annotations applied directly to the document
 * @param originalPdfBytes The original PDF file bytes
 * @param annotations Array of text annotations to apply
 * @returns Promise with the modified PDF bytes
 */
export async function exportPdfWithAnnotations(
	originalPdfBytes: ArrayBuffer,
	annotations: Annotation[]
): Promise<Uint8Array> {
	// Load the PDF document
	const pdfDoc = await PDFDocument.load(originalPdfBytes);
	
	// Get all pages
	const pages = pdfDoc.getPages();
	
	// Embed the default font
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	
	// Group annotations by page
	const annotationsByPage = annotations.reduce<Record<number, Annotation[]>>((acc, annotation) => {
		const pageIndex = annotation.pageNumber - 1; // Convert to 0-based index
		if (!acc[pageIndex]) {
			acc[pageIndex] = [];
		}
		acc[pageIndex].push(annotation);
		return acc;
	}, {});
	
	// Process each page with annotations
	Object.entries(annotationsByPage).forEach(([pageIndexStr, pageAnnotations]) => {
		const pageIndex = parseInt(pageIndexStr, 10);
		const page = pages[pageIndex];
		
		if (!page) return;
		
		// Get page dimensions
		const { height: pageHeight, width: pageWidth } = page.getSize();
		
		// Add each annotation to the page
		pageAnnotations.forEach(annotation => {
			if (annotation.type === 'textbox' && annotation.content.trim()) {
				// Calculate position (PDF coordinates start from bottom-left)
				// Add padding offset to account for the textbox border/padding (p-1 class = 0.25rem = ~4px)
				const paddingOffset = 4;
				const x = annotation.x + paddingOffset;
				// Adjust y-coordinate: invert y and add offsets to account for font baseline and padding
				// PDF text position is at the baseline, not the top of the text
				const y = pageHeight - annotation.y - 12 - paddingOffset; // Offset by font size and padding to align properly
				
				// Ensure the text does not exceed the page width
				const maxWidth = Math.min(annotation.width, pageWidth - x);
				
				// Add text to the page
				page.drawText(annotation.content, {
					x,
					y,
					size: 12, // Keep font size consistent in exported PDF
					font,
					color: rgb(0, 0, 0),
					maxWidth
				});
			}
		});
	});
	
	// Serialize the PDFDocument to bytes
	return pdfDoc.save();
}

/**
 * Generates a filename for the exported PDF
 * @param originalFilename The original PDF filename
 * @returns A new filename with '_exported' appended before the extension
 */
export function getExportedFilename(originalFilename: string): string {
	const lastDotIndex = originalFilename.lastIndexOf('.');
	if (lastDotIndex === -1) {
		return `${originalFilename}_exported.pdf`;
	}
	
	const nameWithoutExtension = originalFilename.substring(0, lastDotIndex);
	const extension = originalFilename.substring(lastDotIndex);
	
	return `${nameWithoutExtension}_exported${extension}`;
}