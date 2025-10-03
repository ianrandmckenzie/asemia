/**
 * Export the current composition as an SVG file
 *
 * This function:
 * 1. Temporarily enables preview mode to hide grid lines and UI elements
 * 2. Collects all SVG shapes from both serifs and joins grids
 * 3. Calculates their exact visual positions (including absolute positioning)
 * 4. Combines them into a single SVG document
 * 5. Preserves the exact positioning as seen in preview mode
 * 6. Downloads the result as an SVG file
 * 7. Restores the original preview mode state
 */
async function exportAsSVG() {
  console.log('Starting SVG export...');

  // Store current preview mode state
  const wasInPreviewMode = window.getPreviewMode ? window.getPreviewMode() : false;

  // Enable preview mode for export (hides grid lines, etc.)
  if (window.setPreviewMode && !wasInPreviewMode) {
    window.setPreviewMode(true);
    document.body.classList.add('preview-mode');

    // Wait a brief moment for the preview mode to fully apply
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  try {
    // Get both grids
    const serifsGrid = document.getElementById('serifsGrid');
    const joinsGrid = document.getElementById('joinsGrid');

    if (!serifsGrid || !joinsGrid) {
      alert('Grid not found. Please ensure the builder is loaded.');
      return;
    }

  // Get grid dimensions and positions
  const serifsRect = serifsGrid.getBoundingClientRect();
  const joinsRect = joinsGrid.getBoundingClientRect();

  // Calculate the bounding box for the entire composition
  const minX = Math.min(serifsRect.left, joinsRect.left);
  const minY = Math.min(serifsRect.top, joinsRect.top);
  const maxX = Math.max(serifsRect.right, joinsRect.right);
  const maxY = Math.max(serifsRect.bottom, joinsRect.bottom);

  const width = maxX - minX;
  const height = maxY - minY;

  // Create SVG container with proper namespace
  const svgNS = 'http://www.w3.org/2000/svg';
  const exportSVG = document.createElementNS(svgNS, 'svg');
  exportSVG.setAttribute('xmlns', svgNS);
  exportSVG.setAttribute('viewBox', `0 0 ${width} ${height}`);
  exportSVG.setAttribute('width', width);
  exportSVG.setAttribute('height', height);

  // Create a group for all shapes
  const mainGroup = document.createElementNS(svgNS, 'g');

  // Process both grids
  const grids = [
    { element: serifsGrid, rect: serifsRect, name: 'serifs' },
    { element: joinsGrid, rect: joinsRect, name: 'joins' }
  ];

  for (const grid of grids) {
    const cells = grid.element.querySelectorAll('.grid-cell');

    cells.forEach((cell, index) => {
      // Find SVG elements within the cell
      const svgElements = cell.querySelectorAll('svg');

      svgElements.forEach(svgElement => {
        // Clone the SVG element
        const clonedSVG = svgElement.cloneNode(true);

        // Get cell position
        const cellRect = cell.getBoundingClientRect();

        // Calculate position relative to the export SVG
        const x = cellRect.left - minX;
        const y = cellRect.top - minY;

        // Get the computed styles of the original SVG
        const computedStyle = window.getComputedStyle(svgElement);
        const svgWidth = parseFloat(computedStyle.width) || cellRect.width;
        const svgHeight = parseFloat(computedStyle.height) || cellRect.height;

        // Get positioning styles
        const position = computedStyle.position;
        const top = computedStyle.top;
        const left = computedStyle.left;
        const right = computedStyle.right;
        const bottom = computedStyle.bottom;
        const transform = computedStyle.transform;

        // Calculate actual position considering absolute positioning within cell
        let finalX = x;
        let finalY = y;

        if (position === 'absolute') {
          if (left !== 'auto' && left !== '') {
            const leftVal = parseFloat(left);
            finalX += leftVal;
          } else if (right !== 'auto' && right !== '') {
            const rightVal = parseFloat(right);
            finalX += cellRect.width - svgWidth - rightVal;
          }

          if (top !== 'auto' && top !== '') {
            const topVal = parseFloat(top);
            finalY += topVal;
          } else if (bottom !== 'auto' && bottom !== '') {
            const bottomVal = parseFloat(bottom);
            finalY += cellRect.height - svgHeight - bottomVal;
          }
        }

        // Create a group for this shape with transform
        const shapeGroup = document.createElementNS(svgNS, 'g');
        let transformString = `translate(${finalX}, ${finalY})`;

        // Parse and apply CSS transforms if present
        if (transform && transform !== 'none') {
          // Extract translate values from matrix
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
            if (values.length === 6) {
              // matrix(a, b, c, d, e, f) where e and f are translateX and translateY
              const translateX = values[4];
              const translateY = values[5];
              transformString += ` translate(${translateX}, ${translateY})`;
            }
          }
        }

        shapeGroup.setAttribute('transform', transformString);

        // Get the inner content of the SVG (paths, etc.)
        const svgContent = clonedSVG.innerHTML;

        // Get viewBox from original SVG
        const viewBox = clonedSVG.getAttribute('viewBox');

        if (viewBox) {
          // Create a nested SVG to preserve the viewBox
          const nestedSVG = document.createElementNS(svgNS, 'svg');
          nestedSVG.setAttribute('viewBox', viewBox);
          nestedSVG.setAttribute('width', svgWidth);
          nestedSVG.setAttribute('height', svgHeight);
          nestedSVG.innerHTML = svgContent;
          shapeGroup.appendChild(nestedSVG);
        } else {
          // Just create a group with the content
          const contentGroup = document.createElementNS(svgNS, 'g');
          contentGroup.innerHTML = svgContent;
          shapeGroup.appendChild(contentGroup);
        }

        mainGroup.appendChild(shapeGroup);
      });
    });
  }

  exportSVG.appendChild(mainGroup);

  // Serialize the SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(exportSVG);

  // Create blob and download
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `asemia-composition-${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);

  console.log('SVG export complete!');
  } finally {
    // Restore original preview mode state
    if (window.setPreviewMode && !wasInPreviewMode) {
      window.setPreviewMode(false);
      document.body.classList.remove('preview-mode');
    }
  }
}

// Export composition as PNG
async function exportAsPNG() {
  // todo
}



// Initialize storage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.exportAsPNG = exportAsPNG;
  window.exportAsSVG = exportAsSVG;

  console.log('Export functionality initialized');
});
