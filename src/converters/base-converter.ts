import { LexicalNode, LexicalDocument } from '../types/lexical';
import { ConverterOptions, ConverterContext, ConversionResult } from '../types/converter';
import { generateDocumentWrapper } from '../utils/html-utils';

export abstract class BaseConverter {
  protected context: ConverterContext;

  constructor(options: ConverterOptions = {}) {
    this.context = {
      nodeCount: 0,
      errors: [],
      options: {
        sanitize: true,
        format: 'html5',
        includeStyles: true,
        wrapInDocument: true,
        ...options
      }
    };
  }

  public convert(lexicalDoc: LexicalDocument): ConversionResult {
    const startTime = performance.now();
    
    try {
      this.context.nodeCount = 0;
      this.context.errors = [];
      
      const htmlContent = this.convertNode(lexicalDoc.editorState.root);
      
      const finalHtml = this.context.options.wrapInDocument 
        ? generateDocumentWrapper(htmlContent)
        : htmlContent;
      
      const endTime = performance.now();
      
      return {
        html: finalHtml,
        stats: {
          nodeCount: this.context.nodeCount,
          processingTime: endTime - startTime,
          errors: [...this.context.errors]
        }
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        html: '',
        stats: {
          nodeCount: this.context.nodeCount,
          processingTime: endTime - startTime,
          errors: [`Fatal error: ${error instanceof Error ? error.message : String(error)}`]
        }
      };
    }
  }

  protected convertNode(node: LexicalNode): string {
    this.context.nodeCount++;
    
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
          return this.convertLineBreak(node);
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
          this.context.errors.push(`Unknown node type: ${node.type}`);
          return this.convertChildren(node);
      }
    } catch (error) {
      this.context.errors.push(`Error converting ${node.type}: ${error instanceof Error ? error.message : String(error)}`);
      return `<!-- Error converting ${node.type} -->`;
    }
  }

  protected convertChildren(node: any): string {
    if (!node.children || !Array.isArray(node.children)) {
      return '';
    }
    
    return node.children
      .map((child: LexicalNode) => this.convertNode(child))
      .join('');
  }

  // Abstract methods to be implemented by specific converter
  protected abstract convertParagraph(node: any): string;
  protected abstract convertHeading(node: any): string;
  protected abstract convertText(node: any): string;
  protected abstract convertLineBreak(node: any): string;
  protected abstract convertQuote(node: any): string;
  protected abstract convertList(node: any): string;
  protected abstract convertListItem(node: any): string;
  protected abstract convertLink(node: any): string;
  protected abstract convertHashtag(node: any): string;
  protected abstract convertTable(node: any): string;
  protected abstract convertTableRow(node: any): string;
  protected abstract convertTableCell(node: any): string;
  protected abstract convertImage(node: any): string;
  protected abstract convertInlineImage(node: any): string;
  protected abstract convertEquation(node: any): string;
  protected abstract convertCode(node: any): string;
  protected abstract convertCodeHighlight(node: any): string;
  protected abstract convertCollapsibleContainer(node: any): string;
  protected abstract convertCollapsibleTitle(node: any): string;
  protected abstract convertCollapsibleContent(node: any): string;
  protected abstract convertPoll(node: any): string;
  protected abstract convertLayoutContainer(node: any): string;
  protected abstract convertLayoutItem(node: any): string;
  protected abstract convertPageBreak(node: any): string;
  protected abstract convertExcalidraw(node: any): string;
} 