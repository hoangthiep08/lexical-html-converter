const fs = require('fs');

// Simple HTML utilities
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function parseTextFormat(format) {
  return {
    bold: (format & 1) !== 0,
    italic: (format & 2) !== 0,
    strikethrough: (format & 4) !== 0,
    underline: (format & 8) !== 0,
    code: (format & 16) !== 0,
    subscript: (format & 32) !== 0,
    superscript: (format & 64) !== 0,
  };
}

function wrapWithTag(tag, content, attributes = {}) {
  const attrs = Object.entries(attributes)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
    .join(' ');
  
  const attrString = attrs ? ` ${attrs}` : '';
  return `<${tag}${attrString}>${content}</${tag}>`;
}

function createSelfClosingTag(tag, attributes = {}) {
  const attrs = Object.entries(attributes)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
    .join(' ');
  
  const attrString = attrs ? ` ${attrs}` : '';
  return `<${tag}${attrString}/>`;
}

function applyTextFormatting(text, format, style) {
  const flags = parseTextFormat(format || 0);
  let result = escapeHtml(text);
  
  if (flags.code) {
    result = wrapWithTag('code', result);
  }
  
  if (flags.bold) {
    result = wrapWithTag('strong', result);
  }
  
  if (flags.italic) {
    result = wrapWithTag('em', result);
  }
  
  if (flags.underline) {
    result = wrapWithTag('u', result);
  }
  
  if (flags.strikethrough) {
    result = wrapWithTag('s', result);
  }
  
  if (flags.subscript) {
    result = wrapWithTag('sub', result);
  }
  
  if (flags.superscript) {
    result = wrapWithTag('sup', result);
  }
  
  if (style) {
    result = wrapWithTag('span', result, { style });
  }
  
  return result;
}

// Excalidraw to SVG Renderer
function renderExcalidrawToSVG(excalidrawData) {
  try {
    const data = typeof excalidrawData === 'string' ? JSON.parse(excalidrawData) : excalidrawData;
    const { elements, appState } = data;
    
    if (!elements || elements.length === 0) {
      return '<div class="excalidraw-empty">No drawing elements found</div>';
    }
    
    // Calculate bounds
    const bounds = calculateBounds(elements);
    const width = Math.max(bounds.maxX - bounds.minX + 40, 200);
    const height = Math.max(bounds.maxY - bounds.minY + 40, 150);
    
    // Create SVG
    let svg = `<svg width="${width}" height="${height}" viewBox="${bounds.minX - 20} ${bounds.minY - 20} ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd; border-radius: 8px; background: white;">`;
    
    // Add background if specified
    if (appState && appState.viewBackgroundColor && appState.viewBackgroundColor !== '#ffffff') {
      svg += `<rect x="${bounds.minX - 20}" y="${bounds.minY - 20}" width="${width}" height="${height}" fill="${appState.viewBackgroundColor}"/>`;
    }
    
    // Render each element
    elements.forEach(element => {
      if (element.isDeleted) return;
      svg += renderElement(element);
    });
    
    svg += '</svg>';
    
    return `<div class="excalidraw-container">
      <div class="excalidraw-drawing">
        ${svg}
      </div>
    </div>`;
    
  } catch (error) {
    console.error('Error rendering Excalidraw:', error);
    return `<div class="excalidraw-error">
      <p>❌ Error rendering Excalidraw drawing: ${error.message}</p>
    </div>`;
  }
}

function calculateBounds(elements) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  elements.forEach(element => {
    if (element.isDeleted) return;
    
    const { x, y, width, height } = element;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + (width || 0));
    maxY = Math.max(maxY, y + (height || 0));
    
    // Handle freedraw points
    if (element.type === 'freedraw' && element.points) {
      element.points.forEach(point => {
        const px = x + point[0];
        const py = y + point[1];
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });
    }
  });
  
  return { minX, minY, maxX, maxY };
}

