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
  }, 500);
});

// Override the hover behavior to show constraint validation
function overrideHoverBehavior() {
  console.log('Overriding hover behavior for constraint validation');

  // Get all grid cells and re-attach event listeners
  const allCells = document.querySelectorAll('.grid-cell');

  allCells.forEach(cell => {
    // Remove existing mouseenter listener by cloning the node
    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);

    // Add back all the necessary event listeners
    newCell.addEventListener('click', handleGridCellClick);
    newCell.addEventListener('contextmenu', handleGridCellRightClick);
    newCell.addEventListener('mouseenter', constrainedHandleGridCellHover);
    newCell.addEventListener('mouseleave', handleGridCellLeave);
  });

  console.log('Hover behavior successfully overridden for', allCells.length, 'cells');
}

// Enhanced hover handler with visual constraint validation
function constrainedHandleGridCellHover(event) {
  const selectedShape = window.getSelectedShape();
  if (!selectedShape) return;

  const cell = event.currentTarget;
  const gridType = cell.dataset.grid;

  // Check if shape can be placed on this grid
  const shapeGrid = window.rulesData.shapes[selectedShape.category].grid;
  if (gridType !== shapeGrid) return;

  // Clear previous highlights
  window.clearCellHighlights();

  // Highlight all cells this shape would occupy
  const occupiedCells = window.getOccupiedCells(cell, selectedShape);

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
  console.log('\n=== VALIDATION START ===');
  console.log('Validating connections for:', shapeData.angleKey + '.' + shapeData.shape.shape_name, 'at cell', targetCell.dataset.index);
  console.log('Shape dimensions:', shapeData.shape.width + 'x' + shapeData.shape.height);
  console.log('Shape connection points:', shapeData.shape.allowed_connection_points);

  // Get all cells that would be occupied by this shape
  const occupiedCells = window.getOccupiedCells(targetCell, shapeData);
  console.log('Shape will occupy cells:', occupiedCells.map(c => c ? c.dataset.index : 'null'));

  // For each occupied cell, check connections to adjacent existing shapes
  for (const occupiedCell of occupiedCells) {
    if (!occupiedCell) continue;

    const gridType = occupiedCell.dataset.grid;
    const cellIndex = parseInt(occupiedCell.dataset.index);
    const cellPos = window.getCellPosition(cellIndex, gridType);

    console.log('\n--- Checking connections from occupied cell:', cellIndex, 'at position (row ' + cellPos.row + ', col ' + cellPos.col + ') ---');

    // Get adjacent cells and check for existing shapes
    const adjacentCells = getAdjacentCells(cellPos, gridType);

    for (const adjacent of adjacentCells) {
      if (!adjacent.cell || !adjacent.cell.children.length) {
        continue; // No shape in this adjacent cell
      }

      // Skip if the adjacent cell is one of our own occupied cells
      if (occupiedCells.includes(adjacent.cell)) {
        continue;
      }

      // Get the existing shape data
      const existingShapeData = getShapeDataFromCell(adjacent.cell);
      if (!existingShapeData) {
        continue;
      }

      console.log('Found existing shape:', existingShapeData.angleKey + '.' + existingShapeData.shape.shape_name, 'in direction:', adjacent.direction, 'at cell:', adjacent.cell.dataset.index);
      console.log('Existing shape connection points:', existingShapeData.shape.allowed_connection_points);

      // Check if the new shape can connect to the existing shape
      if (!canShapesConnect(shapeData, existingShapeData, adjacent.direction, occupiedCell, adjacent.cell)) {
        console.log(`❌ INVALID CONNECTION: ${shapeData.shape.shape_name} cannot connect to ${existingShapeData.shape.shape_name} (${adjacent.direction}) from cell ${cellIndex}`);
        console.log('=== VALIDATION END (FAILED) ===\n');
        return false;
      } else {
        console.log(`✅ Valid connection: ${shapeData.shape.shape_name} can connect to ${existingShapeData.shape.shape_name} (${adjacent.direction}) from cell ${cellIndex}`);
      }
    }
  }

  console.log('✅ ALL CONNECTIONS VALID');
  console.log('=== VALIDATION END (PASSED) ===\n');
  return true;
}

