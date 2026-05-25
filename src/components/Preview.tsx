import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { FileText, Printer, FileCode, CheckCircle2 } from 'lucide-react';

interface PreviewProps {
  content: string;
  title: string;
}

// Custom Syntax Highlighting implementation
function highlightCode(code: string, lang: string): string {
  if (!lang) return escapeHtml(code);
  const cleanLang = lang.toLowerCase().trim();
  
  if (cleanLang === 'javascript' || cleanLang === 'js' || cleanLang === 'typescript' || cleanLang === 'ts') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\/\/.*)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/(["'`])(.*?)\1/g, '<span class="text-amber-500">$1$2$1</span>')
      .replace(/\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|try|catch|new|async|await)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
      .replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="text-sky-400">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-emerald-400">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-rose-400 font-semibold">$1</span>');
  } else if (cleanLang === 'html' || cleanLang === 'xml') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/(["'])(.*?)\1/g, '<span class="text-amber-500">$1$2$1</span>')
      .replace(/(&lt;\/?[a-zA-Z0-9_\-]+)/g, '<span class="text-indigo-400 font-semibold">$1</span>')
      .replace(/(\/?&gt;)/g, '<span class="text-indigo-400 font-semibold">$1</span>')
      .replace(/\b([a-zA-Z0-9_\-]+)(?=\s*=)/g, '<span class="text-sky-400">$1</span>');
  } else if (cleanLang === 'css') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/(["'])(.*?)\1/g, '<span class="text-amber-500">$1$2$1</span>')
      .replace(/([a-zA-Z\-]+)(?=\s*:)/g, '<span class="text-indigo-400">$1</span>')
      .replace(/(:\s*[^;\}]+)/g, (m) => m.startsWith(':') ? `:<span class="text-emerald-400">${m.slice(1)}</span>` : m);
  } else if (cleanLang === 'json') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(".*?")(\s*:)/g, '<span class="text-indigo-400 font-medium">$1</span>$2')
      .replace(/(:\s*)(".*?")/g, '$1<span class="text-amber-500">$2</span>')
      .replace(/\b(true|false|null|\d+)\b/g, '<span class="text-emerald-400 font-semibold">$1</span>');
  } else if (cleanLang === 'python' || cleanLang === 'py') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(#.*)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/(["'`])(.*?)\1/g, '<span class="text-amber-500">$1$2$1</span>')
      .replace(/\b(def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|try|except|with|pass|print)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
      .replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="text-sky-400">$1</span>')
      .replace(/\b(True|False|None|\d+)\b/g, '<span class="text-emerald-400 font-semibold">$1</span>');
  }
  
  return escapeHtml(code);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const customRenderer = {
  image({ href, title, text }: { href: string; title: string | null; text: string }) {
    return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="max-w-full h-auto rounded border border-[#222] my-6 mx-auto hover:scale-[1.01] transition-all" referrerpolicy="no-referrer" />`;
  },
  code({ text, lang }: { text: string; lang?: string }) {
    const highlighted = highlightCode(text, lang || '');
    return `<div class="relative group my-6 rounded overflow-hidden border border-[#222] bg-[#0c0c0c] shadow-sm">
      <div class="flex items-center justify-between px-4 py-2 bg-[#090909] border-b border-[#222] text-[10px] uppercase tracking-widest text-[#555] font-mono">
        <span>${lang || 'plaintext'}</span>
        <button onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText).then(() => { this.innerText = 'Copied!'; setTimeout(() => this.innerText = 'Copy', 1500) })" class="px-2 py-0.5 hover:bg-[#1a1a1a] rounded transition text-[#888] hover:text-white pointer">Copy</button>
      </div>
      <pre class="p-5 overflow-x-auto text-[#b1b1b1] font-mono text-xs leading-relaxed"><code class="hljs">${highlighted}</code></pre>
    </div>`;
  },
  table({ header, body }: { header: string; body: string }) {
    return `<div class="overflow-x-auto my-6 rounded border border-[#222] shadow-sm">
      <table class="w-full text-left border-collapse text-xs text-[#b1b1b1] font-serif">
        <thead class="bg-[#141414] text-[#f0f0f0] font-semibold border-b border-[#222]">
          ${header}
        </thead>
        <tbody class="divide-y divide-[#222]">
          ${body}
        </tbody>
      </table>
    </div>`;
  },
  tablerow({ content }: { content: string }) {
    return `<tr>${content}</tr>`;
  },
  tablecell({ content, flags }: { content: string; flags: { header: boolean; align: 'center' | 'left' | 'right' | null } }) {
    const alignClass = flags.align ? `text-${flags.align}` : '';
    const styleClass = flags.header ? 'px-4 py-3 font-semibold' : 'px-4 py-3';
    return `<td class="${alignClass} ${styleClass}">${content}</td>`;
  },
  blockquote({ text }: { text: string }) {
    return `<blockquote class="pl-5 border-l border-[#a89f8d] italic text-[#999] my-6 py-2 pr-4 font-serif leading-relaxed">${text}</blockquote>`;
  },
  listitem({ text, checked }: { text: string; checked?: boolean }) {
    if (checked !== undefined) {
      const isChecked = checked ? 'checked' : '';
      return `<li class="flex items-start gap-2.5 my-2.5 list-none font-serif text-[16px]">
        <input type="checkbox" ${isChecked} disabled class="mt-1.5 h-3.5 w-3.5 rounded text-[#a89f8d] border-[#333] focus:ring-0" />
        <span class="${checked ? 'line-through text-[#555]' : 'text-[#b1b1b1]'}">${text}</span>
      </li>`;
    }
    return `<li class="my-2 list-disc list-inside text-[#b1b1b1] font-serif text-[16px]">${text}</li>`;
  },
  list({ body, ordered }: { body: string; ordered: boolean }) {
    const listTag = ordered ? 'ol' : 'ul';
    const listClass = ordered ? 'list-decimal list-inside space-y-2.5 my-5 pl-1 text-[#b1b1b1] font-serif' : 'space-y-2.5 my-5 pl-1 text-[#b1b1b1] font-serif';
    return `<${listTag} class="${listClass}">${body}</${listTag}>`;
  },
  heading({ text, depth }: { text: string; depth: number }) {
    const sizes: Record<number, string> = {
      1: 'text-3xl font-serif text-[#f0f0f0] tracking-tight border-b border-[#222] pb-2 mt-8 mb-4',
      2: 'text-xl font-serif text-[#f0f0f0] tracking-tight mt-7 mb-3 border-b border-[#333]/40 pb-1',
      3: 'text-lg font-serif text-[#e0e0e0] mt-6 mb-3',
      4: 'text-base font-serif text-[#d0d0d0] mt-5 mb-2',
      5: 'text-sm font-serif text-[#c0c0c0] mt-4 mb-2',
      6: 'text-xs font-serif text-[#a89f8d] uppercase tracking-widest mt-4 mb-2'
    };
    return `<h${depth} class="${sizes[depth] || 'text-base font-bold'}">${text}</h${depth}>`;
  },
  paragraph({ text }: { text: string }) {
    return `<p class="leading-relaxed text-[#b1b1b1] my-4 hover:text-[#f0f0f0] transition-colors font-serif text-[16px]">${text}</p>`;
  },
  checkbox({ checked }: { checked: boolean }) {
    return `<input type="checkbox" ${checked ? 'checked' : ''} disabled class="rounded border-[#333] text-[#a89f8d] shadow-sm" />`;
  }
};

marked.use({ renderer: customRenderer as any, gfm: true, breaks: true });

export default function Preview({ content, title }: PreviewProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    try {
      // Async compile styled marked
      const compiled = marked.parse(content || '*Empty Document*');
      if (typeof compiled === 'string') {
        setHtml(compiled);
      } else {
        compiled.then((res) => setHtml(res));
      }
    } catch (e) {
      console.error("Markdown compilation failure", e);
      setHtml(`<div class="p-4 bg-[#141414] text-rose-450 border border-rose-955/20 rounded">Error compiling: ${(e as Error).message}</div>`);
    }
  }, [content]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="preview-panel-element" className="h-full flex flex-col bg-[#0f0f0f] text-[#d1d1d1] transition-colors duration-200 select-text">
      {/* Mini preview bar for action triggers */}
      <div className="no-print flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0d0d0d] select-none">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#a89f8d]" />
          <span className="text-[10px] uppercase tracking-widest text-[#666] font-sans font-semibold">
            Manuscript Preview
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans text-[#888] hover:text-white border border-[#333] rounded hover:bg-[#1a1a1a] transition cursor-pointer"
          title="Print or Export to PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export (PDF)</span>
        </button>
      </div>

      {/* Primary Scrollable Preview Container */}
      <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 select-text styled-preview-body">
        <article 
          className="max-w-xl mx-auto font-serif py-4 text-[#b1b1b1]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Styled print CSS to format standard print targets as pristine pages */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #preview-panel-element, #preview-panel-element * {
            visibility: visible !important;
          }
          #preview-panel-element {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .styled-preview-body {
            overflow: visible !important;
            padding: 2.5cm 2cm !important;
          }
          p, h1, h2, h3, blockquote, pre {
            page-break-inside: avoid !important;
          }
          h1, h2, h3 {
            color: #000 !important;
            border-bottom: 1px solid #ddd !important;
          }
          pre {
            background-color: #f5f5f5 !important;
            color: #000 !important;
            border: 1px solid #ccc !important;
            font-size: 10pt !important;
          }
        }
      `}</style>
    </div>
  );
}
