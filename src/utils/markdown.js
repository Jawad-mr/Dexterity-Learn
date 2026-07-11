/* =========================================================================
   LIGHTWEIGHT MARKDOWN PARSER FOR REACT RENDERING
   ========================================================================= */

/**
 * Parses markdown string into structured blocks that React can render.
 * @param {string} md 
 * @returns {Array<object>}
 */
export function parseMarkdown(md) {
  if (!md) return [];
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading 1
    if (line.startsWith("# ")) {
      blocks.push({ type: 'heading', level: 1, text: line.substring(2).trim() });
      i++;
      continue;
    }
    // Heading 2
    if (line.startsWith("## ")) {
      blocks.push({ type: 'heading', level: 2, text: line.substring(3).trim() });
      i++;
      continue;
    }
    // Heading 3
    if (line.startsWith("### ")) {
      blocks.push({ type: 'heading', level: 3, text: line.substring(4).trim() });
      i++;
      continue;
    }

    // Images
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] });
      i++;
      continue;
    }

    // Callout Containers (:::tip, :::example, :::try)
    if (line.startsWith(":::")) {
      const calloutType = line.substring(3).trim(); // tip, example, try
      i++;
      const bodyLines = [];
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        bodyLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::

      const inner = bodyLines.join("\n");
      const codeMatch = inner.match(/```(\w+)?\n([\s\S]*?)```/);
      const textOnly = inner.replace(/```[\s\S]*?```/g, "").trim();

      let codeBlock = null;
      if (codeMatch) {
        codeBlock = { lang: codeMatch[1] || "", code: codeMatch[2] };
      }

      blocks.push({
        type: 'callout',
        calloutType, // 'tip', 'example', 'try'
        text: textOnly,
        codeBlock
      });
      continue;
    }

    // Standard fenced code blocks outside callouts
    if (line.startsWith("```")) {
      const lang = line.substring(3).trim();
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', lang, code: codeLines.join("\n") });
      continue;
    }

    // Bullet Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [line.substring(2).trim()];
      i++;
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].substring(2).trim());
        i++;
      }
      blocks.push({ type: 'list', items, ordered: false });
      continue;
    }

    // Numbered Lists
    if (/^\d+\.\s/.test(line)) {
      const items = [line.replace(/^\d+\.\s/, "").trim()];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, "").trim());
        i++;
      }
      blocks.push({ type: 'list', items, ordered: true });
      continue;
    }

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(":::") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("* ") &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^!\[/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: para.join(" ") });
  }

  return blocks;
}

/**
 * Parses inline elements like bold, inline code, and links to safe HTML strings.
 * @param {string} text 
 * @returns {string} Safe HTML string
 */
export function parseInlineMarkdown(text) {
  if (!text) return "";
  
  // Escaping basic HTML tags for safety
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold text: **word**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline code: `code`
  html = html.replace(/`([^`]+?)`/g, '<code class="inline">$1</code>');

  // Hyperlinks: [label](href)
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--teal-accent); border-bottom: 1.5px dashed var(--teal-accent);">$1</a>'
  );

  return html;
}
