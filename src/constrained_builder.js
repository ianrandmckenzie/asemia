// Constrained Builder - Connection validation logic
// This module adds constraint validation on top of the shared builder functionality

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Constrained builder validation loaded');

  // Make the validation function globally accessible
  window.validateShapeConnections = validateShapeConnections;
  console.log('validateShapeConnections made global:', typeof window.validateShapeConnections);

  // Override hover behavior after builder.js loads
  setTimeout(() => {
    overrideHoverBehavior();
  }, 200);
});

// Override the hover behavior to show constraint validation
function overrideHoverBehavior() {
  if (typeof handleGridCellHover === 'function') {
    // Store original hover function
    window.originalHandleGridCellHover = handleGridCellHover;

    // Override with constraint-aware version
    window.handleGridCellHover = constrainedHandleGridCellHover;

    console.log('Hover behavior overridden for constraint validation');
  }
}

// Enhanced hover handler with visual constraint validation
function constrainedHandleGridCellHover(event) {
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

  // Check if placement would be valid (including constraints)
  const isValidPlacement = occupiedCells.every(c => c) && // All cells exist
                          validateShapeConnections(cell, selectedShape); // Passes constraint validation

  occupiedCells.forEach(occupiedCell => {
    if (occupiedCell) {
      if (isValidPlacement) {
        occupiedCell.classList.add('cell-highlight-valid');
      } else {
        occupiedCell.classList.add('cell-highlight-invalid');
      }
    }
  });
}

// Validate that the shape can connect to adjacent existing shapes
function validateShapeConnections(targetCell, shapeData) {
  console.log('Validating connections for:', shapeData.shape.shape_name, 'at cell', targetCell.dataset.index);

  const gridType = targetCell.dataset.grid;
  const cellIndex = parseInt(targetCell.dataset.index);
  const cellPos = getCellPosition(cellIndex, gridType);

  // Get adjacent cells and check for existing shapes
  const adjacentCells = getAdjacentCells(cellPos, gridType);

  for (const adjacent of adjacentCells) {
    if (!adjacent.cell || !adjacent.cell.children.length) {
      continue; // No shape in this adjacent cell
    }

    // Get the existing shape data
    const existingShapeData = getShapeDataFromCell(adjacent.cell);
    if (!existingShapeData) {
      continue;
    }

    console.log('Checking connection:', shapeData.angleKey + '.' + shapeData.shape.shape_name, 'to', existingShapeData.angleKey + '.' + existingShapeData.shape.shape_name, 'direction:', adjacent.direction);

    // Check if the new shape can connect to the existing shape
    if (!canShapesConnect(shapeData, existingShapeData, adjacent.direction)) {
      console.log(`Invalid connection: ${shapeData.shape.shape_name} cannot connect to ${existingShapeData.shape.shape_name} (${adjacent.direction})`);
      return false;
    }
  }

  return true;
}

// Get adjacent cells in all four directions
function getAdjacentCells(cellPos, gridType) {
  const directions = [
    { direction: 'top', rowOffset: -1, colOffset: 0 },
    { direction: 'bottom', rowOffset: 1, colOffset: 0 },
    { direction: 'left', rowOffset: 0, colOffset: -1 },
    { direction: 'right', rowOffset: 0, colOffset: 1 }
  ];

  return directions.map(dir => ({
    direction: dir.direction,
    cell: getCellByPosition(
      cellPos.row + dir.rowOffset,
      cellPos.col + dir.colOffset,
      gridType
    )
  })).filter(adj => adj.cell !== null);
}

// Extract shape data from a placed cell
function getShapeDataFromCell(cell) {
  const img = cell.querySelector('img');
  if (!img) return null;

  // Extract shape info from the image src path
  // Format: ./assets/shapes/{category}/{angleKey}/{shape_name}.svg
  const srcPath = img.src;
  const pathParts = srcPath.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.svg', '');
  const angleKey = pathParts[pathParts.length - 2];
  const category = pathParts[pathParts.length - 3];

  // Find the shape data in rulesData
  if (!rulesData?.shapes?.[category]?.[angleKey]) {
    return null;
  }

  const shape = rulesData.shapes[category][angleKey].find(s => s.shape_name === fileName);
  if (!shape) {
    return null;
  }

  return {
    category,
    angleKey,
    shape
  };
}

// Check if two shapes can connect based on their allowed_connection_points
function canShapesConnect(newShape, existingShape, directionFromNewToExisting) {
  // Get allowed connection points for both shapes
  const newShapeConnections = parseConnectionPoints(newShape.shape.allowed_connection_points);
  const existingShapeConnections = parseConnectionPoints(existingShape.shape.allowed_connection_points);

  // Check if new shape allows connections in the direction of the existing shape
  const newShapeAllowsConnection = newShapeConnections.some(conn =>
    conn.direction === directionFromNewToExisting &&
    isShapeCompatible(conn.allowedShapes, existingShape)
  );

  // Check if existing shape allows connections from the direction of the new shape
  const oppositeDirection = getOppositeDirection(directionFromNewToExisting);
  const existingShapeAllowsConnection = existingShapeConnections.some(conn =>
    conn.direction === oppositeDirection &&
    isShapeCompatible(conn.allowedShapes, newShape)
  );

  return newShapeAllowsConnection && existingShapeAllowsConnection;
}

// Parse the allowed_connection_points string into structured data
function parseConnectionPoints(connectionString) {
  if (!connectionString) return [];

  // Format: "direction1 position1 angleKey1.shapeName1, direction2 position2 angleKey2.shapeName2"
  const connections = connectionString.split(',').map(conn => conn.trim());

  return connections.map(conn => {
    const parts = conn.split(' ');
    if (parts.length >= 3) {
      const direction = parts[0];
      const position = parts[1];
      const allowedShapes = parts.slice(2); // Can be multiple allowed shapes

      return {
        direction,
        position,
        allowedShapes
      };
    }
    return null;
  }).filter(conn => conn !== null);
}

// Check if a shape is compatible with the allowed shapes list
function isShapeCompatible(allowedShapes, shapeData) {
  const shapeIdentifier = `${shapeData.angleKey}.${shapeData.shape.shape_name}`;

  return allowedShapes.some(allowed => {
    // Handle wildcards like "0_deg.*" or just angleKey matches
    if (allowed.endsWith('.*')) {
      const allowedAngleKey = allowed.replace('.*', '');
      return shapeData.angleKey === allowedAngleKey;
    } else if (allowed === shapeIdentifier) {
      return true;
    } else if (allowed === shapeData.angleKey) {
      // Allow just angle key matching for simplified rules
      return true;
    }
    return false;
  });
}

// Get the opposite direction
function getOppositeDirection(direction) {
  const opposites = {
    'top': 'bottom',
    'bottom': 'top',
    'left': 'right',
    'right': 'left'
  };
  return opposites[direction] || direction;
}
