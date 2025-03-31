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
	fontSize?: number;
	fontFamily?: string;
}

interface TextBoxProps {
	annotation: Annotation;
	scale: number;
	isSelected: boolean;
	onSelect: () => void;
	onUpdate: (annotation: Annotation) => void;
	editMode?: boolean;
	fontSize?: number;
	fontFamily?: string;
}

const TextBox: React.FC<TextBoxProps> = ({
	annotation,
	scale,
	isSelected,
	onSelect,
	onUpdate,
	editMode = true,
	fontSize = 12,
	fontFamily = 'Arial'
}) => {
	// Use annotation's font properties if they exist, otherwise use the props
	const effectiveFontSize = annotation.fontSize || fontSize;
	const effectiveFontFamily = annotation.fontFamily || fontFamily;
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(annotation.content);
	const [position, setPosition] = useState({ x: annotation.x, y: annotation.y });
	const [size, setSize] = useState({ width: annotation.width, height: annotation.height });
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
	const [activeHandle, setActiveHandle] = useState<string | null>(null);

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
			height: size.height,
			fontSize: effectiveFontSize,
			fontFamily: effectiveFontFamily
		});
	}, [annotation, content, position.x, position.y, size.width, size.height, effectiveFontSize, effectiveFontFamily, onUpdate]);

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

	const handleResizeStart = (e: React.MouseEvent, handle: string) => {
		e.stopPropagation();
		setIsResizing(true);
		setActiveHandle(handle);
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
				// Get the current mouse position in document coordinates
				const currentMouseX = e.clientX;
				const currentMouseY = e.clientY;

				// Calculate the delta from the resize start position
				const deltaX = (currentMouseX - resizeStart.x) / scale;
				const deltaY = (currentMouseY - resizeStart.y) / scale;

				// Initialize with current values
				let newWidth = size.width;
				let newHeight = size.height;
				let newX = position.x;
				let newY = position.y;

				// Get the font size to use as minimum height when resizing from top
				const minHeight = effectiveFontSize * 2;

				// Handle resize based on which handle is being dragged
				switch (activeHandle) {
					case 'top-left':
						// Update width - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width - deltaX);
						// Update x position based on width change
						newX = position.x + (size.width - newWidth);

						// Update height - allow bidirectional resizing with font size constraint
						newHeight = Math.max(minHeight, resizeStart.height - deltaY);
						// Update y position based on height change
						newY = position.y + (size.height - newHeight);
						break;

					case 'top-right':
						// Update width - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width + deltaX);

						// Update height - allow bidirectional resizing with font size constraint
						newHeight = Math.max(minHeight, resizeStart.height - deltaY);
						// Update y position based on height change
						newY = position.y + (size.height - newHeight);
						break;

					case 'bottom-left':
						// Update width - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width - deltaX);
						// Update x position based on width change
						newX = position.x + (size.width - newWidth);

						// Update height - allow bidirectional resizing
						newHeight = Math.max(minHeight, resizeStart.height + deltaY);
						break;

					case 'bottom-right':
						// Update width and height - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width + deltaX);
						newHeight = Math.max(minHeight, resizeStart.height + deltaY);
						break;

					case 'top':
						// Update height - allow bidirectional resizing with font size constraint
						newHeight = Math.max(minHeight, resizeStart.height - deltaY);
						// Update y position based on height change
						newY = position.y + (size.height - newHeight);
						break;

					case 'right':
						// Update width - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width + deltaX);
						break;

					case 'bottom':
						// Update height - allow bidirectional resizing
						newHeight = Math.max(minHeight, resizeStart.height + deltaY);
						break;

					case 'left':
						// Update width - allow bidirectional resizing
						newWidth = Math.max(50, resizeStart.width - deltaX);
						// Update x position based on width change
						newX = position.x + (size.width - newWidth);
						break;
				}

				setSize({
					width: newWidth,
					height: newHeight
				});

				setPosition({
					x: newX,
					y: newY
				});
			}
		},
		[isDragging, isResizing, dragStart, resizeStart, position, size, scale, activeHandle]
	);

	const handleMouseUp = useCallback(() => {
		if (isDragging || isResizing) {
			updateAnnotation();
			setIsDragging(false);
			setIsResizing(false);
			setActiveHandle(null);
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

	// Determine visibility based on edit mode - border should always be visible in edit mode
	// and never visible in preview mode

	return (
		<div
			ref={textBoxRef}
			className={`absolute border ${editMode ? 'border-dashed border-gray-300' : 'border-transparent'} bg-transparent rounded p-1 ${isEditing ? 'cursor-text' : editMode ? 'cursor-move' : 'cursor-default'
				}`}
			style={{
				left: position.x * scale,
				top: position.y * scale,
				width: size.width * scale,
				height: size.height * scale,
				zIndex: isSelected ? 20 : 10,
				borderColor: editMode ? 'rgba(107, 114, 128, 1)' : 'rgba(107, 114, 128, 0)',
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
					style={{
						fontSize: `${effectiveFontSize * scale}px`,
						fontFamily: effectiveFontFamily
					}}
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
					style={{
						fontSize: `${effectiveFontSize * scale}px`,
						fontFamily: effectiveFontFamily,
						userSelect: isResizing ? 'none' : 'auto', // Disable text selection during resize
						pointerEvents: isResizing ? 'none' : 'auto' // Disable pointer events during resize
					}}
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
				<>
					{/* Top-left resize handle */}
					<div
						className='absolute top-0 left-0 w-2 h-2 bg-white border border-gray-500 cursor-nw-resize'
						style={{ transform: 'translate(-50%, -50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'top-left')}
					/>
					{/* Top resize handle */}
					<div
						className='absolute top-0 left-1/2 w-2 h-2 bg-white border border-gray-500 cursor-n-resize'
						style={{ transform: 'translate(-50%, -50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'top')}
					/>
					{/* Top-right resize handle */}
					<div
						className='absolute top-0 right-0 w-2 h-2 bg-white border border-gray-500 cursor-ne-resize'
						style={{ transform: 'translate(50%, -50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'top-right')}
					/>
					{/* Right resize handle */}
					<div
						className='absolute top-1/2 right-0 w-2 h-2 bg-white border border-gray-500 cursor-e-resize'
						style={{ transform: 'translate(50%, -50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'right')}
					/>
					{/* Bottom-right resize handle */}
					<div
						className='absolute bottom-0 right-0 w-2 h-2 bg-white border border-gray-500 cursor-se-resize'
						style={{ transform: 'translate(50%, 50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
					/>
					{/* Bottom resize handle */}
					<div
						className='absolute bottom-0 left-1/2 w-2 h-2 bg-white border border-gray-500 cursor-s-resize'
						style={{ transform: 'translate(-50%, 50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'bottom')}
					/>
					{/* Bottom-left resize handle */}
					<div
						className='absolute bottom-0 left-0 w-2 h-2 bg-white border border-gray-500 cursor-sw-resize'
						style={{ transform: 'translate(-50%, 50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
					/>
					{/* Left resize handle */}
					<div
						className='absolute top-1/2 left-0 w-2 h-2 bg-white border border-gray-500 cursor-w-resize'
						style={{ transform: 'translate(-50%, -50%)' }}
						onMouseDown={(e) => handleResizeStart(e, 'left')}
					/>
				</>
			)}
		</div>
	);
};

export default TextBox;
