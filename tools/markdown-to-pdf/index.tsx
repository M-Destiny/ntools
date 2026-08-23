import React, { useState, useRef, useEffect } from 'react';

interface MarkdownToPDFProps {
  markdown: string;
  onExport: (pdfBlob: Blob) => void;
}

export default function MarkdownToPDF({ markdown, onExport }: MarkdownToPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    if (previewRef.current && markdown) {
      // Simple markdown to HTML conversion for preview
      const html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br>');
      
      setPreviewHtml(html);
    }
  }, [markdown]);

  const generatePDF = async () => {
    if (!markdown.trim()) {
      setError('Please enter some markdown content');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { default: pdfMake } = await import('pdfmake/build/pdfmake');
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      // Convert markdown to pdfmake content structure
      const content = parseMarkdownToPdfMake(markdown);

      const docDefinition = {
        content,
        defaultStyle: {
          fontSize: 11,
          lineHeight: 1.5,
        },
        styles: {
          header: { fontSize: 24, bold: true, margin: [0, 0, 0, 16] },
          subheader: { fontSize: 18, bold: true, margin: [0, 12, 0, 8] },
          subsubheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 6] },
          body: { margin: [0, 0, 0, 8] },
          code: { font: 'Courier', fontSize: 9, background: '#f5f5f5', padding: 4 },
          codeBlock: { font: 'Courier', fontSize: 9, background: '#f5f5f5', padding: 8, margin: [0, 4, 0, 8] },
          link: { color: '#0066cc', textDecoration: 'underline' },
          listItem: { margin: [20, 2, 0, 2] },
        },
        pageMargins: [40, 60, 40, 60],
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      const pdfBlob = await new Promise<Blob>((resolve) => {
        pdfDocGenerator.getBlob((blob: Blob) => resolve(blob));
      });

      onExport(pdfBlob);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseMarkdownToPdfMake = (md: string): any[] => {
    const lines = md.split('\n');
    const content: any[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let inList = false;
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code blocks
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = '';
        } else {
          inCodeBlock = false;
          content.push({ text: codeBlockContent, style: 'codeBlock' });
          codeBlockContent = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        flushList(listItems, content);
        content.push({ text: trimmed.slice(2), style: 'header' });
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList(listItems, content);
        content.push({ text: trimmed.slice(3), style: 'subheader' });
        continue;
      }
      if (trimmed.startsWith('### ')) {
        flushList(listItems, content);
        content.push({ text: trimmed.slice(4), style: 'subsubheader' });
        continue;
      }

      // Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
        continue;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        inList = true;
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
        continue;
      }

      if (inList && !trimmed.startsWith('- ') && !/^\d+\.\s/.test(trimmed) && trimmed !== '') {
        flushList(listItems, content);
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        flushList(listItems, content);
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 8, 0, 8] });
        continue;
      }

      // Regular paragraph
      if (trimmed) {
        const formatted = parseInlineFormatting(trimmed);
        if (Array.isArray(formatted) && formatted.length > 1) {
          content.push({ stack: formatted, style: 'body' });
        } else {
          content.push({ text: formatted as string, style: 'body' });
        }
      }
    }

    flushList(listItems, content);
    return content;
  };

  const flushList = (items: string[], content: any[]) => {
    if (items.length > 0) {
      content.push({
        ul: items.map(item => parseInlineFormatting(item)),
        style: 'listItem',
        margin: [20, 0, 0, 8],
      });
      items.length = 0;
    }
  };

  const parseInlineFormatting = (text: string): any => {
    const parts: any[] = [];
    let remaining = text;
    const regex = /(\*\*.+?\*\*|\*.+?\*|`.+?`|\[.+?\]\(.+?\))/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const matched = match[0];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        parts.push({ text: matched.slice(2, -2), bold: true });
      } else if (matched.startsWith('*') && matched.endsWith('*')) {
        parts.push({ text: matched.slice(1, -1), italics: true });
      } else if (matched.startsWith('`') && matched.endsWith('`')) {
        parts.push({ text: matched.slice(1, -1), style: 'code' });
      } else if (matched.startsWith('[') && matched.includes('](')) {
        const linkMatch = matched.match(/\[(.+?)\]\((.+?)\)/);
        if (linkMatch) {
          parts.push({ text: linkMatch[1], style: 'link', link: linkMatch[2] });
        }
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? (parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts) : text;
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={generatePDF}
          disabled={isGenerating || !markdown.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
        </button>
        {error && <span className="text-red-500 mt-1">{error}</span>}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b font-semibold">Preview</div>
        <div 
          ref={previewRef}
          className="p-4 max-h-96 overflow-auto prose prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}