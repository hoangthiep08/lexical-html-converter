import { HtmlConverter } from './converters/html-converter';
import { readFileSync } from 'fs';
import { join } from 'path';

// Interface cho kết quả chuyển đổi
export interface ConversionResult {
  html: string;
  css: string;
  htmlWithCSS: string; // HTML đã bao gồm CSS inline
}

// Interface cho options
export interface ConversionOptions {
  includeCSS?: boolean; // Mặc định true
  cssPrefix?: string;   // Prefix cho CSS classes, mặc định 'lexical-content'
  minifyCSS?: boolean;  // Minify CSS, mặc định false
}

// Class chính của thư viện
export class LexicalConverter {
  private converter: HtmlConverter;
  private cssContent: string;

  constructor() {
    this.converter = new HtmlConverter();
    this.cssContent = this.loadCSS();
  }

  /**
   * Load CSS content từ file
   */
  private loadCSS(): string {
    try {
      const cssPath = join(__dirname, '../src/styles/lexical-content.css');
      return readFileSync(cssPath, 'utf8');
    } catch (error) {
      // Fallback CSS nếu không tìm thấy file
      return this.getDefaultCSS();
    }
  }

  /**
   * CSS mặc định nếu không load được từ file
   */
  private getDefaultCSS(): string {
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

.lexical-content img {
  max-width: 100%;
  height: auto;
}
`;
  }

  /**
   * Chuyển đổi Lexical JSON thành HTML
   */
  public convert(lexicalData: any, options: ConversionOptions = {}): ConversionResult {
    const {
      includeCSS = true,
      cssPrefix = 'lexical-content',
      minifyCSS = false
    } = options;

    // Chuyển đổi JSON thành HTML
    const result = this.converter.convert(lexicalData);
    const htmlContent = result.html;
    
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

    // Tạo HTML với CSS inline
    const htmlWithCSS = includeCSS ? 
      `<style>${css}</style><div class="${cssPrefix}">${htmlContent}</div>` :
      `<div class="${cssPrefix}">${htmlContent}</div>`;

    return {
      html: htmlContent,
      css: css,
      htmlWithCSS: htmlWithCSS
    };
  }

  /**
   * Minify CSS đơn giản
   */
  private minifyCSS(css: string): string {
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
  public getCSS(options: { prefix?: string; minify?: boolean } = {}): string {
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
  public convertToHTML(lexicalData: any): string {
    const result = this.converter.convert(lexicalData);
    return result.html;
  }
}

// Export default instance
export const lexicalConverter = new LexicalConverter();

// Export cho named imports
export { HtmlConverter } from './converters/html-converter';
export * from './types/lexical';
export * from './types/converter';
export * from './utils/html-utils'; 