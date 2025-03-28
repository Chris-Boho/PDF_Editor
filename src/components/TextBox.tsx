import React, { useState, useRef, useEffect, useCallback } from 'react';

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

interface TextBoxProps {
	annotation: Annotation;
	scale: number;
	isSelected: boolean;
	onSelect: () => void;
	onUpdate: (annotation: Annotation) => void;
	editMode?: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
	annotation,
	scale,
	isSelected,
	onSelect,
	onUpdate,
	editMode = true
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(annotation.content);
	const [position, setPosition] = useState({ x: annotation.x, y: annotation.y });
	const [size, setSize] = useState({ width: annotation.width, height: annotation.height });
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

	const textBoxRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Update local state when annotation changes
	useEffect(() => {
		setContent(annotation.content);
		setPosition({ x: annotation.x, y: annotation.y });
		setSize({ width: annotation.width, height: annotation.height });
	}, [annotation]);

	// Focus textarea when editing starts
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [isEditing]);

	const handleDoubleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
	};

	const handleBlur = () => {
		setIsEditing(false);
		updateAnnotation();
	};

	const updateAnnotation = useCallback(() => {
		onUpdate({
			...annotation,
			content,
			x: position.x,
			y: position.y,
			width: size.width,
			height: size.height
		});
	}, [annotation, content, position.x, position.y, size.width, size.height, onUpdate]);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();

		// Don't do anything if we're in editing mode
		if (isEditing) {
			return;
		}

		onSelect();

		// Only start dragging if we're clicking directly on the textbox container
		if (e.target === textBoxRef.current) {
			setIsDragging(true);
			setDragStart({ x: e.clientX, y: e.clientY });
		}
	};

	const handleResizeStart = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsResizing(true);
		setResizeStart({
			width: size.width,
			height: size.height,
			x: e.clientX,
			y: e.clientY
		});
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (isDragging) {
				const dx = (e.clientX - dragStart.x) / scale;
				const dy = (e.clientY - dragStart.y) / scale;

				setPosition({
					x: position.x + dx,
					y: position.y + dy
				});

				setDragStart({ x: e.clientX, y: e.clientY });
			} else if (isResizing) {
				const dx = (e.clientX - resizeStart.x) / scale;
				const dy = (e.clientY - resizeStart.y) / scale;

				setSize({
					width: Math.max(50, resizeStart.width + dx),
					height: Math.max(20, resizeStart.height + dy)
				});
			}
		},
		[isDragging, isResizing, dragStart, resizeStart, position, scale]
	);

	const handleMouseUp = useCallback(() => {
		if (isDragging || isResizing) {
			updateAnnotation();
			setIsDragging(false);
			setIsResizing(false);
		}
	}, [isDragging, isResizing, updateAnnotation]);

	// Add and remove event listeners for drag and resize
	useEffect(() => {
		if (isDragging || isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

	// Determine visibility based on selection or editing state
	const isVisible = isSelected || isEditing;

	return (
		<div
			ref={textBoxRef}
			className={`absolute border ${editMode && (isSelected || isEditing) ? 'border-gray-300' : 'border-transparent'} bg-transparent rounded p-1 ${
				isEditing ? 'cursor-text' : editMode ? 'cursor-move' : 'cursor-default'
			}`}
			style={{
				left: position.x * scale,
				top: position.y * scale,
				width: size.width * scale,
				height: size.height * scale,
				zIndex: isSelected ? 20 : 10,
				borderColor: editMode && isVisible ? 'rgba(107, 114, 128, 1)' : 'rgba(107, 114, 128, 0)',
				pointerEvents: editMode ? 'auto' : 'none' // Only allow interaction in edit mode
			}}
			onClick={(e) => {
				e.stopPropagation();
				if (editMode && !isEditing) {
					onSelect();
				}
			}}
			onMouseDown={(e) => {
				// Only handle mouse down for dragging if we're in edit mode and not editing
				if (editMode && !isEditing && e.target === textBoxRef.current) {
					handleMouseDown(e);
				}
			}}
			onDoubleClick={(e) => {
				if (editMode) {
					handleDoubleClick(e);
				}
			}}
		>
			{isEditing ? (
				<textarea
					ref={textareaRef}
					className='w-full h-full resize-none border-none focus:outline-none bg-transparent text-black'
					value={content}
					onChange={handleContentChange}
					onBlur={handleBlur}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && e.shiftKey) {
							// Allow shift+enter for new lines
							return;
						} else if (e.key === 'Enter') {
							// Finish editing on Enter
							e.preventDefault();
							handleBlur();
						} else if (e.key === 'Escape') {
							// Cancel editing on Escape
							e.preventDefault();
							setContent(annotation.content); // Revert to original content
							setIsEditing(false);
						}
					}}
					autoFocus
				/>
			) : (
				<div
					className='w-full h-full overflow-hidden cursor-text text-black'
					onDoubleClick={handleDoubleClick}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						if (!isSelected) {
							onSelect();
						} else {
							// If already selected, a single click should start editing
							setIsEditing(true);
							// Ensure we focus the textarea on the next render
							setTimeout(() => {
								if (textareaRef.current) {
									textareaRef.current.focus();
								}
							}, 0);
						}
					}}
				>
					{content || <span className='text-black italic'>Click to edit text</span>}
				</div>
			)}

			{editMode && isSelected && (
				<div
					className='absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize'
					style={{ transform: 'translate(50%, 50%)' }}
					onMouseDown={handleResizeStart}
				/>
			)}
		</div>
	);
};

export default TextBox;
