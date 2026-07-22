import React from 'react';

/**
 * Render formatted inline elements (**bold**, *italic*, `code`)
 */
const renderFormattedInline = (text) => {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldIndex = remaining.indexOf('**');
    // Check for inline code `text`
    const codeIndex = remaining.indexOf('`');
    // Check for italic *text* (must not be part of **)
    let italicIndex = -1;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] === '*' && remaining[i - 1] !== '*' && remaining[i + 1] !== '*') {
        italicIndex = i;
        break;
      }
    }

    let minIndex = Infinity;
    let type = null;

    if (boldIndex !== -1 && boldIndex < minIndex) {
      minIndex = boldIndex;
      type = 'bold';
    }
    if (codeIndex !== -1 && codeIndex < minIndex) {
      minIndex = codeIndex;
      type = 'code';
    }
    if (italicIndex !== -1 && italicIndex < minIndex) {
      minIndex = italicIndex;
      type = 'italic';
    }

    if (type === 'bold') {
      const endBold = remaining.indexOf('**', minIndex + 2);
      if (endBold !== -1) {
        if (minIndex > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, minIndex)}</span>);
        }
        const innerText = remaining.slice(minIndex + 2, endBold);
        parts.push(
          <strong key={key++} className="font-extrabold text-slate-900 dark:text-slate-100">
            {innerText}
          </strong>
        );
        remaining = remaining.slice(endBold + 2);
        continue;
      }
    }

    if (type === 'code') {
      const endCode = remaining.indexOf('`', minIndex + 1);
      if (endCode !== -1) {
        if (minIndex > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, minIndex)}</span>);
        }
        const innerText = remaining.slice(minIndex + 1, endCode);
        parts.push(
          <code
            key={key++}
            className="bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-mono px-1.5 py-0.5 rounded text-[0.85em] border border-slate-200 dark:border-slate-700"
          >
            {innerText}
          </code>
        );
        remaining = remaining.slice(endCode + 1);
        continue;
      }
    }

    if (type === 'italic') {
      const endItalic = remaining.indexOf('*', minIndex + 1);
      if (endItalic !== -1 && remaining[endItalic + 1] !== '*') {
        if (minIndex > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, minIndex)}</span>);
        }
        const innerText = remaining.slice(minIndex + 1, endItalic);
        parts.push(
          <em key={key++} className="italic">
            {innerText}
          </em>
        );
        remaining = remaining.slice(endItalic + 1);
        continue;
      }
    }

    // No valid formatting syntax found
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
};

/**
 * Beautiful, Lightweight Markdown Renderer for Lessons and Books
 */
export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;

  const blocks = [];
  const lines = content.split('\n');
  let currentCodeBlock = null;
  let currentList = null;

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();

    // 1. Code blocks (``` language)
    if (trimmed.startsWith('```')) {
      if (currentCodeBlock !== null) {
        blocks.push({ type: 'code', content: currentCodeBlock.join('\n') });
        currentCodeBlock = null;
      } else {
        if (currentList) {
          blocks.push({ type: 'list', items: currentList });
          currentList = null;
        }
        currentCodeBlock = [];
      }
      return;
    }

    if (currentCodeBlock !== null) {
      currentCodeBlock.push(rawLine);
      return;
    }

    // 2. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('# ')) {
      if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
      return;
    }
    if (trimmed.startsWith('## ')) {
      if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      return;
    }
    if (trimmed.startsWith('### ')) {
      if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      return;
    }
    if (trimmed.startsWith('#### ')) {
      if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
      blocks.push({ type: 'h4', text: trimmed.slice(5).trim() });
      return;
    }

    // 3. Unordered Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2).trim();
      if (!currentList) currentList = [];
      currentList.push(itemText);
      return;
    } else if (currentList && trimmed === '') {
      blocks.push({ type: 'list', items: currentList });
      currentList = null;
      return;
    } else if (currentList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
      blocks.push({ type: 'list', items: currentList });
      currentList = null;
    }

    // 4. Empty line
    if (trimmed === '') return;

    // 5. Paragraph
    blocks.push({ type: 'p', text: trimmed });
  });

  if (currentCodeBlock !== null) {
    blocks.push({ type: 'code', content: currentCodeBlock.join('\n') });
  }
  if (currentList !== null) {
    blocks.push({ type: 'list', items: currentList });
  }

  return (
    <div className={`space-y-4 text-slate-800 dark:text-slate-200 ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={i} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-5 mb-3 tracking-tight">
                {renderFormattedInline(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={i} className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-5 mb-2 tracking-tight">
                {renderFormattedInline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="text-base sm:text-lg font-black text-slate-850 dark:text-slate-100 mt-4 mb-1.5">
                {renderFormattedInline(block.text)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={i} className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                {renderFormattedInline(block.text)}
              </h4>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                {block.items.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{renderFormattedInline(item)}</li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={i} className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono my-3 overflow-x-auto border-2 border-slate-900 shadow-inner">
                <code>{block.content}</code>
              </pre>
            );
          case 'p':
          default:
            return (
              <p key={i} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                {renderFormattedInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
