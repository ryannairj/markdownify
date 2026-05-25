import React from 'react';
import { 
  Bold, Italic, Code, Quote, List, ListOrdered, CheckSquare, 
  Heading1, Heading2, Heading3, Link2, Table, Eye, EyeOff,
  Download, FileDown, BookOpen
} from 'lucide-react';

interface ToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  wordCount: number;
  charCount: number;
  readTime: number;
  onExportHtml: () => void;
  onExportMd: () => void;
}

export default function Toolbar({ 
  onInsert, 
  wordCount, 
  charCount,
  readTime, 
  onExportHtml, 
  onExportMd 
}: ToolbarProps) {
  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => onInsert('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => onInsert('*', '*', 'italic text') },
    { icon: Heading1, label: 'H1 Header', action: () => onInsert('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'H2 Header', action: () => onInsert('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'H3 Header', action: () => onInsert('### ', '', 'Heading 3') },
    { icon: Quote, label: 'Blockquote', action: () => onInsert('> ', '', 'Quote text') },
    { icon: Code, label: 'Code Block', action: () => onInsert('```js\n', '\n```', 'console.log("Hello Output");') },
    { icon: List, label: 'Bullet List', action: () => onInsert('- ', '', 'List item') },
    { icon: ListOrdered, label: 'Numbered List', action: () => onInsert('1. ', '', 'List item') },
    { icon: CheckSquare, label: 'Task Checklist', action: () => onInsert('- [ ] ', '', 'Task to complete') },
    { icon: Link2, label: 'Hyperlink', action: () => onInsert('[', '](https://example.com)', 'Link label') },
    { icon: Table, label: 'Table Grid', action: () => onInsert('| Header 1 | Header 2 |\n| :--- | :--- |\n| Row 1 Col 1 | Row 1 Col 2 |\n| Row 2 Col 1 | Row 2 Col 2 |', '', '') },
  ];

  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 border-b border-[#222] bg-[#0f0f0f] select-none">
      {/* Action Shortcut buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {formatButtons.map((btn, idx) => {
          const IconComp = btn.icon;
          return (
            <button
              key={idx}
              onClick={btn.action}
              className="p-1.5 text-[#555] hover:text-[#a89f8d] hover:bg-[#1a1a1a] rounded transition-all cursor-pointer"
              title={btn.label}
              id={`toolbar-btn-${idx}`}
            >
              <IconComp className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Meta Statistics & Exports */}
      <div className="flex items-center gap-4 text-xs">
        {/* Dynamic metrics */}
        <div className="hidden sm:flex items-center gap-3.5 text-[#555] font-sans font-medium uppercase tracking-[0.15em] text-[10px]">
          <span className="flex items-center gap-1">
            Words: <b className="text-[#a89f8d] font-semibold font-mono">{wordCount}</b>
          </span>
          <span className="w-1 h-1 rounded-full bg-[#333]" />
          <span className="flex items-center gap-1">
            Chars: <b className="text-[#a89f8d] font-semibold font-mono">{charCount}</b>
          </span>
          <span className="w-1 h-1 rounded-full bg-[#333]" />
          <span className="flex items-center gap-1" title="Estimated Reading Time at 200 WPM">
            Read: <b className="text-[#a89f8d] font-semibold font-mono">{readTime}m</b>
          </span>
        </div>

        {/* Dynamic exports */}
        <div className="flex items-center gap-1.5 border-l border-[#222] pl-4">
          <button
            onClick={onExportMd}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#888] hover:text-[#f0f0f0] border border-[#333] hover:bg-[#1a1a1a] rounded transition cursor-pointer"
            title="Download Raw Markdown"
          >
            <Download className="w-3 h-3" />
            <span className="hidden md:inline">Raw (.md)</span>
          </button>
          
          <button
            onClick={onExportHtml}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#a89f8d] hover:text-white bg-transparent border border-[#a89f8d]/30 hover:bg-[#a89f8d]/10 rounded transition cursor-pointer"
            title="Download Styled Standalone HTML"
          >
            <FileDown className="w-3 h-3" />
            <span className="hidden md:inline">HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
}
