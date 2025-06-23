const { LexicalToHtmlConverter } = require('./convert');
const fs = require('fs');
const path = require('path');

/**
 * Class chính của thư viện Lexical HTML Converter
 */
class LexicalConverter {
  constructor() {
    this.converter = new LexicalToHtmlConverter();
    this.cssContent = this.loadCSS();
  }

  /**
   * Load CSS content từ file
   */
  loadCSS() {
    try {
      const cssPath = path.join(__dirname, 'styles/lexical-content.css');
      return fs.readFileSync(cssPath, 'utf8');
    } catch (error) {
      // Fallback CSS nếu không tìm thấy file
      return this.getDefaultCSS();
    }
  }

  /**
   * CSS mặc định nếu không load được từ file
   */
  getDefaultCSS() {
    return `
.lexical-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
  margin: 0;
  padding: 0;
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
`;
  }

  /**
   * Chuyển đổi Lexical JSON thành HTML với CSS
   * @param {Object} lexicalData - Lexical JSON data
   * @param {Object} options - Conversion options
   * @returns {Object} Result object with html, css, and htmlWithCSS
   */
  convert(lexicalData, options = {}) {
    const {
      includeCSS = true,
      cssPrefix = 'lexical-content',
      minifyCSS = false
    } = options;

    // Chuyển đổi JSON thành HTML (chỉ lấy content, bỏ wrapper)
    const fullHtml = this.converter.convert(lexicalData);
    
    // Extract content từ full HTML - sử dụng manual extraction để tránh vấn đề với nested divs
    let htmlContent = '';
    const startMarker = '<div class="lexical-content">';
    const endMarker = '</div>';
    const startIndex = fullHtml.indexOf(startMarker);
    if (startIndex !== -1) {
      const contentStart = startIndex + startMarker.length;
      // Find the matching closing div (last one before script)
      const scriptIndex = fullHtml.indexOf('<script>');
      const searchEnd = scriptIndex !== -1 ? scriptIndex : fullHtml.length;
      const contentEnd = fullHtml.lastIndexOf(endMarker, searchEnd);
      
      if (contentEnd > contentStart) {
        htmlContent = fullHtml.substring(contentStart, contentEnd).trim();
      }
    }
    
    // Xử lý CSS
    let css = this.cssContent;
    
    // Thay đổi prefix nếu cần
    if (cssPrefix !== 'lexical-content') {
      css = css.replace(/\.lexical-content/g, `.${cssPrefix}`);
    }
    
    // Minify CSS nếu cần
    if (minifyCSS) {
      css = this.minifyCSS(css);
    }

    // JavaScript cho interactive code blocks
    const interactiveJS = `
<script>
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

function toggleLineHighlight(lineElement) {
  const lineNumber = lineElement.getAttribute('data-line');
  const codeBlock = lineElement.closest('.code-block');
  const codeLine = codeBlock.querySelector(\`.code-line[data-line="\${lineNumber}"]\`);
  
  lineElement.classList.toggle('highlighted');
  if (codeLine) {
    codeLine.classList.toggle('highlighted');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    block.setAttribute('tabindex', '0');
    block.style.outline = 'none';
    
    block.addEventListener('focus', function() {
      this.style.boxShadow = '0 0 0 2px #0366d6';
    });
    
    block.addEventListener('blur', function() {
      this.style.boxShadow = 'none';
    });
  });
});
</script>
`;

    // Tạo HTML với CSS inline
    const htmlWithCSS = includeCSS ? 
      `<style>${css}</style><div class="${cssPrefix}">${htmlContent}</div>${interactiveJS}` :
      `<div class="${cssPrefix}">${htmlContent}</div>${interactiveJS}`;

    return {
      html: htmlContent,
      css: css,
      htmlWithCSS: htmlWithCSS
    };
  }

  /**
   * Minify CSS đơn giản
   */
  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Xóa comments
      .replace(/\s+/g, ' ')             // Thay nhiều spaces thành 1
      .replace(/;\s*}/g, '}')           // Xóa semicolon cuối
      .replace(/\s*{\s*/g, '{')         // Xóa spaces xung quanh {}
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',')         // Xóa spaces xung quanh ,
      .replace(/\s*:\s*/g, ':')         // Xóa spaces xung quanh :
      .replace(/\s*;\s*/g, ';')         // Xóa spaces xung quanh ;
      .trim();
  }

  /**
   * Lấy CSS content
   */
  getCSS(options = {}) {
    const { prefix = 'lexical-content', minify = false } = options;
    
    let css = this.cssContent;
    
    if (prefix !== 'lexical-content') {
      css = css.replace(/\.lexical-content/g, `.${prefix}`);
    }
    
    if (minify) {
      css = this.minifyCSS(css);
    }
    
    return css;
  }

  /**
   * Chỉ chuyển đổi thành HTML không có CSS
   */
  convertToHTML(lexicalData) {
    const result = this.convert(lexicalData, { includeCSS: false });
    return result.html;
  }
}

// Export default instance
const lexicalConverter = new LexicalConverter();

module.exports = {
  LexicalConverter,
  lexicalConverter
}; 