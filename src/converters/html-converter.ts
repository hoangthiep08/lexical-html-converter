import { BaseConverter } from './base-converter';
import { 
  wrapWithTag, 
  createSelfClosingTag, 
  applyTextFormatting, 
  sanitizeStyle, 
  escapeHtml 
} from '../utils/html-utils';

export class HtmlConverter extends BaseConverter {
  
  protected convertParagraph(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    // Handle text alignment from format property
    if (node.format) {
      const styles = [];
      
      switch (node.format) {
        case 'left':
          styles.push('text-align: left');
          break;
        case 'center':
          styles.push('text-align: center');
          break;
        case 'right':
          styles.push('text-align: right');
          break;
        case 'justify':
          styles.push('text-align: justify');
          break;
      }
      
      if (styles.length > 0) {
        attributes.style = styles.join('; ');
      }
    }
    
    if (node.direction && node.direction !== 'ltr') {
      attributes.dir = node.direction;
    }
    
    return wrapWithTag('p', content, attributes);
  }

  protected convertHeading(node: any): string {
    const content = this.convertChildren(node);
    const tag = node.tag || 'h1';
    const attributes: any = {};
    
    if (node.direction && node.direction !== 'ltr') {
      attributes.dir = node.direction;
    }
    
    return wrapWithTag(tag, content, attributes);
  }

  protected convertText(node: any): string {
    if (!node.text) return '';
    
    const format = node.format || 0;
    const style = node.style ? sanitizeStyle(node.style) : undefined;
    
    return applyTextFormatting(node.text, format, style);
  }

  protected convertLineBreak(node: any): string {
    return '<br/>';
  }

  protected convertQuote(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    if (node.direction && node.direction !== 'ltr') {
      attributes.dir = node.direction;
    }
    
    return wrapWithTag('blockquote', content, attributes);
  }

  protected convertList(node: any): string {
    const content = this.convertChildren(node);
    const tag = node.tag || 'ul';
    const attributes: any = {};
    
    if (node.start && node.start !== 1 && tag === 'ol') {
      attributes.start = node.start;
    }
    
    if (node.listType === 'check') {
      attributes.class = 'checklist';
    }
    
    return wrapWithTag(tag, content, attributes);
  }

