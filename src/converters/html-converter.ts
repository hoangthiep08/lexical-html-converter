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
    
    if (node.textFormat) {
      // Apply paragraph-level text formatting if needed
    }
    
    if (node.textStyle) {
      attributes.style = sanitizeStyle(node.textStyle);
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
    const content = this.convertChildren(node);
    const attributes: any = {};
    
    if (node.language) {
      attributes.class = `language-${node.language}`;
    }
    
    return wrapWithTag('pre', wrapWithTag('code', content, attributes));
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
    // For now, just show a placeholder
    // In a real implementation, you might want to render the Excalidraw data
    const data = node.data || '';
    return wrapWithTag('div', 
      wrapWithTag('p', 'Excalidraw Drawing') + 
      wrapWithTag('details', 
        wrapWithTag('summary', 'View Raw Data') +
        wrapWithTag('pre', escapeHtml(data))
      ), 
      { class: 'excalidraw-container' }
    );
  }
} 