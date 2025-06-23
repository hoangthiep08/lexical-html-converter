import { TextFormatFlags } from '../types/converter';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function parseTextFormat(format: number): TextFormatFlags {
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

export function buildAttributes(attrs: Record<string, string | number | boolean | null | undefined>): string {
  const validAttrs = Object.entries(attrs)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
    .join(' ');
  
  return validAttrs ? ` ${validAttrs}` : '';
}

export function wrapWithTag(
  tag: string, 
  content: string, 
  attributes: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const attrs = buildAttributes(attributes);
  return `<${tag}${attrs}>${content}</${tag}>`;
}

export function createSelfClosingTag(
  tag: string, 
  attributes: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const attrs = buildAttributes(attributes);
  return `<${tag}${attrs}/>`;
}

export function applyTextFormatting(text: string, format: number, style?: string): string {
  const flags = parseTextFormat(format);
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

export function sanitizeStyle(style: string): string {
  // Basic CSS sanitization
  return style
    .replace(/javascript:/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/url\(/gi, '')
    .replace(/@import/gi, '');
}

export function generateDocumentWrapper(content: string, title: string = 'Lexical Converted Content'): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .lexical-content { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 16px 0;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        blockquote {
            margin: 16px 0;
            padding: 12px 16px;
            border-left: 4px solid #ddd;
            background-color: #f9f9f9;
        }
        .poll { 
            border: 1px solid #ccc; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 16px 0;
            background-color: #f9f9f9;
        }
        .layout-container { 
            display: grid; 
            gap: 20px; 
            margin: 16px 0;
        }
        details {
            margin: 16px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        summary {
            padding: 12px;
            background-color: #f5f5f5;
            cursor: pointer;
            font-weight: bold;
        }
        details[open] summary {
            border-bottom: 1px solid #ddd;
        }
        .details-content {
            padding: 12px;
        }
        .page-break {
            page-break-before: always;
            border-top: 2px dashed #ccc;
            margin: 20px 0;
            padding-top: 20px;
        }
        pre {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        .hashtag {
            color: #1d9bf0;
            text-decoration: none;
        }
        .hashtag:hover {
            text-decoration: underline;
        }
        .equation {
            font-family: 'Times New Roman', serif;
            font-style: italic;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        .image-caption {
            font-size: 0.9em;
            color: #666;
            text-align: center;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="lexical-content">
        ${content}
    </div>
</body>
</html>`;
} 