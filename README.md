# 🚀 Lexical HTML Converter

Convert Lexical JSON to HTML with optimized CSS for web applications.

[![npm version](https://img.shields.io/npm/v/lexical-html-converter.svg?style=flat)](https://www.npmjs.com/package/lexical-html-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📋 Features

- ✅ Convert Lexical JSON to standard HTML
- ✅ Generate cross-browser compatible CSS
- ✅ Support for 26+ different node types
- ✅ Code blocks with syntax highlighting
- ✅ Tables, lists, and complex components
- ✅ Excalidraw drawings → SVG
- ✅ Optimized performance (~400+ conversions/second)
- ✅ Customizable CSS output
- ✅ Compatible with React, Vue, and other frameworks

## 🔧 Installation

```bash
npm install lexical-html-converter
```

## 🚀 Basic Usage

```javascript
const { lexicalConverter } = require('lexical-html-converter');

// Lexical JSON data from editor
const lexicalData = {
  editorState: {
    root: {
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "Hello World!"
            }
          ]
        }
      ]
    }
  }
};

// Convert to HTML and CSS
const result = lexicalConverter.convert(lexicalData);

console.log(result.html);  // HTML output
console.log(result.css);   // CSS output
console.log(result.htmlWithCSS);  // Combined HTML and CSS
```

## 🎨 Customization

```javascript
const result = lexicalConverter.convert(lexicalData, {
  includeCSS: true,        // Include CSS in result
  cssPrefix: 'my-content', // Change CSS prefix (default: 'lexical-content')
  minifyCSS: true          // Minify CSS output
});
```

## 📱 React Example

```jsx
import React, { useState, useEffect } from 'react';
import { lexicalConverter } from 'lexical-html-converter';

const LexicalRenderer = ({ lexicalData }) => {
  const [content, setContent] = useState({ html: '', css: '' });

  useEffect(() => {
    if (lexicalData) {
      const result = lexicalConverter.convert(lexicalData);
      setContent(result);
    }
  }, [lexicalData]);

  return (
    <div className="lexical-renderer">
      <style dangerouslySetInnerHTML={{ __html: content.css }} />
      <div 
        className="lexical-content"
        dangerouslySetInnerHTML={{ __html: content.html }} 
      />
    </div>
  );
};

export default LexicalRenderer;
```

## 🌐 Vue Example

```vue
<template>
  <div class="lexical-renderer">
    <style v-if="content.css" v-text="content.css"></style>
    <div class="lexical-content" v-html="content.html"></div>
  </div>
</template>

<script>
import { lexicalConverter } from 'lexical-html-converter';

export default {
  name: 'LexicalRenderer',
  props: {
    lexicalData: Object
  },
  data() {
    return {
      content: {
        html: '',
        css: ''
      }
    }
  },
  watch: {
    lexicalData: {
      handler(newData) {
        if (newData) {
          const result = lexicalConverter.convert(newData);
          this.content = result;
        }
      },
      immediate: true
    }
  }
}
</script>
```

## 📊 Supported Node Types

| Node Type | Description |
|-----------|-------------|
| `root` | Document root node |
| `paragraph` | Text paragraphs |
| `text` | Text nodes with formatting |
| `heading` | Headings (h1-h6) |
| `list` | Lists (ul, ol, checklist) |
| `listitem` | List items |
| `quote` | Blockquotes |
| `code` | Code blocks |
| `code-highlight` | Syntax highlighting |
| `link` | Hyperlinks |
| `image` | Images |
| `inline-image` | Inline images |
| `table` | Tables |
| `tablerow` | Table rows |
| `tablecell` | Table cells |
| `linebreak` | Line breaks |
| `excalidraw` | Excalidraw drawings |
| `equation` | Math equations |
| `hashtag` | Hashtags |
| `collapsible-container` | Collapsible sections |
| `poll` | Polls/voting |
| `layout-container` | Layout grids |
| `layout-item` | Layout grid items |
| `page-break` | Page breaks |

## 🧪 Performance

- **Conversion time**: ~2-5ms average
- **Throughput**: ~400+ conversions/second
- **Memory usage**: Minimal (~0.1 MB)

## 📄 License

MIT © [Hoang Thiep](https://github.com/yourusername)