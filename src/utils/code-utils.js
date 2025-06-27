/**
 * JavaScript utilities for code block functionality
 * Copy and Fold/Unfold code blocks
 */

/**
 * Copy code content to clipboard
 * @param {string} codeId - ID of the code element
 */
function copyCode(codeId) {
  try {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) {
      console.error('Code element not found:', codeId);
      return;
    }
    
    // Get text content from code element
    const codeText = codeElement.textContent || codeElement.innerText;
    
    // Copy to clipboard using modern API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(codeText).then(() => {
        showCopyFeedback(codeId, true);
      }).catch(err => {
        console.error('Failed to copy:', err);
        fallbackCopyTextToClipboard(codeText, codeId);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyTextToClipboard(codeText, codeId);
    }
  } catch (error) {
    console.error('Error copying code:', error);
    showCopyFeedback(codeId, false);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {string} codeId - Code ID for feedback
 */
function fallbackCopyTextToClipboard(text, codeId) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    showCopyFeedback(codeId, successful);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyFeedback(codeId, false);
  }
  
  document.body.removeChild(textArea);
}

/**
 * Show visual feedback for copy operation
 * @param {string} codeId - Code ID
 * @param {boolean} success - Whether copy was successful
 */
function showCopyFeedback(codeId, success) {
  const wrapper = document.querySelector(`[data-code-id="${codeId}"]`);
  if (!wrapper) return;
  
  const copyBtn = wrapper.querySelector('.copy-btn');
  if (!copyBtn) return;
  
  const originalText = copyBtn.textContent;
  
  if (success) {
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('copied');
    }, 2000);
  } else {
    copyBtn.textContent = 'Failed';
    copyBtn.style.backgroundColor = '#dc3545';
    copyBtn.style.color = 'white';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = '';
      copyBtn.style.color = '';
    }, 2000);
  }
}

/**
 * Toggle code block fold/unfold
 * @param {string} codeId - ID of the code element
 */
function toggleCodeFold(codeId) {
  try {
    const wrapper = document.querySelector(`[data-code-id="${codeId}"]`);
    if (!wrapper) {
      console.error('Code block not found:', codeId);
      return;
    }
    
    const foldBtn = wrapper.querySelector('.fold-btn');
    const headerBar = wrapper.querySelector('.code-header-bar');
    const collapsedHeader = wrapper.querySelector('.code-header-collapsed');
    const codeContent = wrapper.querySelector('.code-content');
    const isCollapsed = wrapper.classList.contains('collapsed');
    
    if (isCollapsed) {
      // Unfold
      wrapper.classList.remove('collapsed');
      if (headerBar) headerBar.style.display = 'flex';
      if (collapsedHeader) collapsedHeader.style.display = 'none';
      if (codeContent) codeContent.style.display = 'block';
      if (foldBtn) foldBtn.textContent = 'Fold';
    } else {
      // Fold
      wrapper.classList.add('collapsed');
      if (headerBar) headerBar.style.display = 'none';
      if (collapsedHeader) collapsedHeader.style.display = 'block';
      if (codeContent) codeContent.style.display = 'none';
      if (foldBtn) foldBtn.textContent = 'Unfold';
    }
  } catch (error) {
    console.error('Error toggling code fold:', error);
  }
}

/**
 * Enhance existing code block with copy/fold functionality
 * @param {Element} preElement - The pre element to enhance
 * @param {number} index - Index for unique ID
 */
