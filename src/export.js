
async function exportAsSVG() {
  // todo first
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
