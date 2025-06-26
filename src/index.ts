import { HtmlConverter } from './converters/html-converter';
import { readFileSync } from 'fs';
import { join } from 'path';

// Interface for conversion result
export interface ConversionResult {
  html: string;
  css: string;
  javascript: string;
  htmlWithCSS: string; // HTML with inline CSS
  htmlWithCSSAndJS: string; // HTML with CSS and JavaScript
}

export interface ConversionOptions {
  includeCSS?: boolean; // Default true
  includeJS?: boolean;  // Default true - include JavaScript for code blocks
  cssPrefix?: string;   // Prefix for CSS classes, default 'lexical-content'
  minifyCSS?: boolean;  // Minify CSS, default false
  minifyJS?: boolean;   // Minify JavaScript, default false
}

// Main library class
export class LexicalHtmlConverter {
  private htmlConverter: HtmlConverter;
  private defaultCSS: string;
  private defaultJS: string;

  constructor() {
    this.htmlConverter = new HtmlConverter();
    this.defaultCSS = this.loadCSS();
    this.defaultJS = this.loadJS();
  }

  private loadCSS(): string {
    try {
      const cssPath = join(__dirname, 'styles', 'lexical-content.css');
      return readFileSync(cssPath, 'utf-8');
    } catch (error) {
      console.warn('Could not load CSS file, using fallback');
      
      // Fallback CSS if file not found
      return `
        .lexical-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .lexical-content h1, .lexical-content h2, .lexical-content h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .lexical-content p {
          margin-bottom: 1em;
        }
      `;
    }
  }

  private loadJS(): string {
    try {
      const jsPath = join(__dirname, 'utils', 'code-utils.js');
      return readFileSync(jsPath, 'utf-8');
    } catch (error) {
      console.warn('Could not load JavaScript file, using fallback');
      
      // Fallback JavaScript if file not found
      return `
        // Basic copy functionality
        function copyCode(codeId) {
          const element = document.getElementById(codeId);
          if (element) {
            navigator.clipboard.writeText(element.textContent);
          }
        }
      `;
    }
  }

  public getDefaultCSS(): string {
    return this.defaultCSS;
  }

  public getDefaultJS(): string {
    return this.defaultJS;
  }

  /**
   * Convert Lexical JSON to HTML with options
   * @param lexicalJson - Lexical editor state JSON
   * @param options - Conversion options
   * @returns ConversionResult with HTML, CSS, and JavaScript
   */
  public convert(lexicalJson: any, options: ConversionOptions = {}): ConversionResult {
    // Set default options
    const opts = {
      includeCSS: true,
      includeJS: true,
      cssPrefix: 'lexical-content',
      minifyCSS: false,
      minifyJS: false,
      ...options
    };

    // Convert JSON to HTML
    const conversionResult = this.htmlConverter.convert(lexicalJson);
    const html = conversionResult.html;
    
    // Process CSS
    let css = opts.includeCSS ? this.defaultCSS : '';
    
    // Change prefix if needed
    if (opts.cssPrefix && opts.cssPrefix !== 'lexical-content') {
      css = css.replace(/\.lexical-content/g, `.${opts.cssPrefix}`);
    }
    
    // Minify CSS if needed
    if (opts.minifyCSS && css) {
      css = this.minifyCSS(css);
    }

    // Process JavaScript
    let javascript = opts.includeJS ? this.defaultJS : '';
    
    // Minify JavaScript if needed
    if (opts.minifyJS && javascript) {
      javascript = this.minifyJS(javascript);
    }

    // Create HTML with inline CSS
    const htmlWithCSS = opts.includeCSS ? this.wrapWithCSS(html, css, opts.cssPrefix) : html;
    
    // Create HTML with CSS and JavaScript
    const htmlWithCSSAndJS = this.wrapWithCSSAndJS(html, css, javascript, opts.cssPrefix);

    return {
      html,
      css,
      javascript,
      htmlWithCSS,
      htmlWithCSSAndJS
    };
  }

  private wrapWithCSS(html: string, css: string, cssPrefix: string = 'lexical-content'): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lexical Content</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="${cssPrefix}">
${html}
  </div>
</body>
</html>`;
  }

  private wrapWithCSSAndJS(html: string, css: string, javascript: string, cssPrefix: string = 'lexical-content'): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lexical Content</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="${cssPrefix}">
${html}
  </div>
  <script>
${javascript}
  </script>
</body>
</html>`;
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}')           // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{')         // Remove spaces around opening brace
      .replace(/}\s*/g, '}')            // Remove spaces after closing brace
      .replace(/\s*,\s*/g, ',')         // Remove spaces around comma
      .replace(/\s*:\s*/g, ':')         // Remove spaces around colon
      .replace(/\s*;\s*/g, ';')         // Remove spaces around semicolon
      .trim();
  }

  private minifyJS(javascript: string): string {
    return javascript
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '')         // Remove line comments
      .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
      .replace(/\s*{\s*/g, '{')         // Remove spaces around opening brace
      .replace(/}\s*/g, '}')            // Remove spaces after closing brace
      .replace(/\s*;\s*/g, ';')         // Remove spaces around semicolon
      .replace(/\s*,\s*/g, ',')         // Remove spaces around comma
      .trim();
  }
}

// Export default instance
export const lexicalConverter = new LexicalHtmlConverter();

// Export for named imports
export { HtmlConverter } from './converters/html-converter';
export * from './types/lexical';
export * from './types/converter';
export * from './utils/html-utils'; 