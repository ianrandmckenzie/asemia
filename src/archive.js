// Archive viewer - Load and display archived typographic forms
// This module handles loading archive JSON files and rendering them in a grid layout

// Initialize the archive page
async function initArchive() {
  console.log('Initializing archive...');

  // Update loading message to show progress
  const loadingElement = document.getElementById('loading');
  loadingElement.innerHTML = `
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p class="mt-4 text-gray-600 dark:text-gray-300">Loading builder core...</p>
  `;

  try {
    // Initialize builder core (loads rules and exports functions)
    if (window.initBuilderCore) {
      await window.initBuilderCore();
    } else {
      throw new Error('Builder core not available');
    }

    loadingElement.innerHTML = `
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Loading archived forms...</p>
    `;

    // Load archived forms
    await loadArchivedForms();

  } catch (error) {
    console.error('Failed to initialize archive:', error);
    loadingElement.innerHTML = `
      <div class="text-red-500 text-xl mb-4">⚠️</div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">Failed to initialize archive</p>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Error: ${error.message}</p>
    `;
  }
}

// Load the rules.json file (fallback if builder core not available)
async function loadRules() {
  try {
    const response = await fetch('./assets/rules.json');
    const rulesData = await response.json();
    window.rulesData = rulesData;
    console.log('Rules data loaded successfully');
    return rulesData;
  } catch (error) {
    console.error('Failed to load rules.json:', error);
    throw error;
  }
}

