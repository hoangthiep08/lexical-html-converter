// Browser-compatible version of Lexical HTML Converter
(function(global) {
  'use strict';

  // Import the converter logic (will be embedded)
  // This is a simplified browser version
  
  class LexicalConverter {
    constructor() {
      this.cssContent = this.getDefaultCSS();
    }

    /**
     * CSS mặc định cho browser
     */
    getDefaultCSS() {
      return `
.lexical-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.lexical-content h1, .lexical-content h2, .lexical-content h3,
.lexical-content h4, .lexical-content h5, .lexical-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.lexical-content h1 { font-size: 2em; }
.lexical-content h2 { font-size: 1.5em; }
.lexical-content h3 { font-size: 1.25em; }

.lexical-content p {
  margin: 16px 0;
}

.lexical-content ul, .lexical-content ol {
  margin: 16px 0;
  padding-left: 32px;
}

.lexical-content .checklist {
  list-style: none;
  padding-left: 0;
}

.lexical-content li input[type="checkbox"] {
  margin-right: 8px;
  border: 2px solid #999;
  width: 16px;
  height: 16px;
  cursor: pointer;
  border-radius: 3px;
  background: white;
}

.lexical-content li input[type="checkbox"]:checked {
  background: #007acc;
  border-color: #007acc;
}

.lexical-content a {
  color: #007acc;
  text-decoration: none;
}

.lexical-content a:hover {
  text-decoration: underline;
}

.lexical-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  border: 1px solid #ddd;
}

.lexical-content th, .lexical-content td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: left;
}

.lexical-content th {
  background: #f8f9fa;
  font-weight: 600;
}

.lexical-content img {
  max-width: 100%;
  height: auto;
}

.lexical-content blockquote {
  margin: 15px 0;
  padding: 10px 20px;
  border-left: 4px solid #ddd;
  background: #f9f9f9;
  font-style: italic;
}

.lexical-content code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.lexical-content pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
  margin: 15px 0;
}

/* Code block styles */
.code-block {
  position: relative;
  margin: 20px 0;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
  background: #f6f8fa;
}

.code-header {
  background: #24292e;
  color: #fff;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.code-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.code-btn:hover {
  background: rgba(255,255,255,0.2);
}

.code-content {
  display: flex;
  background: #fff;
}

.code-line-numbers {
  background: #f6f8fa;
  border-right: 1px solid #e1e4e8;
  padding: 16px 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #6a737d;
  user-select: none;
  min-width: 40px;
}

.line-number {
  height: 20px;
  line-height: 20px;
  text-align: right;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 3px;
}

.line-number:hover {
  background: #e1e4e8;
}

.line-number.highlighted {
  background: #fff5b4;
  color: #24292e;
}

.code-content pre {
  margin: 0;
  padding: 16px;
  background: transparent;
  border: none;
  flex: 1;
  overflow-x: auto;
}

.code-content code {
  background: transparent;
  padding: 0;
  font-size: 12px;
  line-height: 20px;
}

.code-line {
  display: block;
  min-height: 20px;
  line-height: 20px;
}

/* Syntax highlighting */
.highlight-keyword { color: #d73a49; font-weight: 600; }
.highlight-string { color: #032f62; }
.highlight-comment { color: #6a737d; font-style: italic; }
.highlight-number { color: #005cc5; }
.highlight-function { color: #6f42c1; }
.highlight-operator { color: #d73a49; }
.highlight-punctuation { color: #24292e; }
.highlight-constant { color: #005cc5; font-weight: 600; }
.highlight-parameter { color: #e36209; }
.highlight-template-punctuation { color: #d73a49; }
.highlight-interpolation { color: #24292e; }
.highlight-interpolation-punctuation { color: #d73a49; }
`;
    }

    /**
     * Simplified convert method for browser
     */
    convert(lexicalData, options = {}) {
      try {
        // This is a simplified version - in real implementation, 
        // we would need to embed the full converter logic
        
        // For now, return a mock result to test the structure
        const html = this.convertLexicalToHTML(lexicalData);
        const css = this.cssContent;
        
        return {
          html: html,
          css: css,
          htmlWithCSS: `<style>${css}</style><div class="lexical-content">${html}</div>`
        };
      } catch (error) {
        throw new Error(`Conversion failed: ${error.message}`);
      }
    }

    /**
     * Convert Lexical JSON to HTML (simplified browser version)
     */
    convertLexicalToHTML(lexicalData) {
      if (!lexicalData || !lexicalData.editorState || !lexicalData.editorState.root) {
        return '<p>No content to display</p>';
      }

      const root = lexicalData.editorState.root;
      return this.convertNode(root);
    }

    /**
     * Convert a single node to HTML
     */
    convertNode(node) {
      if (!node) return '';

      let html = '';
      
      switch (node.type) {
        case 'root':
          if (node.children && Array.isArray(node.children)) {
            html = node.children.map(child => this.convertNode(child)).join('');
          }
          break;

        case 'paragraph':
          const pContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          
          let pStyle = '';
          if (node.format) {
            const alignments = { 1: 'left', 2: 'center', 3: 'right', 4: 'justify' };
            if (alignments[node.format]) {
              pStyle = ` style="text-align: ${alignments[node.format]}"`;
            }
          }
          
          html = `<p${pStyle}>${pContent}</p>`;
          break;

        case 'heading':
          const level = Math.min(Math.max(node.tag ? parseInt(node.tag.replace('h', '')) : 1, 1), 6);
          const hContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          html = `<h${level}>${hContent}</h${level}>`;
          break;

        case 'text':
          let textContent = node.text || '';
          let textStyle = '';
          
          // Apply text formatting
          if (node.format) {
            if (node.format & 1) textContent = `<strong>${textContent}</strong>`; // bold
            if (node.format & 2) textContent = `<em>${textContent}</em>`; // italic
            if (node.format & 8) textContent = `<s>${textContent}</s>`; // strikethrough
            if (node.format & 4) textContent = `<u>${textContent}</u>`; // underline
          }
          
          // Apply text style
          if (node.style) {
            textStyle = ` style="${node.style}"`;
          }
          
          html = textStyle ? `<span${textStyle}>${textContent}</span>` : textContent;
          break;

        case 'linebreak':
          html = '<br/>';
          break;

        case 'code':
          const codeContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          const language = node.language || 'text';
          html = `
            <div class="code-block">
              <div class="code-header">${language.toUpperCase()}</div>
              <div class="code-content">
                <pre><code class="language-${language}">${codeContent}</code></pre>
              </div>
            </div>
          `;
          break;

        case 'list':
          const listItems = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          const listTag = node.listType === 'number' ? 'ol' : 'ul';
          const listClass = node.listType === 'check' ? ' class="checklist"' : '';
          html = `<${listTag}${listClass}>${listItems}</${listTag}>`;
          break;

        case 'listitem':
          const itemContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          
          if (node.checked !== undefined) {
            const checked = node.checked ? 'checked' : '';
            html = `<li><input type="checkbox" ${checked} disabled> ${itemContent}</li>`;
          } else {
            html = `<li>${itemContent}</li>`;
          }
          break;

        case 'quote':
          const quoteContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          html = `<blockquote>${quoteContent}</blockquote>`;
          break;

        case 'link':
          const linkContent = node.children ? 
            node.children.map(child => this.convertNode(child)).join('') : '';
          const url = node.url || '#';
          html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkContent}</a>`;
          break;

        default:
          // For unknown node types, try to render children
          if (node.children && Array.isArray(node.children)) {
            html = node.children.map(child => this.convertNode(child)).join('');
          }
          break;
      }

      return html;
    }
  }

  // Export to global scope
  global.lexicalConverter = new LexicalConverter();
  
  // Also export the class for advanced usage
  global.LexicalConverter = LexicalConverter;

})(typeof window !== 'undefined' ? window : this); 