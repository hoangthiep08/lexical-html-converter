// Lexical Node Types
export interface LexicalNode {
  type: string;
  version: number;
  [key: string]: any;
}

export interface LexicalTextNode extends LexicalNode {
  type: 'text';
  text: string;
  format?: number;
  style?: string;
  mode?: string;
  detail?: number;
}

export interface LexicalElementNode extends LexicalNode {
  children?: LexicalNode[];
  direction?: 'ltr' | 'rtl' | null;
  format?: string;
  indent?: number;
}

export interface LexicalParagraphNode extends LexicalElementNode {
  type: 'paragraph';
  textFormat?: number;
  textStyle?: string;
}

export interface LexicalHeadingNode extends LexicalElementNode {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface LexicalQuoteNode extends LexicalElementNode {
  type: 'quote';
}

export interface LexicalLineBreakNode extends LexicalNode {
  type: 'linebreak';
}

export interface LexicalListNode extends LexicalElementNode {
  type: 'list';
  listType: string;
  start: number;
  tag: string;
}

export interface LexicalListItemNode extends LexicalElementNode {
  type: 'listitem';
  checked?: boolean;
  value: number;
}

export interface LexicalLinkNode extends LexicalElementNode {
  type: 'link';
  url: string;
  target?: string | null;
  rel?: string | null;
  title?: string | null;
}

export interface LexicalHashtagNode extends LexicalNode {
  type: 'hashtag';
  text: string;
}

export interface LexicalTableNode extends LexicalElementNode {
  type: 'table';
  colWidths?: number[];
}

export interface LexicalTableRowNode extends LexicalElementNode {
  type: 'tablerow';
  height?: number;
}

export interface LexicalTableCellNode extends LexicalElementNode {
  type: 'tablecell';
  backgroundColor?: string | null;
  colSpan?: number;
  headerState?: number;
  rowSpan?: number;
}

export interface LexicalImageNode extends LexicalNode {
  type: 'image';
  src: string;
  altText?: string;
  caption?: any;
  height?: number;
  width?: number;
  maxWidth?: number;
  showCaption?: boolean;
}

export interface LexicalInlineImageNode extends LexicalNode {
  type: 'inline-image';
  src: string;
  altText?: string;
  caption?: any;
  height?: number;
  width?: number;
  position?: string;
  showCaption?: boolean;
}

export interface LexicalEquationNode extends LexicalNode {
  type: 'equation';
  equation: string;
  inline?: boolean;
}

export interface LexicalCodeNode extends LexicalElementNode {
  type: 'code';
  language?: string;
}

export interface LexicalCodeHighlightNode extends LexicalNode {
  type: 'code-highlight';
  text: string;
  highlightType?: string;
}

export interface LexicalCollapsibleContainerNode extends LexicalElementNode {
  type: 'collapsible-container';
  open?: boolean;
}

export interface LexicalCollapsibleTitleNode extends LexicalElementNode {
  type: 'collapsible-title';
}

export interface LexicalCollapsibleContentNode extends LexicalElementNode {
  type: 'collapsible-content';
}

export interface LexicalPollNode extends LexicalNode {
  type: 'poll';
  $: {
    question: string;
    options: Array<{
      text: string;
      uid: string;
      votes: any[];
    }>;
  };
}

export interface LexicalLayoutContainerNode extends LexicalElementNode {
  type: 'layout-container';
  templateColumns?: string;
}

export interface LexicalLayoutItemNode extends LexicalElementNode {
  type: 'layout-item';
}

export interface LexicalPageBreakNode extends LexicalNode {
  type: 'page-break';
}

export interface LexicalExcalidrawNode extends LexicalNode {
  type: 'excalidraw';
  data: string;
}

export interface LexicalRootNode extends LexicalElementNode {
  type: 'root';
  textFormat?: number;
  textStyle?: string;
}

export interface LexicalEditorState {
  root: LexicalRootNode;
}

export interface LexicalDocument {
  editorState: LexicalEditorState;
  lastSaved?: number;
  source?: string;
  version?: string;
} 