  protected convertListItem(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
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

  protected convertLink(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {
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

  protected convertHashtag(node: any): string {
    const text = node.text || '';
    return wrapWithTag('span', escapeHtml(text), { class: 'hashtag' });
  }

  protected convertTable(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    if (node.colWidths && node.colWidths.length > 0) {
      // Add column width styles
      const colgroup = node.colWidths
        .map((width: number) => createSelfClosingTag('col', { style: `width: ${width}px` }))
        .join('');
      return wrapWithTag('table', wrapWithTag('colgroup', colgroup) + content, attributes);
    }
    
    return wrapWithTag('table', content, attributes);
  }

  protected convertTableRow(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    if (node.height) {
      attributes.style = `height: ${node.height}px`;
    }
    
    return wrapWithTag('tr', content, attributes);
  }

  protected convertTableCell(node: any): string {
    const content = this.convertChildren(node);
    const tag = node.headerState === 1 ? 'th' : 'td';
    const attributes: any = {};
    
    if (node.colSpan && node.colSpan > 1) {
      attributes.colspan = node.colSpan;
    }
    
    if (node.rowSpan && node.rowSpan > 1) {
      attributes.rowspan = node.rowSpan;
    }
    
    if (node.backgroundColor) {
      attributes.style = `background-color: ${sanitizeStyle(node.backgroundColor)}`;
    }
    
    return wrapWithTag(tag, content, attributes);
  }

  protected convertImage(node: any): string {
    const attributes: any = {
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

  protected convertInlineImage(node: any): string {
    const attributes: any = {
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

  protected convertEquation(node: any): string {
    const equation = escapeHtml(node.equation || '');
    const attributes = { class: 'equation' };
    
    if (node.inline) {
      return wrapWithTag('span', equation, attributes);
    } else {
      return wrapWithTag('div', equation, attributes);
    }
  }

  protected convertCode(node: any): string {
    // Special handling for code blocks - convert linebreaks to \n
    const content = this.convertCodeChildren(node);
    const language = node.language || 'text';
    
    // Add line numbers to content
    const lines = content.split('\n');
    const numberedContent = lines
      .map((line, index) => {
        const lineNumber = (index + 1).toString().padStart(3, ' ');
        return `<span class="line-number">${lineNumber}</span><span class="line-content">${line}</span>`;
      })
      .join('\n');
    
    const codeAttributes: any = {
      class: `language-${language}`
    };
    
    const preAttributes: any = {
      'data-language': language
    };
    
    return wrapWithTag('pre', wrapWithTag('code', numberedContent, codeAttributes), preAttributes);
  }

  /**
   * Special method to convert code children with linebreaks as \n
   */
  protected convertCodeChildren(node: any): string {
    if (!node.children || !Array.isArray(node.children)) {
      return '';
    }
    
    return node.children
      .map((child: any) => {
        if (child.type === 'linebreak') {
          return '\n';
        } else if (child.type === 'code-highlight') {
          return this.convertCodeHighlight(child);
        } else {
          return this.convertNode(child);
        }
      })
      .join('');
  }

  protected convertCodeHighlight(node: any): string {
    const text = escapeHtml(node.text || '');
    const attributes: any = {};
    
    if (node.highlightType) {
      attributes.class = `highlight-${node.highlightType}`;
    }
    
    return wrapWithTag('span', text, attributes);
  }

  protected convertCollapsibleContainer(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    if (node.open) {
      attributes.open = 'open';
    }
    
    return wrapWithTag('details', content, attributes);
  }

  protected convertCollapsibleTitle(node: any): string {
    const content = this.convertChildren(node);
    return wrapWithTag('summary', content);
  }

  protected convertCollapsibleContent(node: any): string {
    const content = this.convertChildren(node);
    return wrapWithTag('div', content, { class: 'details-content' });
  }

  protected convertPoll(node: any): string {
    const pollData = node.$ || node;
    const question = escapeHtml(pollData.question || '');
    const options = pollData.options || [];
    
    let content = wrapWithTag('h4', question);
    
    if (options.length > 0) {
      const optionsList = options
        .map((option: any, index: number) => {
          const optionText = escapeHtml(option.text || `Option ${index + 1}`);
          const voteCount = option.votes ? option.votes.length : 0;
          return wrapWithTag('li', `${optionText} (${voteCount} votes)`);
        })
        .join('');
      
      content += wrapWithTag('ul', optionsList);
    }
    
    return wrapWithTag('div', content, { class: 'poll' });
  }

  protected convertLayoutContainer(node: any): string {
    const content = this.convertChildren(node);
    const attributes: any = { class: 'layout-container' };
    
    if (node.templateColumns) {
      attributes.style = `grid-template-columns: ${node.templateColumns}`;
    }
    
    return wrapWithTag('div', content, attributes);
  }

  protected convertLayoutItem(node: any): string {
    const content = this.convertChildren(node);
    return wrapWithTag('div', content, { class: 'layout-item' });
  }

  protected convertPageBreak(node: any): string {
    return wrapWithTag('div', '', { class: 'page-break' });
  }

  protected convertExcalidraw(node: any): string {
    const data = node.data || '';
    const excalidrawId = `excalidraw-${Math.random().toString(36).substr(2, 9)}`;
    
    // Auto-render SVG from Excalidraw data
    let svgContent = '';
    
    try {
      if (data) {
        const parsedData = JSON.parse(data);
        const elements = parsedData.elements || [];
        
        if (elements.length > 0) {
          // Use Lexical node dimensions if available, otherwise calculate from elements
          let width, height, viewBox, minX = 0, minY = 0;
          
          if (node.width && node.height) {
            // Use Lexical dimensions (display size)
            width = Math.round(node.width);
            height = Math.round(node.height);
            
            // Calculate bounding box for proper viewBox
            let calcMinX = Infinity, calcMinY = Infinity, calcMaxX = -Infinity, calcMaxY = -Infinity;
            elements.forEach((element: any) => {
              if (element.x !== undefined && element.y !== undefined) {
                calcMinX = Math.min(calcMinX, element.x);
                calcMinY = Math.min(calcMinY, element.y);
                calcMaxX = Math.max(calcMaxX, element.x + (element.width || 0));
                calcMaxY = Math.max(calcMaxY, element.y + (element.height || 0));
              }
            });
            
            // Use calculated bounds for viewBox but Lexical size for display
            const padding = 20;
            minX = calcMinX - padding;
            minY = calcMinY - padding;
            const contentWidth = calcMaxX - calcMinX + padding * 2;
            const contentHeight = calcMaxY - calcMinY + padding * 2;
            viewBox = `${minX} ${minY} ${contentWidth} ${contentHeight}`;
          } else {
            // Fallback: Calculate bounding box from elements
            let calcMinX = Infinity, calcMinY = Infinity, calcMaxX = -Infinity, calcMaxY = -Infinity;
            
            elements.forEach((element: any) => {
              if (element.x !== undefined && element.y !== undefined) {
                calcMinX = Math.min(calcMinX, element.x);
                calcMinY = Math.min(calcMinY, element.y);
                calcMaxX = Math.max(calcMaxX, element.x + (element.width || 0));
                calcMaxY = Math.max(calcMaxY, element.y + (element.height || 0));
              }
            });
            
            // Add padding
            const padding = 20;
            minX = calcMinX - padding;
            minY = calcMinY - padding;
            width = Math.max(400, calcMaxX - calcMinX + padding * 2);
            height = Math.max(300, calcMaxY - calcMinY + padding * 2);
            viewBox = `${minX} ${minY} ${width} ${height}`;
          }
          
          // Generate SVG elements
          let svgElements = '';
          elements.forEach((element: any) => {
            switch (element.type) {
              case 'rectangle':
                svgElements += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
                  fill="${element.backgroundColor || 'transparent'}" 
                  stroke="${element.strokeColor || '#000'}" 
                  stroke-width="${element.strokeWidth || 2}" 
                  rx="${element.roundness?.radius || 0}"/>`;
                break;
              case 'ellipse':
                const cx = element.x + element.width / 2;
                const cy = element.y + element.height / 2;
                svgElements += `<ellipse cx="${cx}" cy="${cy}" rx="${element.width / 2}" ry="${element.height / 2}" 
                  fill="${element.backgroundColor || 'transparent'}" 
                  stroke="${element.strokeColor || '#000'}" 
                  stroke-width="${element.strokeWidth || 2}"/>`;
                break;
              case 'freedraw':
                if (element.points && element.points.length > 0) {
                  const pathData = element.points.map((point: number[], index: number) => 
                    `${index === 0 ? 'M' : 'L'} ${element.x + point[0]} ${element.y + point[1]}`
                  ).join(' ');
                  svgElements += `<path d="${pathData}" 
                    fill="none" 
                    stroke="${element.strokeColor || '#000'}" 
                    stroke-width="${element.strokeWidth || 2}"/>`;
                }
                break;
              case 'line':
                svgElements += `<line x1="${element.x}" y1="${element.y}" 
                  x2="${element.x + element.width}" y2="${element.y + element.height}" 
                  stroke="${element.strokeColor || '#000'}" 
                  stroke-width="${element.strokeWidth || 2}"/>`;
                break;
              case 'arrow':
                svgElements += `<line x1="${element.x}" y1="${element.y}" 
                  x2="${element.x + element.width}" y2="${element.y + element.height}" 
                  stroke="${element.strokeColor || '#000'}" 
                  stroke-width="${element.strokeWidth || 2}" 
                  marker-end="url(#arrowhead)"/>`;
                break;
              case 'text':
                svgElements += `<text x="${element.x}" y="${element.y + 20}" 
                  font-family="Arial, sans-serif" 
                  font-size="${element.fontSize || 16}" 
                  fill="${element.strokeColor || '#000'}">${escapeHtml(element.text || '')}</text>`;
                break;
            }
          });
          
          // Arrow marker definition
          const arrowDef = `
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>
              </marker>
            </defs>
          `;
          
          svgContent = `
            <svg width="${Math.min(width, 800)}" height="${Math.min(height, 600)}" 
              viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
              ${arrowDef}
              <rect x="${minX}" y="${minY}" width="${width}" height="${height}" 
                fill="white" stroke="#e0e0e0" stroke-width="1"/>
              ${svgElements}
            </svg>
          `;
        } else {
          // Empty drawing - use Lexical dimensions if available
          const displayWidth = node.width ? Math.round(node.width) : 400;
          const displayHeight = node.height ? Math.round(node.height) : 200;
          
          svgContent = `
            <svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${displayWidth} ${displayHeight}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${displayWidth}" height="${displayHeight}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2" rx="8"/>
              <text x="${displayWidth/2}" y="${displayHeight/2 - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6c757d">
                📝 Empty Excalidraw Canvas
              </text>
              <text x="${displayWidth/2}" y="${displayHeight/2 + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
                No drawing elements found
              </text>
            </svg>
          `;
        }
      }
    } catch (error) {
      console.warn('Failed to parse Excalidraw data:', error);
      const displayWidth = node.width ? Math.round(node.width) : 400;
      const displayHeight = node.height ? Math.round(node.height) : 200;
      
      svgContent = `
        <svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${displayWidth} ${displayHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${displayWidth}" height="${displayHeight}" fill="#ffe6e6" stroke="#ff9999" stroke-width="2" rx="8"/>
          <text x="${displayWidth/2}" y="${displayHeight/2 - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#cc0000">
            ⚠️ Invalid Excalidraw Data
          </text>
          <text x="${displayWidth/2}" y="${displayHeight/2 + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
            Could not parse drawing data
          </text>
        </svg>
      `;
    }
    
    return wrapWithTag('div', svgContent, { 
      class: 'excalidraw-simple',
      id: excalidrawId
    });
  }
} 