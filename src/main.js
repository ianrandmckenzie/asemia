// Load rules and shapes data
let rulesData = null;
let selectedShape = null;
let currentTab = 'bodies';
let previewMode = false;

// Initialize the application
async function init() {
  await loadRules();
  createGrids();
  setupSidebar();
  setupTabSwitching();
  setupClearSelection();
  setupPreviewToggle();
  updateGridLayers();
}

// Load the rules.json file
async function loadRules() {
  try {
    const response = await fetch('/public/assets/rules.json');
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
  const imagePath = `/public/assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`;
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
    imagePath: `/public/assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`
  };

  updateSelectedShapeDisplay();
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

  placeShapeInCell(cell, selectedShape);
}

// Place shape in grid cell
function placeShapeInCell(cell, shapeData) {
  const shape = shapeData.shape;
  const width = shape.width || 1;
  const height = shape.height || 1;
  const overflow = shape.overflow;

  // Check if shape fits in grid
  if (!canPlaceShape(cell, width, height)) {
    alert('Shape does not fit in available grid space');
    return;
  }

  // Only clear cells for single-cell shapes or serif shapes
  // Multi-cell body shapes should overlay, not clear
  const isMultiCellBody = (width > 1 || height > 1) && shapeData.category === 'bodies';

  if (!isMultiCellBody) {
    // Clear existing content from all affected cells for single-cell shapes and serifs
    clearShapeCells(cell, width, height);
  } else {
    // For multi-cell bodies, only clear existing body shapes, preserve serifs
    clearExistingBodies(cell, width, height);
  }

  // Create container for the shape
  const container = document.createElement('div');
  container.className = 'absolute inset-0';

  // Add category-specific classes
  if (shapeData.category === 'bodies') {
    container.classList.add('body-shape');
  } else if (shapeData.category === 'serifs') {
    container.classList.add('serif-shape');
  }

  // Handle multi-cell shapes
  if (width > 1 || height > 1) {
    container.classList.add('multi-cell-shape');
    container.style.width = `${width * 100}px`;
    container.style.height = `${height * 100}px`;

    // For multi-cell bodies, use higher z-index to overlay on serifs
    if (shapeData.category === 'bodies') {
      container.classList.add('multi-cell-body');
    }

    // Mark occupied cells
    markOccupiedCells(cell, width, height, shapeData);
  }

  // Handle overflow shapes
  if (overflow) {
    container.classList.add('overflow-shape');
    applyOverflow(container, overflow);
  }  // Create image element
  const img = document.createElement('img');
  img.src = shapeData.imagePath;
  img.alt = shape.shape_name;
  img.className = 'w-full h-full object-contain';

  // Apply cell orientation positioning
  applyOrientation(container, shape.cell_orientation, overflow);

  // Handle image load error
  img.onerror = () => {
    img.style.display = 'none';
    const text = document.createElement('div');
    text.textContent = shape.shape_name;
    text.className = 'absolute text-xs font-mono text-center w-full text-gray-600 top-1/2 transform -translate-y-1/2';
    container.appendChild(text);
  };

  container.appendChild(img);
  cell.appendChild(container);

  // Store shape data on the cell
  cell.dataset.shapeWidth = width;
  cell.dataset.shapeHeight = height;
  cell.dataset.shapeName = shape.shape_name;
}

// Check if shape can be placed at given position
function canPlaceShape(startCell, width, height) {
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const gridSize = gridType === 'serifs' ? 5 : 4;

  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;

  // Check if shape extends beyond grid boundaries
  if (startCol + width > gridSize || startRow + height > gridSize) {
    return false;
  }

  return true;
}

// Clear all cells that will be occupied by the shape
function clearShapeCells(startCell, width, height) {
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const gridSize = gridType === 'serifs' ? 5 : 4;
  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;

  for (let row = startRow; row < startRow + height; row++) {
    for (let col = startCol; col < startCol + width; col++) {
      const cellIndex = row * gridSize + col;
      const targetCell = document.querySelector(`[data-grid="${gridType}"][data-index="${cellIndex}"]`);
      if (targetCell) {
        targetCell.innerHTML = '';
        targetCell.style.backgroundColor = '';
        targetCell.removeAttribute('data-shape-width');
        targetCell.removeAttribute('data-shape-height');
        targetCell.removeAttribute('data-shape-name');
        targetCell.removeAttribute('data-occupied-by');
      }
    }
  }
}