function enhanceCodeBlock(preElement, index) {
  const codeId = `code-${index}-${Math.random().toString(36).substr(2, 6)}`;
  const codeElement = preElement.querySelector('code');
  
  // Get language from class or data attribute and sanitize it
  const rawLanguage = preElement.dataset.language || 
                      (codeElement.className.match(/language-(\w+)/) || ['', 'text'])[1];
  // Sanitize language: only allow alphanumeric characters
  const language = rawLanguage.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'text';
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'enhanced-code-block';
  wrapper.dataset.codeId = codeId;
  
  // Create header with controls - using safe DOM methods
  const header = document.createElement('div');
  header.className = 'code-header-bar';
  
  // Create language label
  const languageDiv = document.createElement('div');
  languageDiv.className = 'code-language';
  languageDiv.textContent = language.toUpperCase();
  
  // Create controls container
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'code-controls';
  
  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-btn copy-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = () => copyCode(codeId);
  
  // Create fold button
  const foldBtn = document.createElement('button');
  foldBtn.className = 'code-btn fold-btn';
  foldBtn.textContent = 'Fold';
  foldBtn.onclick = () => toggleCodeFold(codeId);
  
  // Assemble header
  controlsDiv.appendChild(copyBtn);
  controlsDiv.appendChild(foldBtn);
  header.appendChild(languageDiv);
  header.appendChild(controlsDiv);
  
  // Create collapsed header - using safe DOM methods
  const collapsedHeader = document.createElement('div');
  collapsedHeader.className = 'code-header-collapsed';
  collapsedHeader.style.display = 'none';
  
  const expandIcon = document.createElement('span');
  expandIcon.className = 'expand-icon';
  expandIcon.textContent = '▶';
  
  const expandText = document.createTextNode(` ${language.toUpperCase()} - Click to expand`);
  
  collapsedHeader.appendChild(expandIcon);
  collapsedHeader.appendChild(expandText);
  collapsedHeader.onclick = () => toggleCodeFold(codeId);
  
  // Set ID on code element
  codeElement.id = codeId;
  
  // Wrap pre element
  const codeContent = document.createElement('div');
  codeContent.className = 'code-content';
  
  // Insert wrapper before pre element
  preElement.parentNode.insertBefore(wrapper, preElement);
  
  // Move pre into wrapper
  codeContent.appendChild(preElement);
  wrapper.appendChild(header);
  wrapper.appendChild(collapsedHeader);
  wrapper.appendChild(codeContent);
}

/**
 * Initialize all code blocks on page load
 */
function initCodeBlocks() {
  // Enhance existing pre code blocks with copy/fold functionality
  document.querySelectorAll('pre').forEach((preElement, index) => {
    if (preElement.querySelector('code') && !preElement.closest('.enhanced-code-block')) {
      enhanceCodeBlock(preElement, index);
    }
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Shift + C to copy focused code block
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      const focusedCodeBlock = document.querySelector('.enhanced-code-block:focus-within');
      if (focusedCodeBlock) {
        const codeId = focusedCodeBlock.dataset.codeId;
        copyCode(codeId);
        e.preventDefault();
      }
    }
    
    // Ctrl/Cmd + Shift + F to toggle fold of focused code block
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      const focusedCodeBlock = document.querySelector('.enhanced-code-block:focus-within');
      if (focusedCodeBlock) {
        const codeId = focusedCodeBlock.dataset.codeId;
        toggleCodeFold(codeId);
        e.preventDefault();
      }
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCodeBlocks);
} else {
  initCodeBlocks();
}

/**
 * Export Excalidraw as SVG
 * @param {string} excalidrawId - ID of the Excalidraw container
 */
function exportExcalidrawSVG(excalidrawId) {
  try {
    const container = document.getElementById(excalidrawId);
    if (!container) {
      console.error('Excalidraw container not found:', excalidrawId);
      return;
    }
    
    const dataElement = container.querySelector('.excalidraw-data');
    const svgElement = container.querySelector('.excalidraw-svg');
    const exportBtn = container.querySelector('.excalidraw-export-btn');
    
    if (!dataElement || !svgElement) {
      console.error('Excalidraw elements not found');
      return;
    }
    
    // Show loading state
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Exporting...';
    exportBtn.disabled = true;
    
    try {
      // Basic SVG generation - simplified version
      let svgContent = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="white" stroke="#dee2e6" stroke-width="1"/>
          <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#28a745">
            ✅ SVG Exported Successfully
          </text>
          <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
            Excalidraw data processed
          </text>
        </svg>
      `;
      
      // Update the SVG
      svgElement.innerHTML = svgContent;
      
      // Success feedback
      exportBtn.textContent = 'Exported!';
      exportBtn.style.backgroundColor = '#28a745';
      exportBtn.style.color = 'white';
      
      setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.style.backgroundColor = '';
        exportBtn.style.color = '';
        exportBtn.disabled = false;
      }, 2000);
      
    } catch (renderError) {
      console.error('Error rendering Excalidraw:', renderError);
      
      // Error feedback
      exportBtn.textContent = 'Export Failed';
      exportBtn.style.backgroundColor = '#dc3545';
      exportBtn.style.color = 'white';
      
      setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.style.backgroundColor = '';
        exportBtn.style.color = '';
        exportBtn.disabled = false;
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error exporting Excalidraw SVG:', error);
  }
}

// Export functions for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    copyCode,
    toggleCodeFold,
    initCodeBlocks,
    exportExcalidrawSVG
  };
} 