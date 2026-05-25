import React, { useRef, useEffect, useState } from 'react';
import { Upload, HelpCircle, CornerDownLeft, Eye, EyeOff } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  fontSize: number;
  lineNumbers: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  layoutMode: string;
  onToggleLayout: () => void;
}

export default function Editor({ 
  value, 
  onChange, 
  fontSize, 
  lineNumbers, 
  textareaRef,
  layoutMode,
  onToggleLayout
}: EditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate exact list of line indexes
  const lines = value.split('\n');
  const totalLines = Math.max(lines.length, 1);

  // Sync scroll of the gutter with the textarea scrolling
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Safe tab indent inserting and carriage return alignment
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      // Insert 2 spaces
      const indent = '  ';
      const newValue = val.substring(0, start) + indent + val.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }, 0);
    }
  };

  // Drag and drop image upload engine
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Format image Markdown cleanly
          const altName = file.name.split('.')[0] || 'uploaded-image';
          const markdownImg = `\n![${altName}](${base64})\n`;
          
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            const updated = val.substring(0, start) + markdownImg + val.substring(end);
            onChange(updated);
            
            setTimeout(() => {
              textarea.focus();
              textarea.selectionStart = textarea.selectionEnd = start + markdownImg.length;
            }, 0);
          } else {
            onChange(value + markdownImg);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Process standard click trigger to insert image file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const altName = file.name.split('.')[0] || 'uploaded-image';
          const markdownImg = `\n![${altName}](${base64})\n`;

          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            const updated = val.substring(0, start) + markdownImg + val.substring(end);
            onChange(updated);

            setTimeout(() => {
              textarea.focus();
              textarea.selectionStart = textarea.selectionEnd = start + markdownImg.length;
            }, 0);
          } else {
            onChange(value + markdownImg);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div 
      className={`relative h-full flex flex-col bg-[#0a0a0a] select-text transition-all duration-200 border-r border-[#222] ${
        isDragging ? 'ring-1 ring-[#a89f8d]/50 ring-inset bg-[#a89f8d]/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Editor top header controls bar */}
      <div className="no-print flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0d0d0d] select-none">
        <span className="text-[10px] uppercase tracking-widest text-[#666] font-sans font-semibold flex items-center gap-1.5">
          Markdown Editor
        </span>
        
        <div className="flex items-center gap-2">
          {/* File select upload fallback */}
          <label className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-sans font-medium text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer transition border border-transparent hover:border-[#333]">
            <Upload className="w-3.5 h-3.5" />
            <span>Insert Image</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect} 
              className="hidden" 
            />
          </label>

          <button
            onClick={onToggleLayout}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-sans font-medium text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer transition border border-transparent hover:border-[#333]"
            title="Toggle view mode focus"
          >
            {layoutMode === 'split' ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Write Only</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Split View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Canvas workspace area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Dynamic code indentation ruler gutter */}
        {lineNumbers && (
          <div 
            ref={gutterRef}
            className="w-12 bg-[#090909] text-[#333] border-r border-[#222] py-4 font-mono select-none overflow-hidden text-right pr-3.5 space-y-[4px]"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
          >
            {Array.from({ length: totalLines }).map((_, i) => (
              <div key={i} className="leading-relaxed leading-6 h-6">{i + 1}</div>
            ))}
          </div>
        )}

        {/* Text editor canvas container */}
        <div className="flex-1 relative h-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder="# The Manuscript...&#10;&#10;Type standard markdown tags or drag images here to format."
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
            className={`w-full h-full p-6 md:p-8 bg-transparent text-[#d1d1d1] border-none resize-none focus:outline-none focus:ring-0 font-mono leading-relaxed leading-6 overflow-y-auto selection:bg-[#a89f8d]/20`}
          />
        </div>
      </div>

      {/* Drag overlay feedback element */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#a89f8d]/5 backdrop-blur-xs flex items-center justify-center border-2 border-dashed border-[#a89f8d]/40 m-2 rounded pointer-events-none z-40 animate-fade-in">
          <div className="bg-[#0f0f0f] border border-[#222] shadow-2xl rounded p-6 flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-[#a89f8d] animate-bounce" />
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-[#f0f0f0]">
              Drag & Drop to Embed Image
            </p>
            <p className="text-[10px] text-[#555] lowercase italic">
              auto-coded to persistent offline Base64 string
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