// Get adjacent cells in all directions (including diagonals)
function getAdjacentCells(cellPos, gridType) {
  const directions = [
    // Cardinal directions
    { direction: 'top', rowOffset: -1, colOffset: 0 },
    { direction: 'bottom', rowOffset: 1, colOffset: 0 },
    { direction: 'left', rowOffset: 0, colOffset: -1 },
    { direction: 'right', rowOffset: 0, colOffset: 1 },
    // Diagonal directions
    { direction: 'top left', rowOffset: -1, colOffset: -1 },
    { direction: 'top right', rowOffset: -1, colOffset: 1 },
    { direction: 'bottom left', rowOffset: 1, colOffset: -1 },
    { direction: 'bottom right', rowOffset: 1, colOffset: 1 }
  ];

  return directions.map(dir => ({
    direction: dir.direction,
    cell: window.getCellByPosition(
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
  if (!window.rulesData?.shapes?.[category]?.[angleKey]) {
    return null;
  }

  const shape = window.rulesData.shapes[category][angleKey].find(s => s.shape_name === fileName);
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
function canShapesConnect(newShape, existingShape, directionFromNewToExisting, newShapeCell, existingShapeCell) {
  // Get allowed connection points for both shapes
  const newShapeConnections = parseConnectionPoints(newShape.shape.allowed_connection_points);
  const existingShapeConnections = parseConnectionPoints(existingShape.shape.allowed_connection_points);

  // For multi-cell shapes, we need to determine which connection points apply
  // based on the relative position within the shape
  const effectiveNewConnections = getEffectiveConnectionPoints(newShape, newShapeCell, newShapeConnections);
  const effectiveExistingConnections = getEffectiveConnectionPoints(existingShape, existingShapeCell, existingShapeConnections);

  console.log('    New shape effective connections:', effectiveNewConnections.map(c => c.direction + ' -> ' + c.allowedShapes.join(',')));
  console.log('    Existing shape effective connections:', effectiveExistingConnections.map(c => c.direction + ' -> ' + c.allowedShapes.join(',')));

  // Check if new shape allows connections in the direction of the existing shape
  const newShapeAllowsConnection = effectiveNewConnections.some(conn => {
    const directionMatches = conn.direction === directionFromNewToExisting;
    const shapeCompatible = isShapeCompatible(conn.allowedShapes, existingShape);
    console.log(`    New shape check: direction "${conn.direction}" === "${directionFromNewToExisting}"? ${directionMatches}, compatible? ${shapeCompatible}`);
    return directionMatches && shapeCompatible;
  });

  // Check if existing shape allows connections from the direction of the new shape
  const oppositeDirection = getOppositeDirection(directionFromNewToExisting);
  const existingShapeAllowsConnection = effectiveExistingConnections.some(conn => {
    const directionMatches = conn.direction === oppositeDirection;
    const shapeCompatible = isShapeCompatible(conn.allowedShapes, newShape);
    console.log(`    Existing shape check: direction "${conn.direction}" === "${oppositeDirection}"? ${directionMatches}, compatible? ${shapeCompatible}`);
    return directionMatches && shapeCompatible;
  });

  console.log('    🔹 New shape allows connection in direction "' + directionFromNewToExisting + '":', newShapeAllowsConnection);
  console.log('    🔹 Existing shape allows connection from direction "' + oppositeDirection + '":', existingShapeAllowsConnection);
  return newShapeAllowsConnection && existingShapeAllowsConnection;
}

// Get effective connection points for a specific cell within a multi-cell shape
function getEffectiveConnectionPoints(shapeData, shapeCell, allConnections) {
  const width = shapeData.shape.width || 1;
  const height = shapeData.shape.height || 1;

  // For 1x1 shapes, all connections are available from the single cell
  if (width === 1 && height === 1) {
    return allConnections;
  }

  // For multi-cell shapes, we need to find the primary cell (where the shape was placed)
  // and determine which connections are available from this specific cell

  // Find all cells occupied by this shape
  const occupiedCells = findOccupiedCellsForPlacedShape(shapeCell);

  if (occupiedCells.length <= 1) {
    // If we can't determine the shape structure, return all connections
    return allConnections;
  }

  // Determine which cell this is within the shape (primary, secondary, etc.)
  const cellIndex = parseInt(shapeCell.dataset.index);
  const gridType = shapeCell.dataset.grid;
  const cellPos = window.getCellPosition(cellIndex, gridType);

  // For 22.5° shapes, filter connections based on cell position within the multi-cell shape
  if (shapeData.angleKey === '22_5_deg') {
    return filterConnectionsForMultiCellShape(shapeData, cellPos, occupiedCells, allConnections, gridType);
  }

  // For other multi-cell shapes, return all connections for now
  return allConnections;
}

// Find all cells occupied by a placed shape by traversing from the given cell
function findOccupiedCellsForPlacedShape(startCell) {
  const occupiedCells = [startCell];
  const gridType = startCell.dataset.grid;
  const startIndex = parseInt(startCell.dataset.index);
  const startPos = window.getCellPosition(startIndex, gridType);

  // Check adjacent cells to find other parts of the same shape
  const directions = [
    { rowOffset: -1, colOffset: 0 }, // top
    { rowOffset: 1, colOffset: 0 },  // bottom
    { rowOffset: 0, colOffset: -1 }, // left
    { rowOffset: 0, colOffset: 1 }   // right
  ];

  for (const dir of directions) {
    const adjacentCell = window.getCellByPosition(
      startPos.row + dir.rowOffset,
      startPos.col + dir.colOffset,
      gridType
    );

    if (adjacentCell && adjacentCell.children.length > 0) {
      // Check if this cell has the same shape (same image src)
      const startImg = startCell.querySelector('img');
      const adjacentImg = adjacentCell.querySelector('img');

      if (startImg && adjacentImg && startImg.src === adjacentImg.src) {
        occupiedCells.push(adjacentCell);
      }
    }
  }

  return occupiedCells;
}

// Filter connections for multi-cell 22.5° shapes based on cell position
function filterConnectionsForMultiCellShape(shapeData, cellPos, occupiedCells, allConnections, gridType) {
  // For 22.5° shapes, connections are typically available from the ends of the shape
  // This is a simplified implementation - may need refinement based on actual shape geometry

  if (occupiedCells.length === 2) {
    // For 2-cell shapes, determine if this is the "first" or "second" cell
    const otherCell = occupiedCells.find(cell => cell !== occupiedCells[0] || cell !== occupiedCells[1]);

    // For now, allow all connections from both cells
    // TODO: Implement more specific logic based on shape orientation and connection geometry
    return allConnections;
  }

  return allConnections;
}

// Parse the allowed_connection_points string into structured data
function parseConnectionPoints(connectionString) {
  if (!connectionString) return [];

  // Format: "direction1 position1, direction2 position2" or "direction1 position1 angleKey1.shapeName1, ..."
  const connections = connectionString.split(',').map(conn => conn.trim());

  return connections.map(conn => {
    const parts = conn.split(' ');
    if (parts.length >= 2) {
      let direction = parts[0];
      const position = parts[1];
      let allowedShapes = [];

      // Combine direction and position for diagonal connections
      if (['top', 'bottom'].includes(direction) && ['left', 'right'].includes(position)) {
        direction = `${direction} ${position}`;  // e.g., "top left", "bottom right"
        allowedShapes = parts.slice(2);
      } else if (['left', 'right'].includes(direction) && ['top', 'bottom'].includes(position)) {
        direction = `${position} ${direction}`;  // e.g., "top right" from "right top"
        allowedShapes = parts.slice(2);
      } else {
        // Cardinal directions like "top center", "left center"
        allowedShapes = parts.slice(2);
      }

      // If no specific shapes are mentioned, allow any connection
      if (allowedShapes.length === 0) {
        allowedShapes = ['*']; // Wildcard for any shape
      }

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
    // Handle wildcard - any shape is allowed
    if (allowed === '*') {
      return true;
    }
    // Handle wildcards like "0_deg.*" or just angleKey matches
    else if (allowed.endsWith('.*')) {
      const allowedAngleKey = allowed.replace('.*', '');
      return shapeData.angleKey === allowedAngleKey;
    }
    // Exact shape match
    else if (allowed === shapeIdentifier) {
      return true;
    }
    // Allow just angle key matching for simplified rules
    else if (allowed === shapeData.angleKey) {
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
    'right': 'left',
    'top left': 'bottom right',
    'top right': 'bottom left',
    'bottom left': 'top right',
    'bottom right': 'top left'
  };
  return opposites[direction] || direction;
}
