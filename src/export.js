/**
 * Helper function to generate the combined SVG element from the composition
 * Processes both regular SVG shapes and textured shapes (with applied textures)
 * Textured shapes are exported as SVG patterns that preserve the texture appearance
 * @returns {Object} Object containing the SVG element, width, and height
 */
async function generateCompositionSVG() {
  // Get both grids
  const serifsGrid = document.getElementById('serifsGrid');
  const joinsGrid = document.getElementById('joinsGrid');

  if (!serifsGrid || !joinsGrid) {
    throw new Error('Grid not found. Please ensure the builder is loaded.');
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

      // Also find textured elements (divs with texture applied)
      const texturedElements = cell.querySelectorAll('[data-textured="true"]');

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

      // Process textured elements (divs with textures applied as masks)
      texturedElements.forEach(texturedElement => {
        // Get cell position
        const cellRect = cell.getBoundingClientRect();

        // Calculate position relative to the export SVG
        const x = cellRect.left - minX;
        const y = cellRect.top - minY;

        // Get the computed styles of the textured div
        const computedStyle = window.getComputedStyle(texturedElement);
        const elementWidth = parseFloat(computedStyle.width) || cellRect.width;
        const elementHeight = parseFloat(computedStyle.height) || cellRect.height;

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
            finalX += cellRect.width - elementWidth - rightVal;
          }

          if (top !== 'auto' && top !== '') {
            const topVal = parseFloat(top);
            finalY += topVal;
          } else if (bottom !== 'auto' && bottom !== '') {
            const bottomVal = parseFloat(bottom);
            finalY += cellRect.height - elementHeight - bottomVal;
          }
        }

        // Get texture information from the element
        const textureId = texturedElement.dataset.textureId;

        // Extract the mask SVG from the CSS mask-image property
        const maskImage = computedStyle.webkitMaskImage || computedStyle.maskImage;

        if (maskImage && maskImage.includes('data:image/svg+xml;base64,')) {
          // Extract base64 SVG from mask
          const base64Match = maskImage.match(/data:image\/svg\+xml;base64,([^)'"]+)/);
          if (base64Match) {
            try {
              // Decode the base64 SVG
              const base64Svg = base64Match[1];
              const svgString = decodeURIComponent(escape(atob(base64Svg)));

              // Parse the SVG
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
              const maskSvg = svgDoc.querySelector('svg');

              if (maskSvg) {
                // Create a group for this textured shape
                const shapeGroup = document.createElementNS(svgNS, 'g');
                let transformString = `translate(${finalX}, ${finalY})`;

                // Parse and apply CSS transforms if present
                if (transform && transform !== 'none') {
                  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
                  if (matrixMatch) {
                    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
                    if (values.length === 6) {
                      const translateX = values[4];
                      const translateY = values[5];
                      transformString += ` translate(${translateX}, ${translateY})`;
                    }
                  }
                }

                shapeGroup.setAttribute('transform', transformString);

                // Create defs section for pattern
                const defs = document.createElementNS(svgNS, 'defs');
                const pattern = document.createElementNS(svgNS, 'pattern');
                const patternId = `texture-${textureId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                pattern.setAttribute('id', patternId);
                pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                pattern.setAttribute('width', elementWidth);
                pattern.setAttribute('height', elementHeight);

                // Get texture image URL from background-image
                const bgImage = computedStyle.backgroundImage;
                const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);

                if (urlMatch) {
                  const textureUrl = urlMatch[1];
                  const image = document.createElementNS(svgNS, 'image');
                  image.setAttribute('href', textureUrl);
                  image.setAttribute('width', elementWidth);
                  image.setAttribute('height', elementHeight);
                  image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                  pattern.appendChild(image);
                }

                defs.appendChild(pattern);
                shapeGroup.appendChild(defs);

                // Clone the mask SVG content and apply the texture pattern as fill
                const viewBox = maskSvg.getAttribute('viewBox');
                const nestedSVG = document.createElementNS(svgNS, 'svg');
                nestedSVG.setAttribute('width', elementWidth);
                nestedSVG.setAttribute('height', elementHeight);

                if (viewBox) {
                  nestedSVG.setAttribute('viewBox', viewBox);
                }

                // Clone all paths and shapes from mask, applying the texture pattern
                const maskContent = maskSvg.cloneNode(true);
                const fillableElements = maskContent.querySelectorAll('*');
                fillableElements.forEach(el => {
                  if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
                    el.setAttribute('fill', `url(#${patternId})`);
                  }
                  if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                    el.setAttribute('stroke', `url(#${patternId})`);
                  }
                });

                // If no specific elements have fill, set it on the root
                if (maskContent.children.length > 0) {
                  Array.from(maskContent.children).forEach(child => {
                    nestedSVG.appendChild(child);
                  });
                } else {
                  nestedSVG.innerHTML = maskContent.innerHTML;
                }

                shapeGroup.appendChild(nestedSVG);
                mainGroup.appendChild(shapeGroup);
              }
            } catch (error) {
              console.warn('Failed to process textured element:', error);
            }
          }
        }
      });
    });
  }

  exportSVG.appendChild(mainGroup);

  return { svg: exportSVG, width, height };
}

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
    // Generate the composed SVG
    const { svg: exportSVG } = await generateCompositionSVG();

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
  } catch (error) {
    console.error('SVG export failed:', error);
    alert('Export failed: ' + error.message);
  } finally {
    // Restore original preview mode state
    if (window.setPreviewMode && !wasInPreviewMode) {
      window.setPreviewMode(false);
      document.body.classList.remove('preview-mode');
    }
  }
}

