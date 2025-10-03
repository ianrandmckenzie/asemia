

// Export composition as PNG
async function exportAsPNG() {
  try {
    // Get the grids wrapper element
    const gridsWrapper = document.querySelector('.builder-grids-wrapper');
    if (!gridsWrapper) {
      showNotification('No grids found to export', 'error');
      return;
    }

    // Show notification that export is in progress
    showNotification('Generating PNG...', 'info');

    // Get the current dimensions of the grids wrapper
    const serifsGrid = document.getElementById('serifsGrid');
    const joinsGrid = document.getElementById('joinsGrid');

    if (!serifsGrid || !joinsGrid) {
      showNotification('Grids not properly initialized', 'error');
      return;
    }

    // Temporarily set overflow visible on all cells to prevent clipping
    const allCells = document.querySelectorAll('.grid-cell');
    const originalOverflows = [];
    allCells.forEach(cell => {
      originalOverflows.push(cell.style.overflow);
      cell.style.overflow = 'visible';
    });

    // Wait a moment for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 50));

    // Calculate the bounding box that contains both grids
    // Serifs grid is 500x500, joins grid is 400x400 offset by 50px
    const contentWidth = 500;
    const contentHeight = 500;
    const padding = 50;

    // Total canvas dimensions with padding
    const canvasWidth = contentWidth + (padding * 2);
    const canvasHeight = contentHeight + (padding * 2);

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Fill with background color (check for dark mode)
    const isDarkMode = document.body.classList.contains('dark') ||
                       document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff'; // slate-900 or white
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Helper function to render shapes from a grid
    const renderGrid = async (grid, offsetX, offsetY) => {
      const cells = grid.querySelectorAll('.grid-cell');

      for (const cell of cells) {
        const svg = cell.querySelector('svg');
        if (!svg) continue;

        // Get the SVG's actual bounding box (now includes overflow since we set overflow:visible)
        const svgRect = svg.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();

        // Calculate position relative to the grid
        const x = padding + offsetX + (svgRect.left - gridRect.left);
        const y = padding + offsetY + (svgRect.top - gridRect.top);

        // Clone and serialize the SVG
        const svgClone = svg.cloneNode(true);
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Load and draw the SVG
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, x, y, svgRect.width, svgRect.height);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG'));
          };
          img.src = url;
        });
      }
    };

    // Draw the serifs grid (5x5, starts at 0,0)
    await renderGrid(serifsGrid, 0, 0);

    // Draw the joins grid (4x4, offset by 50px from serifs grid)
    await renderGrid(joinsGrid, 50, 50);

    // Restore original overflow values
    allCells.forEach((cell, index) => {
      cell.style.overflow = originalOverflows[index];
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
      a.download = `asemia_composition_${timestamp}.png`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('PNG exported successfully', 'success');
    }, 'image/png');

  } catch (error) {
    console.error('Export failed:', error);
    showNotification('Failed to export PNG: ' + error.message, 'error');
  }
}



// Initialize storage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.exportAsPNG = exportAsPNG;

  console.log('Export functionality initialized');
});
