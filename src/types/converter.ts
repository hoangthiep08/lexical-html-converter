export interface ConverterOptions {
  theme?: {
    [nodeType: string]: string | { [key: string]: string };
  };
  sanitize?: boolean;
  format?: 'html5' | 'xhtml';
  baseUrl?: string;
  customAttributes?: {
    [nodeType: string]: { [key: string]: string };
  };
  includeStyles?: boolean;
  wrapInDocument?: boolean;
}

export interface ConverterContext {
  nodeCount: number;
  errors: string[];
  options: ConverterOptions;
}

export interface ConversionResult {
  html: string;
  stats: {
    nodeCount: number;
    processingTime: number;
    errors: string[];
  };
}

export interface TextFormatFlags {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  subscript: boolean;
  superscript: boolean;
} 