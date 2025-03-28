import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface TextBoxProps {
  position: { x: number; y: number };
  onSave: (text: string, position: { x: number; y: number }) => void;
  onCancel: () => void;
}

const TextBox: React.FC<TextBoxProps> = ({ position, onSave }) => {
  const [text, setText] = useState('');
  const [size, setSize] = useState({ width: 100, height: 24 });
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'textbox',
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (text.trim()) {
      // Save the text with the original position coordinates
      // The visual centering is handled in the rendering, but we want to save
      // the original position for consistency
      onSave(text, position);
    }
  }, [text, position, onSave]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);

      setSize({
        width: Math.max(100, newWidth),
        height: Math.max(24, newHeight)
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTextAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      e.preventDefault();
      inputRef.current.focus();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (text.trim().length > 0) {
      const relatedTarget = e.relatedTarget as HTMLElement;
      const container = e.currentTarget.closest('.textbox-container');
      const isClickingResizeHandle = relatedTarget?.classList?.contains('resize-handle');

      if (!relatedTarget || (!container?.contains(relatedTarget) && !isClickingResizeHandle)) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="absolute cursor-move textbox-container"
      onMouseDown={handleContainerMouseDown}
      style={{
        left: `${position.x - size.width / 2}px`,
        top: `${position.y - size.height / 2}px`,
        zIndex: 1000,
        position: 'absolute'
      }}
      {...listeners}
      {...attributes}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={handleTextAreaClick}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setText(prev => prev + '\n');
            } else if (e.key === 'Tab') {
              e.preventDefault();
              setText(prev => prev + '\t');
            }
          }}
          onBlur={handleBlur}
          className="bg-transparent border border-dashed border-gray-400 resize-none focus:outline-none text-black w-full h-full p-1"
          placeholder="Enter text..."
        />
        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle"
          onMouseDown={handleMouseDown}
          style={{
            background: 'transparent',
            border: '2px solid #666',
            borderTop: 'none',
            borderLeft: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default TextBox;