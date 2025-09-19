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
  document.querySelectorAll('.cell-highlight').forEach(cell => {
    cell.classList.remove('cell-highlight');
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

  // Clear all occupied cells first
  occupiedCells.forEach(occupiedCell => {
    if (occupiedCell) {
      occupiedCell.innerHTML = '';
    }
  });

  // Place the shape in the primary cell (the one clicked)
  placeShapeInCell(cell, selectedShape);
}

// Place shape in grid cell
function placeShapeInCell(cell, shapeData) {
  // Clear existing content
  cell.innerHTML = '';

  // Create image element
  const img = document.createElement('img');
  img.src = shapeData.imagePath;
  img.alt = shapeData.shape.shape_name;

  // Apply sizing based on shape dimensions and category
  let sizeClasses = 'absolute object-contain';
  const width = shapeData.shape.width || 1;
  const height = shapeData.shape.height || 1;
  const isSerif22_5 = shapeData.category === 'serifs' && (shapeData.angleKey === '22_5_deg');
  const isSerif45 = shapeData.category === 'serifs' && (shapeData.angleKey === '45_deg');
  const isBody1x1 = shapeData.category === 'bodies' && width === 1 && height === 1;
  const isJoin1x1 = shapeData.category === 'joins' && width === 1 && height === 1;
  const isJoin2x1 = shapeData.category === 'joins' && width === 2 && height === 1;
  const isJoin1x2 = shapeData.category === 'joins' && width === 1 && height === 2;
  const isSideSerif = shapeData.shape.shape_name.startsWith('side_');

  if (width === 2 && height === 1) {
    // 2x1 shape gets max-w-[200%]
    sizeClasses += ' max-w-[200%] max-h-full';
  } else if (width === 1 && height === 2) {
    // 1x2 shape gets max-h-[200%]
    sizeClasses += ' max-w-full max-h-[200%]';
  } else if (isSerif22_5) {
    // 22.5° serifs need special sizing
    if (isSideSerif) {
      // Side serifs get 200% height
      sizeClasses += ' max-w-full max-h-[200%]';
    } else {
      // Regular 22.5° serifs get 200% width
      sizeClasses += ' max-w-[200%] max-h-full';
    }
  } else if (isSerif45) {
    // 45° serifs get max-height 100% and width auto
    sizeClasses += ' max-h-full w-auto';
  } else if (isBody1x1) {
    // 1x1 bodies get 120% max height/width
    sizeClasses += ' max-w-[120%] max-h-[120%]';
  } else if (isJoin1x1) {
    // 1x1 joins get 120% max height/width
    sizeClasses += ' max-w-[110%] max-h-[110%]';
  } else {
    // Standard 1x1 shape gets normal sizing
    sizeClasses += ' max-w-full max-h-full';
  }

  img.className = sizeClasses;

  // Apply positioning based on shape dimensions and cell orientation
  const orientation = shapeData.shape.cell_orientation.split(' ');
  const vertical = orientation[0]; // top, center, bottom
  const horizontal = orientation[1]; // left, center, right

  // Special positioning for multi-cell shapes
  if (isJoin2x1) {
    if(shapeData.shape.cell_orientation.includes('top')) {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.bottom = '28%';
      } else {
        img.style.bottom = '5%';
      }
    } else {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.top = '28%';
      } else {
        img.style.top = '5%';
      }
    }
    if(shapeData.shape.cell_orientation.includes('right')) {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.right = '-5%';
      } else {
        img.style.left = '-17.5%';
      }
    } else {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.left = '-5%';
      } else {
        img.style.right = '-17.5%';
      }
    }
    img.style.transform = '';
  } else if (isJoin1x2) {
    if(shapeData.shape.cell_orientation.includes('top')) {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.top = '-5%';
      } else {
        img.style.bottom = '-17.5%';
      }
    } else {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.bottom = '-5%'; // current
      } else {
        img.style.top = '-17.5%';
      }
    }
    if(shapeData.shape.cell_orientation.includes('left')) {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.right = '28%';
      } else {
        img.style.right = '5%';
      }
    } else {
      if (shapeData.angleKey == '67_5_deg'){
        img.style.left = '28%'; // current
      } else {
        img.style.left = '5%';
      }
    }
    img.style.transform = '';
  } else if (width === 2 && height === 1) {
    // 2x1 shape: always align to top-left of clicked cell
    img.style.top = '0';
    img.style.left = '0';
    img.style.transform = '';
  } else if (width === 1 && height === 2) {
    // 1x2 shape: always align to top-left of clicked cell
    img.style.top = '0';
    img.style.left = '0';
    img.style.transform = '';
  } else if (isSerif22_5) {
    // Special positioning for 22.5° serifs with -7% offset from cell_orientation
    img.style.transform = '';

    if (isSideSerif) {
      // Side serifs: vertical positioning with -7% offset
      switch (vertical) {
        case 'bottom':
          img.style.top = '-7%';
          img.style.maxHeight = '200%';
          break;
        case 'top':
          img.style.bottom = '-7%';
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
  } else if (isJoin1x1) {
    // 1x1 joins: special positioning at -5%, -5%
    img.style.top = '-5%';
    img.style.left = '-5%';
    img.style.transform = '';
  } else {
    // Other 1x1 shapes: use normal cell_orientation positioning
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
