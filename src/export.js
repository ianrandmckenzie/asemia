/**
 * Helper function to convert an image URL to a data URL
 * This ensures textures are embedded in exported SVGs and work in PNG/JPG exports
 * @param {string} url - The image URL to convert
 * @returns {Promise<string>} The data URL representation of the image
 */
async function imageUrlToDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        // If toDataURL fails (CORS issue), fall back to original URL
        console.warn('Failed to convert image to data URL:', error);
        resolve(url);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image:', url);
      resolve(url); // Fall back to original URL
    };

    img.src = url;
  });
}

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

  // Detect the scale factor applied to the grids
  // Look for a parent wrapper element that has transform: scale() applied
  let scaleFactor = 1;
  let gridWrapper = serifsGrid.parentElement;

  // Traverse up to find an element with a scale transform
  while (gridWrapper && gridWrapper !== document.body) {
    const computedStyle = window.getComputedStyle(gridWrapper);
    const transform = computedStyle.transform;

    if (transform && transform !== 'none') {
      // Extract scale from matrix or scale transform
      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (values.length >= 6) {
          // matrix(a, b, c, d, e, f) where a is scaleX
          scaleFactor = values[0];
          console.log(`Detected grid scale factor: ${scaleFactor}`);
          break;
        }
      }
    }
    gridWrapper = gridWrapper.parentElement;
  }

  // Use the hardcoded grid dimensions from the HTML
  // These are the actual unscaled dimensions
  const serifsWidth = 500;
  const serifsHeight = 500;
  const joinsWidth = 400;
  const joinsHeight = 400;

  // Get the position offsets of the joins grid (from inline styles)
  const joinsStyle = window.getComputedStyle(joinsGrid);
  const joinsTop = parseFloat(joinsStyle.top) || 50;
  const joinsLeft = parseFloat(joinsStyle.left) || 50;

  // Calculate the bounding box for the entire composition
  // Using actual unscaled dimensions
  const minX = 0;
  const minY = 0;
  const maxX = Math.max(serifsWidth, joinsLeft + joinsWidth);
  const maxY = Math.max(serifsHeight, joinsTop + joinsHeight);

  const width = maxX - minX;
  const height = maxY - minY;

  // Get bounding rects for position calculations
  const serifsRect = serifsGrid.getBoundingClientRect();
  const joinsRect = joinsGrid.getBoundingClientRect();

  // Calculate reference positions in scaled screen coordinates
  const screenMinX = Math.min(serifsRect.left, joinsRect.left);
  const screenMinY = Math.min(serifsRect.top, joinsRect.top);

  console.log(`Export debug info:
    - Scale factor: ${scaleFactor}
    - Serifs grid: ${serifsWidth}x${serifsHeight}
    - Joins grid: ${joinsWidth}x${joinsHeight} at (${joinsLeft}, ${joinsTop})
    - Export dimensions: ${width}x${height}
    - Serifs screen rect: ${serifsRect.width}x${serifsRect.height}
    - Joins screen rect: ${joinsRect.width}x${joinsRect.height}
    - Screen reference: (${screenMinX}, ${screenMinY})
  `);

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

    for (const cell of cells) {
      // Find SVG elements within the cell
      const svgElements = cell.querySelectorAll('svg');

      // Also find textured elements (divs with texture applied)
      const texturedElements = cell.querySelectorAll('[data-textured="true"]');

      for (const svgElement of svgElements) {
        // Clone the SVG element
        const clonedSVG = svgElement.cloneNode(true);

        // Get cell position
        const cellRect = cell.getBoundingClientRect();

        // Calculate position relative to the export SVG
        // Convert from scaled screen coordinates to actual SVG coordinates
        const x = (cellRect.left - screenMinX) / scaleFactor;
        const y = (cellRect.top - screenMinY) / scaleFactor;

        // Get the computed styles of the original SVG
        const computedStyle = window.getComputedStyle(svgElement);
        // These CSS values are NOT affected by parent scale transforms
        const svgWidth = parseFloat(computedStyle.width) || 100;
        const svgHeight = parseFloat(computedStyle.height) || 100;

        console.log(`Shape export - Cell screen: (${cellRect.left}, ${cellRect.top}), ${cellRect.width}x${cellRect.height}, Computed SVG: ${computedStyle.width}x${computedStyle.height}, Final pos: (${x}, ${y}), Size: ${svgWidth}x${svgHeight}`);

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

        // Cell dimensions are fixed: 100px x 100px for both grids
        const cellWidth = 100;
        const cellHeight = 100;

        if (position === 'absolute') {
          if (left !== 'auto' && left !== '') {
            const leftVal = parseFloat(left);
            finalX += leftVal;
          } else if (right !== 'auto' && right !== '') {
            const rightVal = parseFloat(right);
            finalX += cellWidth - svgWidth - rightVal;
          }

          if (top !== 'auto' && top !== '') {
            const topVal = parseFloat(top);
            finalY += topVal;
          } else if (bottom !== 'auto' && bottom !== '') {
            const bottomVal = parseFloat(bottom);
            finalY += cellHeight - svgHeight - bottomVal;
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
      }

      // Process textured elements (divs with textures applied as masks)
      for (const texturedElement of texturedElements) {
        // Get cell position
        const cellRect = cell.getBoundingClientRect();

        // Calculate position relative to the export SVG
        // Convert from scaled screen coordinates to actual SVG coordinates
        const x = (cellRect.left - screenMinX) / scaleFactor;
        const y = (cellRect.top - screenMinY) / scaleFactor;

        // Get the computed styles of the textured div
        const computedStyle = window.getComputedStyle(texturedElement);
        // These CSS values are NOT affected by parent scale transforms
        const elementWidth = parseFloat(computedStyle.width) || 100;
        const elementHeight = parseFloat(computedStyle.height) || 100;

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

        // Cell dimensions are fixed: 100px x 100px for both grids
        const cellWidth = 100;
        const cellHeight = 100;

        if (position === 'absolute') {
          if (left !== 'auto' && left !== '') {
            const leftVal = parseFloat(left);
            finalX += leftVal;
          } else if (right !== 'auto' && right !== '') {
            const rightVal = parseFloat(right);
            finalX += cellWidth - elementWidth - rightVal;
          }

          if (top !== 'auto' && top !== '') {
            const topVal = parseFloat(top);
            finalY += topVal;
          } else if (bottom !== 'auto' && bottom !== '') {
            const bottomVal = parseFloat(bottom);
            finalY += cellHeight - elementHeight - bottomVal;
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
                  let textureUrl = urlMatch[1];

                  // Convert relative URL to absolute URL
                  if (textureUrl.startsWith('/')) {
                    textureUrl = window.location.origin + textureUrl;
                  } else if (!textureUrl.startsWith('http') && !textureUrl.startsWith('data:')) {
                    // Handle relative paths without leading slash
                    textureUrl = new URL(textureUrl, window.location.href).href;
                  }

                  // Convert texture to data URL for embedding
                  try {
                    textureUrl = await imageUrlToDataUrl(textureUrl);
                  } catch (error) {
                    console.warn('Failed to convert texture to data URL, using absolute URL:', error);
                  }

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

                // Apply texture pattern to all shape elements
                const fillableElements = maskContent.querySelectorAll('path, polygon, circle, ellipse, rect, line, polyline');
                fillableElements.forEach(el => {
                  // Apply pattern to fill if element has a fill (including default fill)
                  if (!el.hasAttribute('fill') || (el.getAttribute('fill') !== 'none' && el.getAttribute('fill') !== '')) {
                    el.setAttribute('fill', `url(#${patternId})`);
                  }
                  // Apply pattern to stroke if element has a stroke
                  if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none' && el.getAttribute('stroke') !== '') {
                    el.setAttribute('stroke', `url(#${patternId})`);
                  }
                });

                // If no fillable elements were found, try to apply to the SVG root
                if (fillableElements.length === 0) {
                  // Apply fill to all direct children
                  Array.from(maskContent.children).forEach(child => {
                    if (child.nodeName !== 'defs' && child.nodeName !== 'style') {
                      child.setAttribute('fill', `url(#${patternId})`);
                    }
                  });
                }

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
      }
    }
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

    // Apply fill color to all paths in the SVG, but preserve texture patterns
    const allPaths = clonedSVG.querySelectorAll('path, polygon, circle, ellipse, rect, line, polyline');
    allPaths.forEach(element => {
      const currentFill = element.getAttribute('fill');
      const currentStroke = element.getAttribute('stroke');

      // Only change fill if it's not already a pattern (texture)
      if (!currentFill || (currentFill !== 'none' && !currentFill.startsWith('url(#'))) {
        element.setAttribute('fill', fillColor);
      }
      // Only change stroke if it's not already a pattern (texture) and has a stroke
      if (currentStroke && currentStroke !== 'none' && !currentStroke.startsWith('url(#')) {
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
