// Excalidraw to SVG Renderer
function renderExcalidrawToSVG(excalidrawData) {
  try {
    const data = JSON.parse(excalidrawData);
    const elements = data.elements || [];
    
    if (elements.length === 0) {
      return '<div class="excalidraw-empty">Không có nội dung vẽ</div>';
    }

    // Tính toán bounds từ tất cả elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      if (element.isDeleted) return;
      
      const { x, y, width, height } = element;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + (width || 0));
      maxY = Math.max(maxY, y + (height || 0));
    });

    // Thêm padding nhỏ
    const padding = 10;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const svgWidth = maxX - minX;
    const svgHeight = maxY - minY;
    
    // Giới hạn kích thước tối đa để không quá lớn
    const maxDisplayWidth = 600;
    const maxDisplayHeight = 400;
    
    let displayWidth = svgWidth;
    let displayHeight = svgHeight;
    
    // Scale down nếu quá lớn
    if (svgWidth > maxDisplayWidth || svgHeight > maxDisplayHeight) {
      const scaleX = maxDisplayWidth / svgWidth;
      const scaleY = maxDisplayHeight / svgHeight;
      const scale = Math.min(scaleX, scaleY);
      
      displayWidth = svgWidth * scale;
      displayHeight = svgHeight * scale;
    }

    let svgElements = '';
    
    elements.forEach(element => {
      if (element.isDeleted) return;
      
      const x = element.x - minX;
      const y = element.y - minY;
      
      switch (element.type) {
        case 'rectangle':
          svgElements += `
            <rect 
              x="${x}" 
              y="${y}" 
              width="${element.width}" 
              height="${element.height}" 
              fill="none" 
              stroke="${element.strokeColor || '#000'}" 
              stroke-width="${element.strokeWidth || 1}"
              rx="${element.roundness && element.roundness.type === 3 ? 8 : 0}"
            />`;
          break;
          
        case 'freedraw':
          if (element.points && element.points.length > 0) {
            const pathData = element.points.map((point, index) => {
              const [px, py] = point;
              return `${index === 0 ? 'M' : 'L'} ${x + px} ${y + py}`;
            }).join(' ');
            
            svgElements += `
              <path 
                d="${pathData}" 
                fill="none" 
                stroke="${element.strokeColor || '#000'}" 
                stroke-width="${element.strokeWidth || 1}"
                stroke-linecap="round"
                stroke-linejoin="round"
              />`;
          }
          break;
          
        case 'ellipse':
          const rx = element.width / 2;
          const ry = element.height / 2;
          const cx = x + rx;
          const cy = y + ry;
          
          svgElements += `
            <ellipse 
              cx="${cx}" 
              cy="${cy}" 
              rx="${rx}" 
              ry="${ry}" 
              fill="none" 
              stroke="${element.strokeColor || '#000'}" 
              stroke-width="${element.strokeWidth || 1}"
            />`;
          break;
          
        case 'line':
          if (element.points && element.points.length >= 2) {
            const [startPoint, endPoint] = element.points;
            svgElements += `
              <line 
                x1="${x + startPoint[0]}" 
                y1="${y + startPoint[1]}" 
                x2="${x + endPoint[0]}" 
                y2="${y + endPoint[1]}" 
                stroke="${element.strokeColor || '#000'}" 
                stroke-width="${element.strokeWidth || 1}"
              />`;
          }
          break;
      }
    });

    return `
      <div class="excalidraw-container" style="max-width: ${displayWidth}px; max-height: ${displayHeight}px;">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 ${svgWidth} ${svgHeight}" 
          style="border: 1px solid #e0e0e0; border-radius: 8px; background: white;"
          preserveAspectRatio="xMidYMid meet"
        >
          ${svgElements}
        </svg>
      </div>`;
    
  } catch (error) {
    console.error('Lỗi khi render Excalidraw:', error);
    return '<div class="excalidraw-error">Không thể hiển thị bản vẽ</div>';
  }
}

module.exports = { renderExcalidrawToSVG }; 