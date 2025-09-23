/**
 * SVG insertion utility for Asemia
 * Provides functions to insert SVG strings from rules.json
 */

let rulesData = null;
let isInitialized = false;

/**
 * Load rules.json data
 */
async function loadRulesData() {
  if (rulesData) return rulesData;

  try {
    const response = await fetch('/assets/rules.json');
    rulesData = await response.json();
    return rulesData;
  } catch (error) {
    console.error('Failed to load rules.json:', error);
    return null;
  }
}

/**
 * Get SVG string from rules.json by path
 * @param {string} category - 'bodies', 'serifs', or 'joins'
 * @param {string} angle - angle key like '0_deg', '45_deg', etc.
 * @param {string} shapeName - shape name like 'horizontal', 'top', etc.
 * @returns {string|null} SVG string or null if not found
 */
function getSVGByPath(category, angle, shapeName) {
  if (!rulesData?.shapes?.[category]?.[angle]) {
    console.warn(`SVG not found: ${category}/${angle}/${shapeName}`);
    return null;
  }

  const shapes = rulesData.shapes[category][angle];
  const shape = shapes.find(s => s.shape_name === shapeName);

  if (!shape) {
    console.warn(`Shape not found: ${shapeName} in ${category}/${angle}`);
    console.log('Available shapes:', shapes.map(s => s.shape_name));
    return null;
  }

  return shape.svg;
}

/**
 * Get SVG string from rules.json by file path
 * Parses paths like '/assets/shapes/bodies/0_deg/horizontal.svg'
 * @param {string} filePath - SVG file path
 * @returns {string|null} SVG string or null if not found
 */
function getSVGByFilePath(filePath) {
  // Parse path like '/assets/shapes/bodies/0_deg/horizontal.svg'
  const match = filePath.match(/\/assets\/shapes\/([^/]+)\/([^/]+)\/([^.]+)\.svg/);

  if (!match) {
    console.warn('Invalid SVG path format:', filePath);
    return null;
  }

  const [, category, angle, shapeName] = match;
  return getSVGByPath(category, angle, shapeName);
}

/**
 * Insert SVG into an element by replacing its content
 * @param {HTMLElement} element - Target element
 * @param {string} category - 'bodies', 'serifs', or 'joins'
 * @param {string} angle - angle key like '0_deg', '45_deg', etc.
 * @param {string} shapeName - shape name like 'horizontal', 'top', etc.
 * @param {string} classes - CSS classes to apply to the SVG
 * @returns {boolean} True if successful, false otherwise
 */
function insertSVG(element, category, angle, shapeName, classes = '') {
  const svgString = getSVGByPath(category, angle, shapeName);

  if (!svgString) {
    return false;
  }

  // Create a temporary element to parse the SVG
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgString;
  const svgElement = tempDiv.querySelector('svg');

  if (!svgElement) {
    console.error('Invalid SVG string:', svgString.substring(0, 100) + '...');
    return false;
  }

  // Apply classes if provided
  if (classes) {
    svgElement.setAttribute('class', classes);
  }

  // Clear the element and insert the SVG
  element.innerHTML = '';
  element.appendChild(svgElement);

  return true;
}

/**
 * Insert SVG by file path
 * @param {HTMLElement} element - Target element
 * @param {string} filePath - SVG file path like '/assets/shapes/bodies/0_deg/horizontal.svg'
 * @param {string} classes - CSS classes to apply to the SVG
 * @returns {boolean} True if successful, false otherwise
 */
function insertSVGByFilePath(element, filePath, classes = '') {
  const svgString = getSVGByFilePath(filePath);

  if (!svgString) {
    return false;
  }

  // Create a temporary element to parse the SVG
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgString;
  const svgElement = tempDiv.querySelector('svg');

  if (!svgElement) {
    console.error('Invalid SVG string:', svgString.substring(0, 100) + '...');
    return false;
  }

  // Apply classes if provided
  if (classes) {
    svgElement.setAttribute('class', classes);
  }

  // Clear the element and insert the SVG
  element.innerHTML = '';
  element.appendChild(svgElement);

  return true;
}

/**
 * Create and return an SVG element
 * @param {string} category - 'bodies', 'serifs', or 'joins'
 * @param {string} angle - angle key like '0_deg', '45_deg', etc.
 * @param {string} shapeName - shape name like 'horizontal', 'top', etc.
 * @param {string} classes - CSS classes to apply to the SVG
 * @returns {SVGElement|null} SVG element or null if not found
 */
function createSVGElement(category, angle, shapeName, classes = '') {
  const svgString = getSVGByPath(category, angle, shapeName);

  if (!svgString) {
    return null;
  }

  // Create a temporary element to parse the SVG
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgString;
  const svgElement = tempDiv.querySelector('svg');

  if (!svgElement) {
    console.error('Invalid SVG string:', svgString.substring(0, 100) + '...');
    return null;
  }

  // Apply classes if provided
  if (classes) {
    svgElement.setAttribute('class', classes);
  }

  return svgElement;
}

/**
 * Create SVG element by file path
 * @param {string} filePath - SVG file path like '/assets/shapes/bodies/0_deg/horizontal.svg'
 * @param {string} classes - CSS classes to apply to the SVG
 * @returns {SVGElement|null} SVG element or null if not found
 */
function createSVGElementByFilePath(filePath, classes = '') {
  const svgString = getSVGByFilePath(filePath);

  if (!svgString) {
    return null;
  }

  // Create a temporary element to parse the SVG
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgString;
  const svgElement = tempDiv.querySelector('svg');

  if (!svgElement) {
    console.error('Invalid SVG string:', svgString.substring(0, 100) + '...');
    return null;
  }

  // Apply classes if provided
  if (classes) {
    svgElement.setAttribute('class', classes);
  }

  return svgElement;
}

/**
 * Initialize SVG system - loads rules.json and sets up any automatic replacements
 */
async function initSVGSystem() {
  if (isInitialized) return;

  try {
    await loadRulesData();
    isInitialized = true;
    console.log('SVG system initialized with rules data');

    // Auto-replace any img tags with data-svg-replace attribute
    document.querySelectorAll('img[data-svg-replace]').forEach(img => {
      const filePath = img.getAttribute('data-svg-replace') || img.src;
      const classes = img.className;
      const alt = img.alt;

      const svgElement = createSVGElementByFilePath(filePath, classes);
      if (svgElement && alt) {
        svgElement.setAttribute('aria-label', alt);
      }

      if (svgElement) {
        img.parentNode.replaceChild(svgElement, img);
      }
    });

    // Notify that SVG system is ready
    window.dispatchEvent(new CustomEvent('svgSystemReady'));
  } catch (error) {
    console.error('Failed to initialize SVG system:', error);
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSVGSystem);
} else {
  initSVGSystem();
}

// Functions are made available globally via window.SVGUtils below
// No ES6 exports needed since this is loaded as a regular script

/**
 * Check if SVG system is ready (rules.json loaded)
 */
function isReady() {
  return isInitialized && rulesData !== null;
}

// Also make available globally for non-module usage
window.SVGUtils = {
  loadRulesData,
  getSVGByPath,
  getSVGByFilePath,
  insertSVG,
  insertSVGByFilePath,
  createSVGElement,
  createSVGElementByFilePath,
  initSVGSystem,
  isReady
};

// Make sure window.SVGUtils is available immediately
console.log('SVGUtils loaded and available on window.SVGUtils');
