// Builder - Shared typographic grid builder UI and logic
// This module handles grid creation, shape placement, and UI interactions
// Used by both free builder and constrained builder

// Load rules and shapes data
let rulesData = null;
let selectedShape = null;
let currentTab = 'bodies';
let previewMode = false;

// Configuration object for shape styling and positioning
const shapeConfig = {
  sizing: {
    // Multi-cell shapes
    '2x1': 'max-w-[200%] max-h-full',
    '1x2': 'max-w-full max-h-[200%]',
    // Special join cases
    'join_112_5_2x1': 'max-w-[200%] max-h-[200%]',
    'join_112_5_1x2': 'max-w-[200%] max-h-[200%]',
    // Special serif cases
    'serif_22_5_side': 'max-w-full max-h-[200%]',
    'serif_22_5_regular': 'max-w-[200%] max-h-full',
    'serif_45_regular': 'max-h-full w-auto',
    'serif_45_side': 'w-full h-auto max-h-[200%]',
    // 1x1 cases
    'body_1x1': 'max-w-[120%] max-h-[120%]',
    'join_1x1': 'max-w-[110%] max-h-[110%]',
    // Default
    'default': 'max-w-full max-h-full'
  },

  positioning: {
    // Join positioning (multi-cell)
    joins: {
      '2x1': {
        '67_5_deg': {
          top: { vertical: 'bottom: 28%', horizontal: { right: 'right: -5%', left: 'left: -5%' }},
          bottom: { vertical: 'top: 28%', horizontal: { right: 'right: -5%', left: 'left: -5%' }}
        },
        '112_5_deg': {
          top: { vertical: 'bottom: 27%', horizontal: { right: 'left: -45%', left: 'right: -45%' }},
          bottom: { vertical: 'top: 27%', horizontal: { right: 'left: -45%', left: 'right: -45%' }}
        },
        '135_deg': {
          top: { vertical: 'bottom: 5%', horizontal: { right: 'left: -4.5%', left: 'right: -4.5%' }},
          bottom: { vertical: 'top: 5%', horizontal: { right: 'left: -4.5%', left: 'right: -4.5%' }}
        },
        default: {
          top: { vertical: 'bottom: 5%', horizontal: { right: 'left: -17.5%', left: 'right: -17.5%' }},
          bottom: { vertical: 'top: 5%', horizontal: { right: 'left: -17.5%', left: 'right: -17.5%' }}
        }
      },
      '1x2': {
        '67_5_deg': {
          top: { vertical: 'top: -5%', horizontal: { left: 'right: 25%', right: 'left: 25%' }},
          bottom: { vertical: 'bottom: -5%', horizontal: { left: 'right: 25%', right: 'left: 25%' }}
        },
        '112_5_deg': {
          top: { vertical: 'top: 27%', horizontal: { left: 'left: 5%', right: 'right: -45%' }},
          bottom: { vertical: 'bottom: 27%', horizontal: { left: 'left: 5%', right: 'right: -45%' }}
        },
        '135_deg': {
          top: { vertical: 'bottom: -4.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }},
          bottom: { vertical: 'top: -4.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }}
        },
        default: {
          top: { vertical: 'bottom: -17.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }},
          bottom: { vertical: 'top: -17.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }}
        }
      },
      '1x1': {
        '45_deg': {
          top: { vertical: 'top: -5%', horizontal: { left: 'left: 0%', right: 'right: 0%' } },
          bottom: { vertical: 'bottom: -5%', horizontal: { left: 'left: 0%', right: 'right: 0%' } }
        },
        '90_deg': {
          top: { vertical: 'top: -5%', horizontal: { left: 'left: 0%', right: 'right: 0%' } },
          bottom: { vertical: 'bottom: -5%', horizontal: { left: 'left: 0%', right: 'right: 0%' } }
        }
      }
    },

    // Serif positioning
    serifs: {
      '22_5_deg': {
        // Special named serifs
        'br_to_tl': {
          type: 'special',
          right: '-24.5%',
          vertical: {
            top: { top: '0' },
            bottom: { bottom: '0' },
            center: { top: '50%', transform: 'translateY(-50%)' }
          }
        },
        'tr_to_bl': {
          type: 'special',
          right: '-24.5%',
          vertical: {
            top: { top: '0' },
            bottom: { bottom: '0' },
            center: { top: '50%', transform: 'translateY(-50%)' }
          }
        },
        'bl_to_tr': {
          type: 'special',
          left: '-24.5%',
          vertical: {
            top: { top: '0' },
            bottom: { bottom: '0' },
            center: { top: '50%', transform: 'translateY(-50%)' }
          }
        },
        'tl_to_br': {
          type: 'special',
          left: '-24.5%',
          vertical: {
            top: { top: '0' },
            bottom: { bottom: '0' },
            center: { top: '50%', transform: 'translateY(-50%)' }
          }
        },
        // Side serifs (contains 'top' or 'bottom' in orientation)
        side: {
          type: 'side',
          bottom: { top: '-24.5%', right: '0', maxHeight: '200%' },
          top: { bottom: '-24.5%', left: '0', maxHeight: '200%' },
          default: { top: '0' },
          horizontal: {
            left: { left: '0' },
            right: { right: '0' },
            center: { left: '50%', transform: 'translateX(-50%)' }
          }
        },
        // Regular 22.5° serifs
        regular: {
          type: 'regular',
          horizontal: {
            right: { left: '-25%', maxWidth: '200%' },
            left: { right: '-25%', maxWidth: '200%' },
            default: { left: '0' }
          },
          vertical: {
            top: { top: '0' },
            bottom: { bottom: '0' },
            center: { top: '50%', transform: 'translateY(-50%)' }
          }
        }
      },
      '45_deg': {
        'tl_to_br': { right: '3%' },
        'bl_to_tr': { right: '3%' },
        'tr_to_bl': { left: '3%' },
        'br_to_tl': { left: '3%' },
        vertical: {
          top: { top: '0' },
          bottom: { bottom: '0' },
          center: { top: '50%', transform: 'translateY(-50%)' }
        }
      }
    },

    // Bodies positioning and multi-cell non-join shapes
    bodies: {
      '2x1': {
        type: 'topLeft'
      },
      '1x2': {
        type: 'topLeft'
      },
      '1x1': {
        type: 'standard'
      }
    },

    // Standard positioning for most shapes
    standard: {
      vertical: {
        top: {
          top: '0',
          transform: { center: 'translateX(-50%)', default: '' }
        },
        center: {
          top: '50%',
          transform: { center: 'translate(-50%, -50%)', default: 'translateY(-50%)' }
        },
        bottom: {
          bottom: '0',
          transform: { center: 'translateX(-50%)', default: '' }
        }
      },
      horizontal: {
        left: { left: '0' },
        center: { left: '50%' },
        right: { right: '0' }
      }
    }
  }
};

// Initialize the builder application
async function initBuilder() {
  await loadRules();
  createGrids();
  setupSidebar();
  setupTabSwitching();
  setupClearSelection();
  setupPreviewToggle();
  updateGridLayers();

  // Make necessary functions globally accessible for constrained builder and save/load
  window.getCellPosition = getCellPosition;
  window.getCellByPosition = getCellByPosition;
  window.getOccupiedCells = getOccupiedCells;
  window.clearCellHighlights = clearCellHighlights;
  window.placeShapeInCell = placeShapeInCell;
  window.rulesData = rulesData;

  // Make selectedShape accessible via a getter function since it changes
  window.getSelectedShape = () => selectedShape;
  window.handleGridCellClick = handleGridCellClick;
  window.handleGridCellRightClick = handleGridCellRightClick;
  window.handleGridCellLeave = handleGridCellLeave;

  console.log('Builder functions made globally accessible');
}

// Load the rules.json file
async function loadRules() {
  try {
    const response = await fetch('./assets/rules.json');
    rulesData = await response.json();
  } catch (error) {
    console.error('Failed to load rules.json:', error);
  }
}

// Create the grid cells
function createGrids() {
  createSerifsGrid();
  createJoinsGrid();
}

// Create 5x5 serifs grid
function createSerifsGrid() {
  const serifsGrid = document.getElementById('serifsGrid');
  serifsGrid.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'w-[100px] h-[100px] relative cursor-pointer grid-cell';
    cell.dataset.grid = 'serifs';
    cell.dataset.index = i;
    cell.addEventListener('click', handleGridCellClick);
    cell.addEventListener('contextmenu', handleGridCellRightClick);
    cell.addEventListener('mouseenter', handleGridCellHover);
    cell.addEventListener('mouseleave', handleGridCellLeave);
    serifsGrid.appendChild(cell);
  }
}

// Create 4x4 joins grid
function createJoinsGrid() {
  const joinsGrid = document.getElementById('joinsGrid');
  joinsGrid.innerHTML = '';

  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'w-[100px] h-[100px] relative cursor-pointer grid-cell';
    cell.dataset.grid = 'joins';
    cell.dataset.index = i;
    cell.addEventListener('click', handleGridCellClick);
    cell.addEventListener('contextmenu', handleGridCellRightClick);
    cell.addEventListener('mouseenter', handleGridCellHover);
    cell.addEventListener('mouseleave', handleGridCellLeave);
    joinsGrid.appendChild(cell);
  }
}

// Setup sidebar with shapes
function setupSidebar() {
  populateBodiesShapes();
  populateSerifsShapes();
  populateJoinsShapes();
}

// Populate bodies shapes in sidebar
function populateBodiesShapes() {
  const container = document.getElementById('bodiesShapes');
  container.innerHTML = '';

  if (!rulesData?.shapes?.bodies) return;

  Object.keys(rulesData.shapes.bodies).forEach(angleKey => {
    if (angleKey === 'grid') return;

    const shapes = rulesData.shapes.bodies[angleKey];
    shapes.forEach(shape => {
      const shapeButton = createShapeButton('bodies', angleKey, shape);
      container.appendChild(shapeButton);
    });
  });
}

// Populate serifs shapes in sidebar
function populateSerifsShapes() {
  const container = document.getElementById('serifsShapes');
  container.innerHTML = '';

  if (!rulesData?.shapes?.serifs) return;

  Object.keys(rulesData.shapes.serifs).forEach(angleKey => {
    if (angleKey === 'grid') return;

    const shapes = rulesData.shapes.serifs[angleKey];
    shapes.forEach(shape => {
      const shapeButton = createShapeButton('serifs', angleKey, shape);
      container.appendChild(shapeButton);
    });
  });
}

// Populate joins shapes in sidebar
function populateJoinsShapes() {
  const container = document.getElementById('joinsShapes');
  container.innerHTML = '';

  if (!rulesData?.shapes?.joins) return;

  Object.keys(rulesData.shapes.joins).forEach(angleKey => {
    if (angleKey === 'grid') return;

    const shapes = rulesData.shapes.joins[angleKey];
    shapes.forEach(shape => {
      const shapeButton = createShapeButton('joins', angleKey, shape);
      container.appendChild(shapeButton);
    });
  });
}

// Create a shape button for the sidebar
function createShapeButton(category, angleKey, shape) {
  const button = document.createElement('button');
  // include dark: variants so JS-created buttons respect dark mode
  button.className = 'w-12 h-12 border border-gray-300 dark:border-gray-700 rounded hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 flex items-center justify-center relative shape-button';

  // Create SVG element
  let svgElement = null;

  if (window.SVGUtils && window.SVGUtils.createSVGElement) {
    svgElement = window.SVGUtils.createSVGElement(category, angleKey, shape.shape_name, 'w-8 h-8 object-contain');
  }

  if (!svgElement) {
    // Fallback to text if SVG not found or SVGUtils not available
    button.textContent = shape.shape_name.substring(0, 2);
    button.className += ' text-xs font-mono';
    console.warn(`Could not create SVG for ${category}/${angleKey}/${shape.shape_name}, using text fallback`);
  } else {
    svgElement.setAttribute('alt', shape.shape_name);
    button.appendChild(svgElement);
  }

  // Store shape data
  button.dataset.category = category;
  button.dataset.angleKey = angleKey;
  button.dataset.shapeName = shape.shape_name;
  button.dataset.cellOrientation = shape.cell_orientation;

  button.addEventListener('click', () => selectShape(button, category, angleKey, shape));

  return button;
}

// Select a shape
function selectShape(button, category, angleKey, shape) {
  // Remove previous selection
  document.querySelectorAll('.shape-selected').forEach(el => {
    // remove both light and dark variants when clearing previous selection
    el.classList.remove('shape-selected', 'bg-blue-200', 'border-blue-500', 'dark:bg-blue-800/40', 'dark:border-blue-400');
  });

  // Add selection to current button
  // add selection styles for both light and dark themes
  button.classList.add('shape-selected', 'bg-blue-200', 'border-blue-500', 'dark:bg-blue-800/40', 'dark:border-blue-400');

  selectedShape = {
    category,
    angleKey,
    shape,
    imagePath: `./assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`
  };

  updateSelectedShapeDisplay();
}

// Helper function to get cell position in grid
function getCellPosition(cellIndex, gridType) {
  if (gridType === 'serifs') {
    // 5x5 grid
    const row = Math.floor(cellIndex / 5);
    const col = cellIndex % 5;
    return { row, col, gridSize: 5 };
  } else if (gridType === 'joins') {
    // 4x4 grid
    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;
    return { row, col, gridSize: 4 };
  }
}

// Helper function to get cell by position
function getCellByPosition(row, col, gridType) {
  const gridSize = gridType === 'serifs' ? 5 : 4;
  if (row < 0 || col < 0 || row >= gridSize || col >= gridSize) {
    return null;
  }

  const index = row * gridSize + col;
  const grid = document.getElementById(gridType + 'Grid');
  return grid.children[index];
}

// Helper function to get cells that would be occupied by a shape
function getOccupiedCells(startCell, shapeData) {
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const startPos = getCellPosition(startIndex, gridType);

  const width = shapeData.shape.width || 1;
  const height = shapeData.shape.height || 1;

  const occupiedCells = [];

  // For 2x1 shapes, determine orientation from shape name
  if (width === 2 && height === 1) {
    // Horizontal shape - extends to the right
    occupiedCells.push(startCell);
    const rightCell = getCellByPosition(startPos.row, startPos.col + 1, gridType);
    if (rightCell) occupiedCells.push(rightCell);
  } else if (width === 1 && height === 2) {
    // Vertical shape - extends downward
    occupiedCells.push(startCell);
    const bottomCell = getCellByPosition(startPos.row + 1, startPos.col, gridType);
    if (bottomCell) occupiedCells.push(bottomCell);
  } else {
    // 1x1 shape
    occupiedCells.push(startCell);
  }

  return occupiedCells;
}

// Handle grid cell hover
function handleGridCellHover(event) {
  if (!selectedShape) return;

  const cell = event.currentTarget;
  const gridType = cell.dataset.grid;

  // Check if shape can be placed on this grid
  const shapeGrid = rulesData.shapes[selectedShape.category].grid;
  if (gridType !== shapeGrid) return;

  // Clear previous highlights
  clearCellHighlights();

  // Highlight all cells this shape would occupy
  const occupiedCells = getOccupiedCells(cell, selectedShape);
  occupiedCells.forEach(occupiedCell => {
    if (occupiedCell) {
      occupiedCell.classList.add('cell-highlight');
    }
  });
}

// Handle grid cell leave
function handleGridCellLeave(event) {
  clearCellHighlights();
}

// Clear all cell highlights
function clearCellHighlights() {
  document.querySelectorAll('.cell-highlight, .cell-highlight-valid, .cell-highlight-invalid').forEach(cell => {
    cell.classList.remove('cell-highlight', 'cell-highlight-valid', 'cell-highlight-invalid');
  });
}

// Handle grid cell click
function handleGridCellClick(event) {
  if (!selectedShape) {
    alert('Please select a shape from the sidebar first');
    return;
  }

  const cell = event.currentTarget;
  const gridType = cell.dataset.grid;

  // Check if shape can be placed on this grid
  const shapeGrid = rulesData.shapes[selectedShape.category].grid;
  if (gridType !== shapeGrid) {
    alert(`This shape can only be placed on the ${shapeGrid} grid`);
    return;
  }

  // Get all cells this shape would occupy
  const occupiedCells = getOccupiedCells(cell, selectedShape);

  // Check if all cells are available (within bounds)
  if (occupiedCells.some(c => !c)) {
    alert('Shape extends beyond grid boundaries');
    return;
  }

  // Hook for constraint validation (used by constrained builder)
  if (typeof validateShapeConnections === 'function') {
    if (!validateShapeConnections(cell, selectedShape)) {
      console.log('Placement blocked by constraints');
      return; // Constraint validation failed
    }
  }

  // Check if we're in constrained builder mode (has validation function)
  const isConstrainedBuilder = typeof validateShapeConnections === 'function';

  // For freebuilder: allow bodies and joins to overlap (only clear for serifs and multi-cell shapes)
  // For constrained builder: always clear cells as before
  const shouldClearCells = isConstrainedBuilder ||
                          (selectedShape.category !== 'bodies' && selectedShape.category !== 'joins') ||
                          (selectedShape.shape.width > 1 || selectedShape.shape.height > 1);

  if (shouldClearCells) {
    // Clear all occupied cells first
    occupiedCells.forEach(occupiedCell => {
      if (occupiedCell) {
        occupiedCell.innerHTML = '';
      }
    });
  }

  // Place the shape in the primary cell (the one clicked)
  placeShapeInCell(cell, selectedShape, !shouldClearCells);
}

// Helper function to get sizing class
function getSizingClass(shapeData) {
  const { category, angleKey, shape } = shapeData;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const isSideSerif = shape.shape_name.startsWith('side_');

  // Special join cases for 112_5_deg
  if (category === 'joins' && angleKey === '112_5_deg') {
    if (width === 2 && height === 1) return shapeConfig.sizing['join_112_5_2x1'];
    if (width === 1 && height === 2) return shapeConfig.sizing['join_112_5_1x2'];
  }

  // Multi-cell shapes
  if (width === 2 && height === 1) return shapeConfig.sizing['2x1'];
  if (width === 1 && height === 2) return shapeConfig.sizing['1x2'];

  // Special serif cases
  if (category === 'serifs' && angleKey === '22_5_deg') {
    return isSideSerif ? shapeConfig.sizing['serif_22_5_side'] : shapeConfig.sizing['serif_22_5_regular'];
  }
  if (category === 'serifs' && angleKey === '45_deg') {
    return isSideSerif ? shapeConfig.sizing['serif_45_side'] : shapeConfig.sizing['serif_45_regular'];
  }

  // 1x1 cases
  if (category === 'bodies' && width === 1 && height === 1) return shapeConfig.sizing['body_1x1'];
  if (category === 'joins' && width === 1 && height === 1) return shapeConfig.sizing['join_1x1'];

  return shapeConfig.sizing['default'];
}

// Helper function to apply join positioning
function applyJoinPositioning(element, shapeData) {
  const { angleKey, shape } = shapeData;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const orientation = shape.cell_orientation;

  const sizeKey = `${width}x${height}`;
  const config = shapeConfig.positioning.joins[sizeKey];
  if (!config) return;

  const angleConfig = config[angleKey] || config.default;
  const orientationKey = orientation.includes('top') ? 'top' : 'bottom';
  const positioning = angleConfig[orientationKey];

  // Apply vertical positioning
  const verticalStyle = positioning.vertical.split(': ');
  element.style[verticalStyle[0]] = verticalStyle[1];

  // Apply horizontal positioning
  const horizontalKey = orientation.includes('right') ? 'right' : 'left';
  const horizontalStyle = positioning.horizontal[horizontalKey].split(': ');
  element.style[horizontalStyle[0]] = horizontalStyle[1];

  element.style.transform = '';
}

// Unified positioning function that uses configuration objects
function applyPositioning(element, shapeData) {
  const { category, angleKey, shape } = shapeData;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const orientation = shape.cell_orientation.split(' ');
  const vertical = orientation[0];
  const horizontal = orientation[1];

  // Reset element styles
  element.style.transform = '';

  // Multi-cell joins
  if (category === 'joins' && (width === 2 || height === 2)) {
    return applyJoinPositioning(element, shapeData);
  }

  // 1x1 joins
  if (category === 'joins' && width === 1 && height === 1) {
    const config = shapeConfig.positioning.joins['1x1'];
    element.style.top = config.top;
    element.style.left = config.left;
    element.style.transform = config.transform;
    return;
  }

  // Multi-cell bodies (non-joins)
  if (category === 'bodies' && (width === 2 || height === 2)) {
    element.style.top = '0';
    element.style.left = '0';
    element.style.transform = '';
    return;
  }

  // Serifs
  if (category === 'serifs') {
    const angleConfig = shapeConfig.positioning.serifs[angleKey];
    if (!angleConfig) {
      return applyStandardPositioning(element, vertical, horizontal);
    }

    // 22.5° serifs
    if (angleKey === '22_5_deg') {
      const shapeName = shape.shape_name;

      // Special named serifs
      if (angleConfig[shapeName]) {
        const config = angleConfig[shapeName];
        if (config.left) element.style.left = config.left;
        if (config.right) element.style.right = config.right;

        const verticalConfig = config.vertical[vertical];
        if (verticalConfig) {
          Object.keys(verticalConfig).forEach(prop => {
            element.style[prop] = verticalConfig[prop];
          });
        }
        return;
      }

      // Side serifs
      const isSideSerif = shape.cell_orientation.includes('top') || shape.cell_orientation.includes('bottom');
      if (isSideSerif) {
        const sideConfig = angleConfig.side;
        const posConfig = sideConfig[vertical] || sideConfig.default;

        Object.keys(posConfig).forEach(prop => {
          if (prop !== 'transform') {
            element.style[prop] = posConfig[prop];
          }
        });

        const horizConfig = sideConfig.horizontal[horizontal];
        if (horizConfig) {
          Object.keys(horizConfig).forEach(prop => {
            element.style[prop] = horizConfig[prop];
          });
        }
        return;
      }

      // Regular 22.5° serifs
      const regularConfig = angleConfig.regular;
      const horizConfig = regularConfig.horizontal[horizontal] || regularConfig.horizontal.default;
      const vertConfig = regularConfig.vertical[vertical];

      Object.keys(horizConfig).forEach(prop => {
        element.style[prop] = horizConfig[prop];
      });

      if (vertConfig) {
        Object.keys(vertConfig).forEach(prop => {
          element.style[prop] = vertConfig[prop];
        });
      }
      return;
    }

    // 45° serifs
    if (angleKey === '45_deg') {
      const shapeName = shape.shape_name;
      const shapeConfig = angleConfig[shapeName];

      if (shapeConfig) {
        Object.keys(shapeConfig).forEach(prop => {
          element.style[prop] = shapeConfig[prop];
        });
      }

      const verticalConfig = angleConfig.vertical[vertical];
      if (verticalConfig) {
        Object.keys(verticalConfig).forEach(prop => {
          element.style[prop] = verticalConfig[prop];
        });
      }
      return;
    }
  }

  // Default to standard positioning
  applyStandardPositioning(element, vertical, horizontal);
}

function applyStandardPositioning(element, vertical, horizontal) {
  const config = shapeConfig.positioning.standard;

  // Apply vertical positioning
  const vertConfig = config.vertical[vertical];
  if (vertConfig) {
    Object.keys(vertConfig).forEach(prop => {
      if (prop === 'transform') {
        const transformConfig = vertConfig[prop];
        element.style.transform = transformConfig[horizontal] || transformConfig.default;
      } else {
        element.style[prop] = vertConfig[prop];
      }
    });
  }

  // Apply horizontal positioning
  const horizConfig = config.horizontal[horizontal];
  if (horizConfig) {
    Object.keys(horizConfig).forEach(prop => {
      element.style[prop] = horizConfig[prop];
    });

    // Handle transform for center horizontal positioning
    if (horizontal === 'center' && vertical !== 'center') {
      element.style.transform = 'translateX(-50%)';
    }
  }
}

// Place shape in grid cell
function placeShapeInCell(cell, shapeData, allowOverlap = false) {
  // Clear existing content only if not allowing overlap
  if (!allowOverlap) {
    cell.innerHTML = '';
  }

  // Create SVG element
  const sizeClasses = 'absolute object-contain ' + getSizingClass(shapeData);
  let svgElement = null;

  if (window.SVGUtils && window.SVGUtils.createSVGElement) {
    svgElement = window.SVGUtils.createSVGElement(shapeData.category, shapeData.angleKey, shapeData.shape.shape_name, sizeClasses);
  }

  if (!svgElement) {
    console.warn('Could not create SVG for shape:', shapeData);
    // Create a text fallback
    const textElement = document.createElement('div');
    textElement.textContent = shapeData.shape.shape_name;
    textElement.className = sizeClasses + ' text-xs font-mono text-center text-gray-600 dark:text-gray-300';
    textElement.style.display = 'flex';
    textElement.style.alignItems = 'center';
    textElement.style.justifyContent = 'center';
    cell.appendChild(textElement);
    return;
  }

  svgElement.setAttribute('alt', shapeData.shape.shape_name);

  // Apply positioning using unified configuration-based approach
  applyPositioning(svgElement, shapeData);

  // SVG elements don't have load errors like img elements, so no error handling needed

  cell.appendChild(svgElement);
}

// Setup tab switching
function setupTabSwitching() {
  const bodiesTab = document.getElementById('bodiesTab');
  const joinsTab = document.getElementById('joinsTab');
  const bodiesContent = document.getElementById('bodiesContent');
  const joinsContent = document.getElementById('joinsContent');

  bodiesTab.addEventListener('click', () => {
    currentTab = 'bodies';
  bodiesTab.className = 'flex-1 py-3 px-4 bg-white dark:bg-slate-800 border-r border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-gray-100';
  joinsTab.className = 'flex-1 py-3 px-4 bg-gray-200 dark:bg-slate-700 font-medium text-gray-700 dark:text-gray-200';
    bodiesContent.classList.remove('hidden');
    joinsContent.classList.add('hidden');
    updateGridLayers();
  });

  joinsTab.addEventListener('click', () => {
    currentTab = 'joins';
  joinsTab.className = 'flex-1 py-3 px-4 bg-white dark:bg-slate-800 border-r border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-gray-100';
  bodiesTab.className = 'flex-1 py-3 px-4 bg-gray-200 dark:bg-slate-700 font-medium text-gray-700 dark:text-gray-200';
    joinsContent.classList.remove('hidden');
    bodiesContent.classList.add('hidden');
    updateGridLayers();
  });
}

// Handle right-click to clear cell
function handleGridCellRightClick(event) {
  event.preventDefault();
  const cell = event.currentTarget;
  cell.innerHTML = '';
}

// Update selected shape display
function updateSelectedShapeDisplay() {
  const display = document.getElementById('selectedShapeDisplay');
  const info = document.getElementById('selectedShapeInfo');

  if (selectedShape) {
    display.classList.remove('hidden');
    info.textContent = `${selectedShape.category} > ${selectedShape.angleKey} > ${selectedShape.shape.shape_name}`;
  } else {
    display.classList.add('hidden');
  }
}

// Setup clear selection button
function setupClearSelection() {
  document.getElementById('clearSelection').addEventListener('click', () => {
    selectedShape = null;
    document.querySelectorAll('.shape-selected').forEach(el => {
      el.classList.remove('shape-selected', 'bg-blue-200', 'border-blue-500');
    });
    updateSelectedShapeDisplay();
  });
}

// Setup preview toggle
function setupPreviewToggle() {
  const previewToggle = document.getElementById('previewToggle');
  previewToggle.addEventListener('change', (e) => {
    previewMode = e.target.checked;
    document.body.classList.toggle('preview-mode', previewMode);
  });
}

// Update grid layers and interactivity based on current tab
function updateGridLayers() {
  const serifsGrid = document.getElementById('serifsGrid');
  const joinsGrid = document.getElementById('joinsGrid');

  if (currentTab === 'bodies') {
    // Bodies/Serifs tab: serifs grid on top and active
    serifsGrid.style.zIndex = '20';
    joinsGrid.style.zIndex = '10';
    serifsGrid.classList.remove('grid-inactive');
    serifsGrid.classList.add('grid-active');
    joinsGrid.classList.remove('grid-active');
    joinsGrid.classList.add('grid-inactive');
  } else if (currentTab === 'joins') {
    // Joins tab: joins grid on top and active
    joinsGrid.style.zIndex = '20';
    serifsGrid.style.zIndex = '10';
    joinsGrid.classList.remove('grid-inactive');
    joinsGrid.classList.add('grid-active');
    serifsGrid.classList.remove('grid-active');
    serifsGrid.classList.add('grid-inactive');
  }
}

// Initialize when page loads - but wait for SVG system to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if SVG system is ready, if not wait for the ready event
  if (window.SVGUtils && window.SVGUtils.isReady && window.SVGUtils.isReady()) {
    initBuilder();
  } else {
    // Listen for the SVG system ready event
    document.addEventListener('svgSystemReady', initBuilder);
    // Fallback: try again in 100ms if event doesn't fire
    setTimeout(() => {
      if (window.SVGUtils && window.SVGUtils.isReady && window.SVGUtils.isReady()) {
        document.removeEventListener('svgSystemReady', initBuilder);
        initBuilder();
      }
    }, 100);
  }
});