function renderElement(element) {
  const { type } = element;
  
  switch (type) {
    case 'rectangle':
      return renderRectangle(element);
    case 'ellipse':
      return renderEllipse(element);
    case 'diamond':
      return renderDiamond(element);
    case 'arrow':
      return renderArrow(element);
    case 'line':
      return renderLine(element);
    case 'freedraw':
      return renderFreedraw(element);
    case 'text':
      return renderText(element);
    default:
      return `<!-- Unknown element type: ${type} -->`;
  }
}

function renderRectangle(element) {
  const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, opacity, roundness } = element;
  
  const strokeStyle = `stroke="${strokeColor || '#000000'}" stroke-width="${strokeWidth || 1}" fill="${backgroundColor || 'transparent'}" opacity="${(opacity || 100) / 100}"`;
  
  if (roundness && roundness.type === 3) {
    // Rounded rectangle
    const radius = Math.min(width, height) * 0.1;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" ${strokeStyle}/>`;
  } else {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${strokeStyle}/>`;
  }
}

function renderEllipse(element) {
  const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, opacity } = element;
  
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  
  const strokeStyle = `stroke="${strokeColor || '#000000'}" stroke-width="${strokeWidth || 1}" fill="${backgroundColor || 'transparent'}" opacity="${(opacity || 100) / 100}"`;
  
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${strokeStyle}/>`;
}

function renderDiamond(element) {
  const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, opacity } = element;
  
  const cx = x + width / 2;
  const cy = y + height / 2;
  const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
  
  const strokeStyle = `stroke="${strokeColor || '#000000'}" stroke-width="${strokeWidth || 1}" fill="${backgroundColor || 'transparent'}" opacity="${(opacity || 100) / 100}"`;
  
  return `<polygon points="${points}" ${strokeStyle}/>`;
}

