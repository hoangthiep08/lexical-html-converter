# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.1] - 2025-06-26

### Security
- **CRITICAL:** Fixed XSS vulnerability in code block enhancement
- Replaced dangerous `innerHTML` usage with safe DOM methods
- Added input sanitization for user-controlled data (language names, code IDs)
- Implemented HTML escaping function to prevent script injection

### Fixed
- Enhanced code block copy/fold buttons visibility and functionality
- Fixed default text styling for elements without explicit styles
- Improved text alignment handling for right-aligned content
- Fixed Excalidraw SVG auto-rendering with correct dimensions
- Fixed tooltip positioning and removed duplicate tooltips
- Enhanced line numbers display in code blocks (001-030 format)
- Removed unused functions to eliminate Codacy warnings

### Changed
- Translated all Vietnamese comments to English for better international support
- Improved build process to properly include CSS and JavaScript assets
- Enhanced UI/UX for code blocks with always-visible controls
- Simplified Excalidraw display by removing unnecessary UI elements

### Technical
- Fixed TypeScript compilation issues with ConversionResult type
- Updated build script to automatically copy static assets
- Improved error handling in various converter methods
- Enhanced CSS styling for better cross-browser compatibility
- Implemented secure DOM manipulation practices

## [1.1.0] - 2025-06-25

### Added
- Enhanced code blocks with copy and fold functionality
- Interactive JavaScript utilities for code manipulation
- Excalidraw support with SVG rendering
- Text alignment support (left, center, right, justify)
- Line numbers for code blocks
- Comprehensive CSS styling system

### Features
- Copy to clipboard functionality for code blocks
- Collapsible code blocks with fold/unfold
- Auto-rendered Excalidraw drawings as SVG
- Enhanced UI with tooltips and visual feedback
- Support for multiple programming languages
- Responsive design for various screen sizes

## [1.0.0] - 2025-06-20

### Added
- Initial release
- Basic Lexical JSON to HTML conversion
- Support for common node types (paragraphs, headings, lists, etc.)
- TypeScript support with full type definitions
- Modular converter architecture 