// Clear only existing body shapes, preserve serifs
function clearExistingBodies(startCell, width, height) {
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const gridSize = gridType === 'serifs' ? 5 : 4;
  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;

  for (let row = startRow; row < startRow + height; row++) {
    for (let col = startCol; col < startCol + width; col++) {
      const cellIndex = row * gridSize + col;
      const targetCell = document.querySelector(`[data-grid="${gridType}"][data-index="${cellIndex}"]`);
      if (targetCell) {
        // Only remove body shapes (those with high z-index containers)
        const existingContainers = targetCell.querySelectorAll('.multi-cell-shape');
        existingContainers.forEach(container => {
          if (container.style.zIndex === '25') {
            container.remove();
          }
        });

        // Clear body-related data attributes
        if (targetCell.dataset.shapeName && !isSerifShape(targetCell.dataset.shapeName)) {
          targetCell.removeAttribute('data-shape-width');
          targetCell.removeAttribute('data-shape-height');
          targetCell.removeAttribute('data-shape-name');
        }

        // Clear occupied-by markers for body shapes
        if (targetCell.dataset.occupiedByCategory === 'bodies') {
          targetCell.removeAttribute('data-occupied-by');
          targetCell.removeAttribute('data-occupied-by-category');
          targetCell.style.backgroundColor = '';
        }
      }
    }
  }
}

// Helper function to determine if a shape name is a serif
function isSerifShape(shapeName) {
  if (!shapeName) return false;
  const serifKeywords = ['bottom', 'top', 'left', 'right', 'bl_to_tr', 'br_to_tl', 'tr_to_bl', 'tl_to_br', 'side_'];
  return serifKeywords.some(keyword => shapeName.includes(keyword));
}

// Mark cells as occupied by a multi-cell shape
function markOccupiedCells(startCell, width, height, shapeData) {
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const gridSize = gridType === 'serifs' ? 5 : 4;
  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;

  for (let row = startRow; row < startRow + height; row++) {
    for (let col = startCol; col < startCol + width; col++) {
      const cellIndex = row * gridSize + col;
      const targetCell = document.querySelector(`[data-grid="${gridType}"][data-index="${cellIndex}"]`);
      if (targetCell && targetCell !== startCell) {
        // Mark as occupied with category information
        targetCell.dataset.occupiedBy = startIndex;
        targetCell.dataset.occupiedByCategory = shapeData.category;

        // Only show visual indication for body shapes (since they overlay)
        if (shapeData.category === 'bodies') {
          targetCell.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }
      }
    }
  }
}

// Apply overflow styling
function applyOverflow(container, overflow) {
  const directions = overflow.split(' ');
  const vertical = directions[0]; // top, bottom
  const horizontal = directions[1]; // left, right

  // Set standard size for overflow containers
  container.style.height = '150px';
  container.style.width = '150px';

  // Position based on overflow direction
  if (vertical === 'top' && horizontal === 'left') {
    // Overflow to top-left: position from bottom-right of cell
    container.style.top = '-25px';
    container.style.right = '0';
  } else if (vertical === 'top' && horizontal === 'right') {
    // Overflow to top-right: position from bottom-left of cell
    container.style.top = '-25px';
    container.style.left = '-50px';
  } else if (vertical === 'bottom' && horizontal === 'left') {
    // Overflow to bottom-left: position from top-right of cell
    container.style.bottom = '-25px';
    container.style.left = '-25px';
  } else if (vertical === 'bottom' && horizontal === 'right') {
    // Overflow to bottom-right: position from top-left of cell
    container.style.bottom = '-25px';
    container.style.left = '-25px';
  }
}

// Apply orientation positioning
function applyOrientation(container, cellOrientation, overflow) {
  const orientation = cellOrientation.split(' ');
  const vertical = orientation[0]; // top, center, bottom
  const horizontal = orientation[1]; // left, center, right

  // If there's overflow, the positioning is handled by applyOverflow
  if (overflow) {
    return;
  }

  // Standard positioning for non-overflow shapes
  switch (vertical) {
    case 'top':
      container.style.justifyContent = 'flex-start';
      break;
    case 'center':
      container.style.justifyContent = 'center';
      break;
    case 'bottom':
      container.style.justifyContent = 'flex-end';
      break;
  }

  switch (horizontal) {
    case 'left':
      container.style.alignItems = 'flex-start';
      break;
    case 'center':
      container.style.alignItems = 'center';
      break;
    case 'right':
      container.style.alignItems = 'flex-end';
      break;
  }

  container.style.display = 'flex';
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

  // Handle multi-cell shapes
  const width = parseInt(cell.dataset.shapeWidth) || 1;
  const height = parseInt(cell.dataset.shapeHeight) || 1;

  if (width > 1 || height > 1) {
    clearShapeCells(cell, width, height);
  } else {
    // Handle single cell or occupied cell
    const occupiedBy = cell.dataset.occupiedBy;
    if (occupiedBy) {
      // This cell is occupied by another shape, clear the main shape
      const gridType = cell.dataset.grid;
      const mainCell = document.querySelector(`[data-grid="${gridType}"][data-index="${occupiedBy}"]`);
      if (mainCell) {
        const mainWidth = parseInt(mainCell.dataset.shapeWidth) || 1;
        const mainHeight = parseInt(mainCell.dataset.shapeHeight) || 1;
        clearShapeCells(mainCell, mainWidth, mainHeight);
      }
    } else {
      // Regular single cell
      cell.innerHTML = '';
      cell.removeAttribute('data-shape-width');
      cell.removeAttribute('data-shape-height');
      cell.removeAttribute('data-shape-name');
    }
  }
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