function renderLine(element) {
  const { x, y, points, strokeColor, strokeWidth, opacity } = element;
  
  if (!points || points.length < 2) return '';
  
  const strokeStyle = `stroke="${strokeColor || '#000000'}" stroke-width="${strokeWidth || 1}" fill="none" opacity="${(opacity || 100) / 100}"`;
  
  const [startPoint, endPoint] = points;
  const x1 = x + startPoint[0];
  const y1 = y + startPoint[1];
  const x2 = x + endPoint[0];
  const y2 = y + endPoint[1];
  
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${strokeStyle}/>`;
}

function renderArrow(element) {
  // Simplified arrow rendering - treat as line for now
  return renderLine(element);
}

function renderFreedraw(element) {
  const { x, y, points, strokeColor, strokeWidth, opacity } = element;
  
  if (!points || points.length === 0) return '';
  
  const strokeStyle = `stroke="${strokeColor || '#000000'}" stroke-width="${strokeWidth || 1}" fill="none" opacity="${(opacity || 100) / 100}" stroke-linecap="round" stroke-linejoin="round"`;
  
  let pathData = '';
  points.forEach((point, index) => {
    const px = x + point[0];
    const py = y + point[1];
    
    if (index === 0) {
      pathData += `M ${px} ${py}`;
    } else {
      pathData += ` L ${px} ${py}`;
    }
  });
  
  return `<path d="${pathData}" ${strokeStyle}/>`;
}

function renderText(element) {
  const { x, y, text, fontSize, fontFamily, strokeColor, opacity } = element;
  
  const textStyle = `fill="${strokeColor || '#000000'}" font-size="${fontSize || 16}" font-family="${fontFamily || 'Arial'}" opacity="${(opacity || 100) / 100}"`;
  
  return `<text x="${x}" y="${y + (fontSize || 16)}" ${textStyle}>${escapeHtml(text || '')}</text>`;
}

// Simple converter class
class LexicalToHtmlConverter {
  constructor() {
    this.nodeCount = 0;
    this.errors = [];
  }

  convert(lexicalDoc) {
    this.nodeCount = 0;
    this.errors = [];
    
    const content = this.convertNode(lexicalDoc.editorState.root);
    return this.generateDocumentWrapper(content);
  }

  convertNode(node) {
    this.nodeCount++;
    
    if (!node || !node.type) {
      return '';
    }

    try {
      switch (node.type) {
        case 'root':
          return this.convertChildren(node);
        case 'paragraph':
          return this.convertParagraph(node);
        case 'heading':
          return this.convertHeading(node);
        case 'text':
          return this.convertText(node);
        case 'linebreak':
          return '<br/>';
        case 'quote':
          return this.convertQuote(node);
        case 'list':
          return this.convertList(node);
        case 'listitem':
          return this.convertListItem(node);
        case 'link':
          return this.convertLink(node);
        case 'hashtag':
          return this.convertHashtag(node);
        case 'table':
          return this.convertTable(node);
        case 'tablerow':
          return this.convertTableRow(node);
        case 'tablecell':
          return this.convertTableCell(node);
        case 'image':
          return this.convertImage(node);
        case 'inline-image':
          return this.convertInlineImage(node);
        case 'equation':
          return this.convertEquation(node);
        case 'code':
          return this.convertCode(node);
        case 'code-highlight':
          return this.convertCodeHighlight(node);
        case 'collapsible-container':
          return this.convertCollapsibleContainer(node);
        case 'collapsible-title':
          return this.convertCollapsibleTitle(node);
        case 'collapsible-content':
          return this.convertCollapsibleContent(node);
        case 'poll':
          return this.convertPoll(node);
        case 'layout-container':
          return this.convertLayoutContainer(node);
        case 'layout-item':
          return this.convertLayoutItem(node);
        case 'page-break':
          return this.convertPageBreak(node);
        case 'excalidraw':
          return this.convertExcalidraw(node);
        default:
          this.errors.push(`Unknown node type: ${node.type}`);
          return this.convertChildren(node);
      }
    } catch (error) {
      this.errors.push(`Error converting ${node.type}: ${error.message}`);
      return `<!-- Error converting ${node.type} -->`;
    }
  }

  convertChildren(node) {
    if (!node.children || !Array.isArray(node.children)) {
      return '';
    }
    
    return node.children
      .map(child => this.convertNode(child))
      .join('');
  }

  convertParagraph(node) {
    // Split children by linebreaks to create separate elements
    if (!node.children || !Array.isArray(node.children)) {
      return wrapWithTag('p', '');
    }
    
    const groups = [];
    let currentGroup = [];
    
    node.children.forEach(child => {
      if (child.type === 'linebreak') {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
      } else {
        currentGroup.push(child);
      }
    });
    
    // Add the last group if it has content
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    // If no groups, return empty paragraph
    if (groups.length === 0) {
      const pAttributes = {};
      
      // Handle text alignment (only for paragraph)
      if (node.format) {
        const alignmentMap = {
          'left': 'left',
          'center': 'center', 
          'right': 'right',
          'justify': 'justify'
        };
        
        if (alignmentMap[node.format]) {
          pAttributes.style = `text-align: ${alignmentMap[node.format]}`;
        }
      }
      
      // Handle direction
      if (node.direction && node.direction !== 'ltr') {
        pAttributes.dir = node.direction;
      }
      
      // Empty paragraph - no need for span wrapper
      return wrapWithTag('p', '', pAttributes);
    }
    
    // Convert each group to a separate paragraph
    return groups.map(group => {
      const pAttributes = {};
      
      // Handle text alignment (only for paragraph)
      if (node.format) {
        const alignmentMap = {
          'left': 'left',
          'center': 'center', 
          'right': 'right',
          'justify': 'justify'
        };
        
        if (alignmentMap[node.format]) {
          pAttributes.style = `text-align: ${alignmentMap[node.format]}`;
        }
      }
      
      // Handle direction
      if (node.direction && node.direction !== 'ltr') {
        pAttributes.dir = node.direction;
      }
      
      // Convert children with inheritance of textStyle
      const groupContent = group.map(child => {
        // If child has its own style, use it directly
        if (child.style) {
          return this.convertNode(child);
        }
        // If child has no style but paragraph has textStyle, inherit it
        else if (node.textStyle) {
          const childWithInheritedStyle = { ...child, style: node.textStyle };
          return this.convertNode(childWithInheritedStyle);
        }
        // Otherwise, convert normally
        else {
          return this.convertNode(child);
        }
      }).join('');
      
      return wrapWithTag('p', groupContent, pAttributes);
    }).join('');
  }

  convertHeading(node) {
    const content = this.convertChildren(node);
    const tag = node.tag || 'h1';
    return wrapWithTag(tag, content);
  }

  convertText(node) {
    if (!node.text) return '';
    
    const format = node.format || 0;
    const style = node.style || undefined;
    
    return applyTextFormatting(node.text, format, style);
  }

  convertQuote(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('blockquote', content);
  }

  convertList(node) {
    const content = this.convertChildren(node);
    const tag = node.tag || 'ul';
    const attributes = {};
    
    if (node.start && node.start !== 1 && tag === 'ol') {
      attributes.start = node.start;
    }
    
    if (node.listType === 'check') {
      attributes.class = 'checklist';
    }
    
    return wrapWithTag(tag, content, attributes);
  }

  convertListItem(node) {
    const content = this.convertChildren(node);
    const attributes = {};
    
    if (node.value) {
      attributes.value = node.value;
    }
    
    // Handle checkbox list items
    if (node.hasOwnProperty('checked')) {
      const checkbox = createSelfClosingTag('input', {
        type: 'checkbox',
        checked: node.checked ? 'checked' : undefined,
        disabled: 'disabled'
      });
      return wrapWithTag('li', checkbox + ' ' + content, attributes);
    }
    
    return wrapWithTag('li', content, attributes);
  }

  convertLink(node) {
    const content = this.convertChildren(node);
    const attributes = {
      href: node.url
    };
    
    if (node.target && node.target !== '_self') {
      attributes.target = node.target;
    }
    
    if (node.rel) {
      attributes.rel = node.rel;
    }
    
    if (node.title) {
      attributes.title = node.title;
    }
    
    return wrapWithTag('a', content, attributes);
  }

  convertHashtag(node) {
    const text = node.text || '';
    return wrapWithTag('span', escapeHtml(text), { class: 'hashtag' });
  }

  convertTable(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('table', content);
  }

  convertTableRow(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('tr', content);
  }

  convertTableCell(node) {
    const content = this.convertChildren(node);
    const tag = node.headerState === 1 ? 'th' : 'td';
    const attributes = {};
    
    if (node.colSpan && node.colSpan > 1) {
      attributes.colspan = node.colSpan;
    }
    
    if (node.rowSpan && node.rowSpan > 1) {
      attributes.rowspan = node.rowSpan;
    }
    
    if (node.backgroundColor) {
      attributes.style = `background-color: ${node.backgroundColor}`;
    }
    
    return wrapWithTag(tag, content, attributes);
  }

  convertImage(node) {
    const attributes = {
      src: node.src,
      alt: node.altText || ''
    };
    
    if (node.width) {
      attributes.width = node.width;
    }
    
    if (node.height) {
      attributes.height = node.height;
    }
    
    if (node.maxWidth) {
      attributes.style = `max-width: ${node.maxWidth}px`;
    }
    
    let result = createSelfClosingTag('img', attributes);
    
    // Add caption if present
    if (node.caption && node.showCaption) {
      const captionContent = typeof node.caption === 'object' 
        ? this.convertNode(node.caption)
        : escapeHtml(String(node.caption));
      result += wrapWithTag('div', captionContent, { class: 'image-caption' });
    }
    
    return wrapWithTag('figure', result);
  }

  convertInlineImage(node) {
    const attributes = {
      src: node.src,
      alt: node.altText || '',
      style: 'display: inline-block; vertical-align: middle;'
    };
    
    if (node.width) {
      attributes.width = node.width;
    }
    
    if (node.height) {
      attributes.height = node.height;
    }
    
    return createSelfClosingTag('img', attributes);
  }

  convertEquation(node) {
    const equation = escapeHtml(node.equation || '');
    const attributes = { class: 'equation' };
    
    if (node.inline) {
      return wrapWithTag('span', equation, attributes);
    } else {
      return wrapWithTag('div', equation, attributes);
    }
  }

  convertCode(node) {
    const content = this.convertChildren(node);
    
    // Better line counting: count both <br/> tags and actual content lines
    let lines = content.split('<br/>');
    
    // If content doesn't have <br/> tags, try to count by actual line breaks in text
    if (lines.length === 1 && content.includes('\n')) {
      lines = content.split('\n');
    }
    
    // Filter out empty lines at the end but keep empty lines in the middle
    while (lines.length > 1 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    
    // Ensure minimum 1 line
    const lineCount = Math.max(lines.length, 1);
    
    // Process content to wrap each line properly
    const wrappedContent = lines
      .map((line, index) => {
        const lineNum = index + 1;
        if (line.trim() === '') {
          return `<span class="code-line" data-line="${lineNum}"><br/></span>`;
        } else {
          return `<span class="code-line" data-line="${lineNum}">${line}</span>`;
        }
      })
      .join('');
    
    // Generate line numbers with click handlers
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => 
      `<div class="line-number" data-line="${i + 1}" onclick="toggleLineHighlight(this)">${i + 1}</div>`
    ).join('');
    
    // Create unique ID for this code block
    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
    
    // Create code block with controls
    const codeAttributes = {};
    const blockAttributes = { 
      class: 'code-block',
      id: codeId
    };
    
    if (node.language) {
      codeAttributes.class = `language-${node.language}`;
      blockAttributes['data-language'] = node.language;
    }
    
    // Create controls
    const controls = `
      <div class="code-controls">
        <button class="code-btn copy-btn" onclick="copyCode('${codeId}')" title="Copy code">
          ⧉ Copy
        </button>
        <button class="code-btn fold-btn" onclick="toggleCodeFold('${codeId}')" title="Fold/Unfold code">
          ⊟ Fold
        </button>
      </div>
    `;
    
    // Create header for collapsed state
    const language = node.language || 'code';
    const header = `<div class="code-header">${language.toUpperCase()} (${lineCount} lines)</div>`;
    
    const codeContent = wrapWithTag('pre', wrapWithTag('code', wrappedContent, codeAttributes));
    
    const lineNumbersDiv = wrapWithTag('div', lineNumbers, { class: 'code-line-numbers' });
    const contentDiv = wrapWithTag('div', codeContent, { class: 'code-content' });
    
    return wrapWithTag('div', controls + header + lineNumbersDiv + contentDiv, blockAttributes);
  }

  convertCodeHighlight(node) {
    const text = escapeHtml(node.text || '');
    const attributes = {};
    
    if (node.highlightType) {
      attributes.class = `highlight-${node.highlightType}`;
    }
    
    return wrapWithTag('span', text, attributes);
  }

  convertCollapsibleContainer(node) {
    const content = this.convertChildren(node);
    const attributes = {};
    
    if (node.open) {
      attributes.open = 'open';
    }
    
    return wrapWithTag('details', content, attributes);
  }

  convertCollapsibleTitle(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('summary', content);
  }

  convertCollapsibleContent(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('div', content, { class: 'details-content' });
  }

  convertPoll(node) {
    const pollData = node.$ || node;
    const question = escapeHtml(pollData.question || '');
    const options = pollData.options || [];
    
    let content = wrapWithTag('h4', question);
    
    if (options.length > 0) {
      const optionsList = options
        .map((option, index) => {
          const optionText = escapeHtml(option.text || `Option ${index + 1}`);
          const voteCount = option.votes ? option.votes.length : 0;
          return wrapWithTag('li', `${optionText} (${voteCount} votes)`);
        })
        .join('');
      
      content += wrapWithTag('ul', optionsList);
    }
    
    return wrapWithTag('div', content, { class: 'poll' });
  }

  convertLayoutContainer(node) {
    const content = this.convertChildren(node);
    const attributes = { class: 'layout-container' };
    
    if (node.templateColumns) {
      attributes.style = `grid-template-columns: ${node.templateColumns}`;
    }
    
    return wrapWithTag('div', content, attributes);
  }

  convertLayoutItem(node) {
    const content = this.convertChildren(node);
    return wrapWithTag('div', content, { class: 'layout-item' });
  }

  convertPageBreak(node) {
    return wrapWithTag('div', '', { class: 'page-break' });
  }

  convertExcalidraw(node) {
    // Use the new SVG renderer
    const data = node.data || '';
    return renderExcalidrawToSVG(data);
  }

  generateDocumentWrapper(content) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lexical Converted Content</title>
    <link rel="stylesheet" href="styles/lexical-content.css">
</head>
<body>
    <div class="lexical-content">
        ${content}
    </div>
    
    <script>
// Copy code functionality
function copyCode(codeId) {
  const codeBlock = document.getElementById(codeId);
  const codeContent = codeBlock.querySelector('pre code');
  const text = codeContent.innerText || codeContent.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = codeBlock.querySelector('.copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✓ Copied';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const copyBtn = codeBlock.querySelector('.copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✓ Copied';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}

// Toggle code fold functionality
function toggleCodeFold(codeId) {
  const codeBlock = document.getElementById(codeId);
  const foldBtn = codeBlock.querySelector('.fold-btn');
  
  if (codeBlock.classList.contains('collapsed')) {
    codeBlock.classList.remove('collapsed');
    foldBtn.innerHTML = '⊟ Fold';
    foldBtn.title = 'Fold code';
  } else {
    codeBlock.classList.add('collapsed');
    foldBtn.innerHTML = '⊞ Unfold';
    foldBtn.title = 'Unfold code';
  }
}

// Toggle line highlighting
function toggleLineHighlight(lineElement) {
  const lineNumber = lineElement.getAttribute('data-line');
  const codeBlock = lineElement.closest('.code-block');
  const codeLine = codeBlock.querySelector(\`.code-line[data-line="\${lineNumber}"]\`);
  
  // Toggle line number highlight
  lineElement.classList.toggle('highlighted');
  
  // Toggle code line highlight
  if (codeLine) {
    codeLine.classList.toggle('highlighted');
  }
}

// Initialize code blocks on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + C on focused code block
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const activeElement = document.activeElement;
      const codeBlock = activeElement.closest('.code-block');
      if (codeBlock) {
        e.preventDefault();
        copyCode(codeBlock.id);
      }
    }
    
    // Ctrl/Cmd + F on focused code block to fold
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      const activeElement = document.activeElement;
      const codeBlock = activeElement.closest('.code-block');
      if (codeBlock) {
        e.preventDefault();
        toggleCodeFold(codeBlock.id);
      }
    }
  });
  
  // Make code blocks focusable
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    block.setAttribute('tabindex', '0');
    block.style.outline = 'none';
    
    // Add focus styling
    block.addEventListener('focus', function() {
      this.style.boxShadow = '0 0 0 2px #0366d6';
    });
    
    block.addEventListener('blur', function() {
      this.style.boxShadow = 'none';
    });
  });
});
    </script>
</body>
</html>`;
  }
}

// CLI functionality
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node convert.js <input.json> <output.html>');
    console.log('Example: node convert.js format-lexical-complete.json converted-output.html');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file '${inputFile}' not found`);
      process.exit(1);
    }
    
    console.log(`🔄 Converting ${inputFile} to ${outputFile}...`);
    
    // Read and parse JSON
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    const lexicalDoc = JSON.parse(jsonContent);
    
    // Convert to HTML
    const converter = new LexicalToHtmlConverter();
    const html = converter.convert(lexicalDoc);
    
    // Write output
    fs.writeFileSync(outputFile, html, 'utf8');
    
    console.log(`✅ Conversion completed!`);
    console.log(`📊 Stats:`);
    console.log(`   - Nodes processed: ${converter.nodeCount}`);
    console.log(`   - Errors: ${converter.errors.length}`);
    
    if (converter.errors.length > 0) {
      console.log(`⚠️  Errors encountered:`);
      converter.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log(`📄 Output saved to: ${outputFile}`);
    console.log(`🎨 Excalidraw drawings are now rendered as SVG!`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { LexicalToHtmlConverter }; 