// Export composition as PNG
/**
 * Export the current composition as a PNG file with transparent background
 *
 * This function:
 * 1. Temporarily enables preview mode to hide grid lines and UI elements
 * 2. Uses the SVG generation function to create a composed SVG
 * 3. Converts the SVG to a PNG using an HTML canvas
 * 4. Maintains transparency in the background
 * 5. Downloads the result as a PNG file
 * 6. Restores the original preview mode state
 */
async function exportAsPNG() {
  console.log('Starting PNG export...');

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
    // Generate the composed SVG
    const { svg: exportSVG, width, height } = await generateCompositionSVG();

    // Serialize the SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(exportSVG);

    // Create a blob URL for the SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create an Image element to load the SVG
    const img = new Image();

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });

    // Create a canvas with the same dimensions
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x for higher quality
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');

    // Scale the context to maintain quality
    ctx.scale(scale, scale);

    // Draw the image onto the canvas (canvas starts with transparent background by default)
    ctx.drawImage(img, 0, 0, width, height);

    // Clean up the SVG URL
    URL.revokeObjectURL(svgUrl);

    // Convert canvas to blob
    const pngBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    // Create download link
    const url = URL.createObjectURL(pngBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asemia-composition-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log('PNG export complete!');
  } catch (error) {
    console.error('PNG export failed:', error);
    alert('Export failed: ' + error.message);
  } finally {
    // Restore original preview mode state
    if (window.setPreviewMode && !wasInPreviewMode) {
      window.setPreviewMode(false);
      document.body.classList.remove('preview-mode');
    }
  }
}

/**
 * Export the current composition as a JPEG file with background color
 *
 * This function:
 * 1. Temporarily enables preview mode to hide grid lines and UI elements
 * 2. Uses the SVG generation function to create a composed SVG
 * 3. Detects the current theme (light/dark mode)
 * 4. Converts the SVG to a JPEG using an HTML canvas
 * 5. Fills the background with the current background color
 * 6. Applies the current fill color to the shapes
 * 7. Downloads the result as a JPEG file
 * 8. Restores the original preview mode state
 */
async function exportAsJPEG() {
  console.log('Starting JPEG export...');

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
    // Detect current theme (light or dark mode)
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Get computed styles from body element
    const bodyStyles = window.getComputedStyle(document.body);
    const backgroundColor = isDarkMode ? '#0f172a' : '#ffffff'; // slate-900 : white
    const fillColor = isDarkMode ? '#ffffff' : '#000000'; // white : black

    console.log('Theme:', isDarkMode ? 'dark' : 'light');
    console.log('Background color:', backgroundColor);
    console.log('Fill color:', fillColor);

    // Generate the composed SVG
    const { svg: exportSVG, width, height } = await generateCompositionSVG();

    // Clone the SVG to modify colors
    const clonedSVG = exportSVG.cloneNode(true);

    // Apply fill color to all paths in the SVG
    const allPaths = clonedSVG.querySelectorAll('path, polygon, circle, ellipse, rect, line, polyline');
    allPaths.forEach(element => {
      // Set fill color if the element has a fill attribute or uses default fill
      if (!element.hasAttribute('fill') || element.getAttribute('fill') !== 'none') {
        element.setAttribute('fill', fillColor);
      }
      // Set stroke color if the element has a stroke
      if (element.hasAttribute('stroke') && element.getAttribute('stroke') !== 'none') {
        element.setAttribute('stroke', fillColor);
      }
    });

    // Serialize the modified SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSVG);

    // Create a blob URL for the SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create an Image element to load the SVG
    const img = new Image();

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });

    // Create a canvas with the same dimensions
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x for higher quality
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');

    // Scale the context to maintain quality
    ctx.scale(scale, scale);

    // Fill with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Clean up the SVG URL
    URL.revokeObjectURL(svgUrl);

    // Convert canvas to blob with JPEG format and quality
    const jpegBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95); // 95% quality
    });

    // Create download link
    const url = URL.createObjectURL(jpegBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asemia-composition-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log('JPEG export complete!');
  } catch (error) {
    console.error('JPEG export failed:', error);
    alert('Export failed: ' + error.message);
  } finally {
    // Restore original preview mode state
    if (window.setPreviewMode && !wasInPreviewMode) {
      window.setPreviewMode(false);
      document.body.classList.remove('preview-mode');
    }
  }
}



// Initialize storage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.exportAsPNG = exportAsPNG;
  window.exportAsSVG = exportAsSVG;
  window.exportAsJPEG = exportAsJPEG;

  console.log('Export functionality initialized');
});