// Load all archived forms from the public/archive directory
async function loadArchivedForms() {
  const archiveFiles = [
    'apek.json',
    'cam.json',
    'cam_v2.json',
    'pyraflare.json',
    'phoenetic/A.json',
    'phoenetic/B.json',
    'phoenetic/C.json'
  ];

  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const archiveGrid = document.getElementById('archive-grid');
  const archiveFormsContainer = document.getElementById('archive-forms');

  try {
    const compositions = [];

    // Load all archive files
    for (const filename of archiveFiles) {
      try {
        console.log(`Attempting to load: ./archive/${filename}`);
        const response = await fetch(`./archive/${filename}`);
        if (response.ok) {
          const composition = await response.json();
          composition.filename = filename;
          compositions.push(composition);
          console.log(`✅ Loaded ${filename}:`, composition.metadata?.name || 'Unknown');
        } else {
          console.warn(`❌ Failed to load ${filename}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ Error loading ${filename}:`, error);
      }
    }

    console.log(`Total compositions loaded: ${compositions.length}`);

    if (compositions.length === 0) {
      throw new Error('No compositions could be loaded');
    }

    // Hide loading, show archive grid
    loadingElement.classList.add('hidden');
    archiveGrid.classList.remove('hidden');

    // Clear and populate the forms container
    archiveFormsContainer.innerHTML = '';

    compositions.forEach((composition, index) => {
      console.log(`Creating form element ${index + 1}/${compositions.length}:`, composition.metadata?.name);
      const formElement = createArchiveForm(composition);
      archiveFormsContainer.appendChild(formElement);
    });

    console.log(`🎉 Successfully loaded ${compositions.length} archived forms`);

  } catch (error) {
    console.error('Failed to load archived forms:', error);
    loadingElement.classList.add('hidden');
    showError();
  }
}

// Create a single archived form display
function createArchiveForm(composition) {
  const formContainer = document.createElement('div');
  formContainer.className = 'bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6';

  // Header with title and metadata
  const header = document.createElement('div');
  header.className = 'mb-6';

  const title = document.createElement('h2');
  title.className = 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2';
  title.textContent = composition.metadata?.name || 'Untitled';

  const metadata = document.createElement('div');
  metadata.className = 'text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4';

  if (composition.metadata?.created) {
    const date = new Date(composition.metadata.created);
    const dateSpan = document.createElement('span');
    dateSpan.textContent = `Created: ${date.toLocaleDateString()}`;
    metadata.appendChild(dateSpan);
  }

  const filenameSpan = document.createElement('span');
  filenameSpan.textContent = `File: ${composition.filename}`;
  metadata.appendChild(filenameSpan);

  header.appendChild(title);
  header.appendChild(metadata);
  formContainer.appendChild(header);

  // Create the grid display (same structure as freebuilder)
  const gridContainer = document.createElement('div');
  gridContainer.className = 'relative bg-gray-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center';
  gridContainer.style.minHeight = '400px';

  const gridsWrapper = document.createElement('div');
  gridsWrapper.className = 'relative';
  gridsWrapper.style.transform = 'scale(0.6)'; // Scale down to fit in archive view

  // Create serifs grid (5x5)
  const serifsGrid = document.createElement('div');
  serifsGrid.className = 'grid grid-cols-5 gap-0 z-10';
  serifsGrid.style.width = '500px';
  serifsGrid.style.height = '500px';
  serifsGrid.id = `serifs-${composition.filename.replace('.json', '')}`;

  // Create joins grid (4x4, overlapped)
  const joinsGrid = document.createElement('div');
  joinsGrid.className = 'absolute grid grid-cols-4 gap-0 z-0';
  joinsGrid.style.width = '400px';
  joinsGrid.style.height = '400px';
  joinsGrid.style.top = '50px';
  joinsGrid.style.left = '50px';
  joinsGrid.id = `joins-${composition.filename.replace('.json', '')}`;

  // Create grid cells
  createArchiveGridCells(serifsGrid, 25); // 5x5 = 25 cells
  createArchiveGridCells(joinsGrid, 16);  // 4x4 = 16 cells

  gridsWrapper.appendChild(serifsGrid);
  gridsWrapper.appendChild(joinsGrid);
  gridContainer.appendChild(gridsWrapper);
  formContainer.appendChild(gridContainer);

  // Apply the composition data to the grids
  if (composition.grids?.serifs) {
    applyArchiveGridData(serifsGrid, composition.grids.serifs);
  }

  if (composition.grids?.joins) {
    applyArchiveGridData(joinsGrid, composition.grids.joins);
  }

  return formContainer;
}

// Create grid cells for archive display
function createArchiveGridCells(grid, cellCount) {
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'w-[100px] h-[100px] relative border border-gray-200 dark:border-gray-600 border-opacity-20';
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

// Apply shape data to archive grid (similar to storage.js but for archive display)
function applyArchiveGridData(grid, gridData) {
  gridData.shapes.forEach(shapeInfo => {
    const cell = grid.children[shapeInfo.index];
    if (cell) {
      // Recreate the shape data object
      const shapeData = {
        category: shapeInfo.category,
        angleKey: shapeInfo.angleKey,
        shape: {
          shape_name: shapeInfo.shapeName
        },
        imagePath: shapeInfo.imagePath
      };

      // Find the actual shape data from rulesData for proper placement
      if (window.rulesData?.shapes?.[shapeInfo.category]?.[shapeInfo.angleKey]) {
        const foundShape = window.rulesData.shapes[shapeInfo.category][shapeInfo.angleKey]
          .find(s => s.shape_name === shapeInfo.shapeName);

        if (foundShape) {
          shapeData.shape = foundShape;
          placeShapeInArchiveCell(cell, shapeData);
        } else {
          console.warn('Shape not found in rulesData:', shapeInfo.shapeName);
          // Create fallback display
          createFallbackShape(cell, shapeInfo.shapeName);
        }
      } else {
        console.warn('Category/angleKey not found in rulesData:', shapeInfo.category, shapeInfo.angleKey);
        // Create fallback display
        createFallbackShape(cell, shapeInfo.shapeName);
      }
    }
  });
}

// Place shape in archive cell (simplified version of placeShapeInCell)
function placeShapeInArchiveCell(cell, shapeData) {
  // Clear existing content
  cell.innerHTML = '';

  // Create SVG element
  const baseClasses = 'absolute';
  let svgElement = null;

  if (window.SVGUtils && window.SVGUtils.createSVGElement) {
    svgElement = window.SVGUtils.createSVGElement(
      shapeData.category,
      shapeData.angleKey,
      shapeData.shape.shape_name,
      baseClasses
    );
  }

  if (!svgElement) {
    console.warn('Could not create SVG for shape:', shapeData);
    createFallbackShape(cell, shapeData.shape.shape_name);
    return;
  }

  svgElement.setAttribute('alt', shapeData.shape.shape_name);

  // Apply positioning (reuse the logic from builder.js if available)
  if (window.applyPositioning) {
    window.applyPositioning(svgElement, shapeData);
  } else {
    // Basic positioning fallback
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';
    svgElement.style.top = '0';
    svgElement.style.left = '0';
  }

  cell.appendChild(svgElement);
}

// Create fallback shape display when SVG is not available
function createFallbackShape(cell, shapeName) {
  const textElement = document.createElement('div');
  textElement.textContent = shapeName.substring(0, 4);
  textElement.className = 'absolute inset-0 flex items-center justify-center text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded';
  cell.appendChild(textElement);
}

// Show error state
function showError() {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');

  loadingElement.classList.add('hidden');
  errorElement.classList.remove('hidden');
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchive);
} else {
  initArchive();
}

// Make functions globally accessible for debugging
window.initArchive = initArchive;
window.loadArchivedForms = loadArchivedForms;
