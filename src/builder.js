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

  joinPositioning: {
    '2x1': {
      '67_5_deg': {
        top: { vertical: 'bottom: 28%', horizontal: { right: 'right: -5%', left: 'left: -5%' }},
        bottom: { vertical: 'top: 28%', horizontal: { right: 'right: -5%', left: 'left: -5%' }}
      },
      '112_5_deg': {
        top: { vertical: 'bottom: -15%', horizontal: { right: 'left: -27%', left: 'right: -27%' }},
        bottom: { vertical: 'top: -15%', horizontal: { right: 'left: -27%', left: 'right: -27%' }}
      },
      '135_deg': {
        top: { vertical: 'bottom: 5%', horizontal: { right: 'left: 3.5%', left: 'right: 3.5%' }},
        bottom: { vertical: 'top: 5%', horizontal: { right: 'left: 3.5%', left: 'right: 3.5%' }}
      },
      default: {
        top: { vertical: 'bottom: 5%', horizontal: { right: 'left: -17.5%', left: 'right: -17.5%' }},
        bottom: { vertical: 'top: 5%', horizontal: { right: 'left: -17.5%', left: 'right: -17.5%' }}
      }
    },
    '1x2': {
      '67_5_deg': {
        top: { vertical: 'top: -5%', horizontal: { left: 'right: 28%', right: 'left: 28%' }},
        bottom: { vertical: 'bottom: -5%', horizontal: { left: 'right: 28%', right: 'left: 28%' }}
      },
      '112_5_deg': {
        top: { vertical: 'top: -27%', horizontal: { left: 'right: -15%', right: 'left: -15%' }},
        bottom: { vertical: 'bottom: -27%', horizontal: { left: 'right: -15%', right: 'left: -15%' }}
      },
      '135_deg': {
        top: { vertical: 'bottom: 3.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }},
        bottom: { vertical: 'top: 3.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }}
      },
      default: {
        top: { vertical: 'bottom: -17.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }},
        bottom: { vertical: 'top: -17.5%', horizontal: { left: 'right: 5%', right: 'left: 5%' }}
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
  button.className = 'w-12 h-12 border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center relative shape-button';

  // Create image element
  const img = document.createElement('img');
  const imagePath = `./assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`;
  img.src = imagePath;
  img.alt = shape.shape_name;
  img.className = 'w-8 h-8 object-contain';

  // Handle image load error
  img.onerror = () => {
    button.textContent = shape.shape_name.substring(0, 2);
    button.className += ' text-xs font-mono';
  };

  button.appendChild(img);

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
    el.classList.remove('shape-selected', 'bg-blue-200', 'border-blue-500');
  });

  // Add selection to current button
  button.classList.add('shape-selected', 'bg-blue-200', 'border-blue-500');

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

  // Clear all occupied cells first
  occupiedCells.forEach(occupiedCell => {
    if (occupiedCell) {
      occupiedCell.innerHTML = '';
    }
  });

  // Place the shape in the primary cell (the one clicked)
  placeShapeInCell(cell, selectedShape);
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
function applyJoinPositioning(img, shapeData) {
  const { angleKey, shape } = shapeData;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const orientation = shape.cell_orientation;

  const sizeKey = `${width}x${height}`;
  const config = shapeConfig.joinPositioning[sizeKey];
  if (!config) return;

  const angleConfig = config[angleKey] || config.default;
  const orientationKey = orientation.includes('top') ? 'top' : 'bottom';
  const positioning = angleConfig[orientationKey];

  // Apply vertical positioning
  const verticalStyle = positioning.vertical.split(': ');
  img.style[verticalStyle[0]] = verticalStyle[1];

  // Apply horizontal positioning
  const horizontalKey = orientation.includes('right') ? 'right' : 'left';
  const horizontalStyle = positioning.horizontal[horizontalKey].split(': ');
  img.style[horizontalStyle[0]] = horizontalStyle[1];

  img.style.transform = '';
}

function applySerifPositioning(img, shapeData, vertical, horizontal) {
  const isSideSerif = shapeData.shape.cell_orientation.includes('top') || shapeData.shape.cell_orientation.includes('bottom');
  img.style.transform = '';

  const shapeName = shapeData.shape.shape_name;

  // Special handling for specific 22.5 serifs - check this FIRST
  if (shapeName === 'br_to_tl' || shapeName === 'tr_to_bl') {
    img.style.right = '-7%';
    // Vertical positioning for special serifs
    switch (vertical) {
      case 'top':
        img.style.top = '0';
        break;
      case 'bottom':
        img.style.bottom = '0';
        break;
      case 'center':
        img.style.top = '50%';
        img.style.transform = 'translateY(-50%)';
        break;
    }
  } else if (shapeName === 'bl_to_tr' || shapeName === 'tl_to_br') {
    img.style.left = '-7%';
    // Vertical positioning for special serifs
    switch (vertical) {
      case 'top':
        img.style.top = '0';
        break;
      case 'bottom':
        img.style.bottom = '0';
        break;
      case 'center':
        img.style.top = '50%';
        img.style.transform = 'translateY(-50%)';
        break;
    }
  } else if (isSideSerif) {
    // Side serifs: vertical positioning with -7% offset
    switch (vertical) {
      case 'bottom':
        img.style.top = '-7%';
        img.style.right = '-4%';
        img.style.maxHeight = '200%';
        break;
      case 'top':
        img.style.bottom = '-7%';
        img.style.left = '-4%';
        img.style.maxHeight = '200%';
        break;
      default:
        img.style.top = '0';
        break;
    }

    // Horizontal centering for side serifs
    switch (horizontal) {
      case 'left':
        img.style.left = '0';
        break;
      case 'right':
        img.style.right = '0';
        break;
      case 'center':
        img.style.left = '50%';
        img.style.transform = 'translateX(-50%)';
        break;
    }
  } else {
    // Regular 22.5° serifs: horizontal positioning with -7% offset
    switch (horizontal) {
      case 'right':
        img.style.left = '-7%';
        img.style.maxWidth = '200%';
        break;
      case 'left':
        img.style.right = '-7%';
        img.style.maxWidth = '200%';
        break;
      default:
        img.style.left = '0';
        break;
    }

    // Vertical positioning for regular serifs
    switch (vertical) {
      case 'top':
        img.style.top = '0';
        break;
      case 'bottom':
        img.style.bottom = '0';
        break;
      case 'center':
        img.style.top = '50%';
        img.style.transform = 'translateY(-50%)';
        break;
    }
  }
}

function applyStandardPositioning(img, vertical, horizontal) {
  // Standard cell orientation positioning for most shapes
  switch (vertical) {
    case 'top':
      img.style.top = '0';
      img.style.transform = horizontal === 'center' ? 'translateX(-50%)' : '';
      break;
    case 'center':
      img.style.top = '50%';
      img.style.transform = horizontal === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)';
      break;
    case 'bottom':
      img.style.bottom = '0';
      img.style.transform = horizontal === 'center' ? 'translateX(-50%)' : '';
      break;
  }

  switch (horizontal) {
    case 'left':
      img.style.left = '0';
      break;
    case 'center':
      img.style.left = '50%';
      if (vertical !== 'center') {
        img.style.transform = 'translateX(-50%)';
      }
      break;
    case 'right':
      img.style.right = '0';
      break;
  }
}

// Place shape in grid cell
function placeShapeInCell(cell, shapeData) {
  // Clear existing content
  cell.innerHTML = '';

  // Create image element
  const img = document.createElement('img');
  img.src = shapeData.imagePath;
  img.alt = shapeData.shape.shape_name;

  // Apply sizing classes
  const sizeClasses = 'absolute object-contain ' + getSizingClass(shapeData);
  img.className = sizeClasses;

  // Apply positioning based on shape type and configuration
  const { category, angleKey, shape } = shapeData;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const orientation = shape.cell_orientation.split(' ');
  const vertical = orientation[0];
  const horizontal = orientation[1];

  // Determine positioning strategy
  if (category === 'joins' && (width === 2 || height === 2)) {
    // Multi-cell joins use configuration-based positioning
    applyJoinPositioning(img, shapeData);
  } else if (width === 2 && height === 1) {
    // Non-join 2x1 shapes: align to top-left
    img.style.top = '0';
    img.style.left = '0';
    img.style.transform = '';
  } else if (width === 1 && height === 2) {
    // Non-join 1x2 shapes: align to top-left
    img.style.top = '0';
    img.style.left = '0';
    img.style.transform = '';
  } else if (category === 'serifs' && angleKey === '22_5_deg') {
    // 22.5° serifs use special offset positioning
    applySerifPositioning(img, shapeData, vertical, horizontal);
  } else if (category === 'joins' && width === 1 && height === 1) {
    // 1x1 joins: special -5% offset
    img.style.top = '-5%';
    img.style.left = '-5%';
    img.style.transform = '';
  } else {
    // Standard cell orientation positioning
    applyStandardPositioning(img, vertical, horizontal);
  }

  // Handle image load error
  img.onerror = () => {
    img.style.display = 'none';
    const text = document.createElement('div');
    text.textContent = shapeData.shape.shape_name;
    text.className = 'absolute text-xs font-mono text-center w-full text-gray-600';
    text.style.top = '50%';
    text.style.transform = 'translateY(-50%)';
    cell.appendChild(text);
  };

  cell.appendChild(img);
}

// Setup tab switching
function setupTabSwitching() {
  const bodiesTab = document.getElementById('bodiesTab');
  const joinsTab = document.getElementById('joinsTab');
  const bodiesContent = document.getElementById('bodiesContent');
  const joinsContent = document.getElementById('joinsContent');

  bodiesTab.addEventListener('click', () => {
    currentTab = 'bodies';
    bodiesTab.className = 'flex-1 py-3 px-4 bg-white border-r border-gray-300 font-medium text-gray-900';
    joinsTab.className = 'flex-1 py-3 px-4 bg-gray-200 font-medium text-gray-700';
    bodiesContent.classList.remove('hidden');
    joinsContent.classList.add('hidden');
    updateGridLayers();
  });

  joinsTab.addEventListener('click', () => {
    currentTab = 'joins';
    joinsTab.className = 'flex-1 py-3 px-4 bg-white border-r border-gray-300 font-medium text-gray-900';
    bodiesTab.className = 'flex-1 py-3 px-4 bg-gray-200 font-medium text-gray-700';
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initBuilder);
