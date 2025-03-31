import React, { useState, useRef, useEffect } from 'react';
import TextBox from './TextBox';

export interface Annotation {
	id: string;
	type: 'textbox';
	x: number;
	y: number;
	width: number;
	height: number;
	content: string;
	pageNumber: number;
	fontSize?: number;
	fontFamily?: string;
}

interface AnnotationLayerProps {
	pageNumber: number;
	scale: number;
	isTextToolActive: boolean;
	onAnnotationAdded?: (annotation: Annotation) => void;
	annotations: Annotation[];
	onAnnotationUpdated?: (annotation: Annotation) => void;
	editMode?: boolean;
	fontSize?: number;
	fontFamily?: string;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
	pageNumber,
	scale,
	isTextToolActive,
	onAnnotationAdded,
	annotations,
	onAnnotationUpdated,
	editMode = true,
	fontSize = 12,
	fontFamily = 'Arial'
}) => {
	const layerRef = useRef<HTMLDivElement>(null);
	const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

	// Filter annotations for this page
	const pageAnnotations = annotations.filter((anno) => anno.pageNumber === pageNumber);

	const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isTextToolActive) return;

		// Get position relative to the layer
		const rect = layerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const x = (e.clientX - rect.left) / scale;
		const y = (e.clientY - rect.top) / scale;

		// Create a new text annotation
		const newAnnotation: Annotation = {
			id: `annotation-${Date.now()}`,
			type: 'textbox',
			x,
			y,
			width: 150,
			height: 50,
			content: '',
			pageNumber,
			fontSize,
			fontFamily
		};

		if (onAnnotationAdded) {
			onAnnotationAdded(newAnnotation);
			setSelectedAnnotation(newAnnotation.id);

			// Emit a custom event to notify parent components to deactivate text tool
			const event = new CustomEvent('textAnnotationCreated', { detail: { annotationId: newAnnotation.id } });
			document.dispatchEvent(event);
		}
	};

	const handleAnnotationUpdate = (updatedAnnotation: Annotation) => {
		if (onAnnotationUpdated) {
			onAnnotationUpdated(updatedAnnotation);
		}
	};

	const handleAnnotationSelect = (id: string) => {
		setSelectedAnnotation(id);
	};

	// Clear selection when clicking on empty area
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (layerRef.current && layerRef.current.contains(e.target as Node)) {
				// Only clear if clicking directly on the layer, not on annotations
				if ((e.target as HTMLElement).classList.contains('annotation-layer')) {
					setSelectedAnnotation(null);
				}
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div
			ref={layerRef}
			className='annotation-layer absolute inset-0 z-10'
			onClick={handleLayerClick}
			style={{ cursor: isTextToolActive ? 'text' : 'default' }}
		>
			{pageAnnotations.map((annotation) => (
				<TextBox
					key={annotation.id}
					annotation={annotation}
					scale={scale}
					isSelected={selectedAnnotation === annotation.id}
					onSelect={() => handleAnnotationSelect(annotation.id)}
					onUpdate={handleAnnotationUpdate}
					editMode={editMode}
					fontSize={annotation.fontSize || fontSize}
					fontFamily={annotation.fontFamily || fontFamily}
				/>
			))}
		</div>
	);
};

export default AnnotationLayer;
