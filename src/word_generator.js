// Word Generator - Randomly assemble typographic forms into words
// This module creates random "words" by combining archived form compositions

import {
  initializeSize,
  getCurrentSize,
  updateSizeDisplay as updateSizeDisplayDefault,
  setupDesktopSizeTabs,
  setupMobileSizeMenu,
  setupMobileBordersToggle,
  updateBordersDisplay
} from './mobile_controls.js';

// Initialize the word generator page
async function initWordGenerator() {
  console.log('Initializing word generator...');

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

    // Load archived forms to use as source material
    await loadArchivedForms();

    // Generate initial words
    generateWords();

    // Initialize size based on viewport (base for word generator)
    initializeSize('base', 'base');

    // Apply initial size
    updateSizeDisplay(getCurrentSize(), '.word-grids-wrapper');

    // Show the controls
    setupControls();

  } catch (error) {
    console.error('Failed to initialize word generator:', error);
    loadingElement.innerHTML = `
      <div class="text-red-500 text-xl mb-4">⚠️</div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">Failed to initialize word generator</p>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Error: ${error.message}</p>
    `;
  }
}

// Store loaded compositions globally
let archivedCompositions = [];

// Load all archived forms from the public/archive directory
async function loadArchivedForms() {
  try {
    // Load the manifest file to get list of available archives
    let archiveFiles;
    try {
      const manifestResponse = await fetch('./archive/manifest.json');
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        archiveFiles = manifest.files;
        console.log(`📋 Loaded manifest with ${archiveFiles.length} files`);
      } else {
        throw new Error('Manifest not found');
      }
    } catch (manifestError) {
      console.warn('Could not load manifest, falling back to hardcoded list:', manifestError);
      // Fallback to hardcoded list if manifest doesn't exist
      archiveFiles = [
        'apek.json',
        'cam.json',
        'cam_v2.json',
        'pyraflare.json',
        'phoenetic/A.json',
        'phoenetic/B.json',
        'phoenetic/C.json'
      ];
    }

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

    archivedCompositions = compositions;
    console.log(`🎉 Successfully loaded ${compositions.length} archived forms as source material`);

  } catch (error) {
    console.error('Failed to load archived forms:', error);
    throw error;
  }
}

// Generate random words
function generateWords() {
  const loadingElement = document.getElementById('loading');
  const wordsGrid = document.getElementById('words-grid');
  const wordsContainer = document.getElementById('words-container');
  const wordCountInput = document.getElementById('wordCount');

  const wordCount = parseInt(wordCountInput?.value || 6);

  // Hide loading, show words grid
  loadingElement.classList.add('hidden');
  wordsGrid.classList.remove('hidden');

  // Clear existing words
  wordsContainer.innerHTML = '';

  // Generate the specified number of words
  for (let i = 0; i < wordCount; i++) {
    const wordElement = createRandomWord(i);
    wordsContainer.appendChild(wordElement);
  }

  // Apply the current size settings to the newly generated words
  updateSizeDisplay(getCurrentSize());

  console.log(`Generated ${wordCount} random words`);
}

// Create a single random "word" by combining random forms
function createRandomWord(index) {
  const wordContainer = document.createElement('div');
  wordContainer.className = 'bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-2 md:p-6';

  // Random word length (2-5 forms)
  const wordLength = Math.floor(Math.random() * 4) + 2; // 2 to 5 forms

  // Header
  const header = document.createElement('div');
  header.className = 'mb-4 text-center';

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold text-gray-900 dark:text-gray-100';
  title.textContent = `Word ${index + 1}`;

  const meta = document.createElement('div');
  meta.className = 'text-sm text-gray-600 dark:text-gray-400 mt-1';
  meta.textContent = `${wordLength} form${wordLength > 1 ? 's' : ''}`;

  header.appendChild(title);
  header.appendChild(meta);
  wordContainer.appendChild(header);

  // Create container for the word (horizontal layout of forms)
  const wordDisplay = document.createElement('div');
  wordDisplay.className = 'relative bg-gray-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center overflow-x-auto';
  wordDisplay.style.minHeight = '350px';

  const formsWrapper = document.createElement('div');
  formsWrapper.className = 'flex items-center justify-center word-forms-wrapper';
  // Set gap based on current scale (default 4xl = 0.3)
  formsWrapper.style.gap = 'calc(0.3 * 8px)'; // Will be updated by size changes

  // Generate random forms for this word
  for (let i = 0; i < wordLength; i++) {
    const formElement = createRandomFormForWord();
    formsWrapper.appendChild(formElement);
  }

  wordDisplay.appendChild(formsWrapper);
  wordContainer.appendChild(wordDisplay);

  return wordContainer;
}

// Create a random form by selecting a random composition from archives
function createRandomFormForWord() {
  // Pick a random composition
  const randomComposition = archivedCompositions[Math.floor(Math.random() * archivedCompositions.length)];

  const formWrapper = document.createElement('div');
  formWrapper.className = 'inline-block';
  // Set formWrapper to the scaled size (500px * 0.3 = 150px at default 4xl)
  formWrapper.style.width = '150px';
  formWrapper.style.height = '150px';
  formWrapper.style.overflow = 'hidden';

  const gridsWrapper = document.createElement('div');
  gridsWrapper.className = 'relative word-grids-wrapper';
  gridsWrapper.style.transform = 'scale(0.3)'; // Default 4xl scale
  gridsWrapper.style.transformOrigin = 'top left'; // Scale from top-left corner

  // Create serifs grid (5x5)
  const serifsGrid = document.createElement('div');
  serifsGrid.className = 'grid grid-cols-5 gap-0 z-10';
  serifsGrid.style.width = '500px';
  serifsGrid.style.height = '500px';

  // Create joins grid (4x4, overlapped)
  const joinsGrid = document.createElement('div');
  joinsGrid.className = 'absolute grid grid-cols-4 gap-0 z-0';
  joinsGrid.style.width = '400px';
  joinsGrid.style.height = '400px';
  joinsGrid.style.top = '50px';
  joinsGrid.style.left = '50px';

  // Create grid cells
  createWordGridCells(serifsGrid, 25); // 5x5 = 25 cells
  createWordGridCells(joinsGrid, 16);  // 4x4 = 16 cells

  gridsWrapper.appendChild(serifsGrid);
  gridsWrapper.appendChild(joinsGrid);
  formWrapper.appendChild(gridsWrapper);

  // Apply the composition data to the grids
  if (randomComposition.grids?.serifs) {
    applyWordGridData(serifsGrid, randomComposition.grids.serifs);
  }

  if (randomComposition.grids?.joins) {
    applyWordGridData(joinsGrid, randomComposition.grids.joins);
  }

  // Calculate and apply kerning based on empty edge columns
  applyKerning(formWrapper, serifsGrid);

  return formWrapper;
}

// Detect empty columns on edges and apply kerning
function applyKerning(formWrapper, serifsGrid) {
  // Check which columns have content in the 5x5 serifs grid
  const columnHasContent = [false, false, false, false, false];

  // Check each cell in the grid
  for (let i = 0; i < 25; i++) {
    const cell = serifsGrid.children[i];
    const col = i % 5;

    // If cell has content (children), mark column as having content
    if (cell && cell.children.length > 0) {
      columnHasContent[col] = true;
    }
  }

  // Count empty columns on left edge
  let leftEmptyColumns = 0;
  for (let col = 0; col < 5; col++) {
    if (!columnHasContent[col]) {
      leftEmptyColumns++;
    } else {
      break; // Stop at first non-empty column
    }
  }

  // Count empty columns on right edge
  let rightEmptyColumns = 0;
  for (let col = 4; col >= 0; col--) {
    if (!columnHasContent[col]) {
      rightEmptyColumns++;
    } else {
      break; // Stop at first non-empty column
    }
  }

  // Apply kerning: 50% of column size (100px) = 50px per empty column
  const kernPerColumn = 50; // 50% of 100px column width
  const leftKern = leftEmptyColumns * kernPerColumn;
  const rightKern = rightEmptyColumns * kernPerColumn;

  // Apply negative margins to pull forms closer
  if (leftKern > 0) {
    formWrapper.style.marginLeft = `-${leftKern}px`;
  }
  if (rightKern > 0) {
    formWrapper.style.marginRight = `-${rightKern}px`;
  }

  // Store kerning info for debugging
  formWrapper.dataset.leftKern = leftKern;
  formWrapper.dataset.rightKern = rightKern;

  console.log(`Applied kerning: left=${leftEmptyColumns} cols (-${leftKern}px), right=${rightEmptyColumns} cols (-${rightKern}px)`);
}

// Create grid cells for word display
function createWordGridCells(grid, cellCount) {
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'w-[100px] h-[100px] relative word-grid-cell border border-gray-200 dark:border-gray-600 border-opacity-20';
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

// Apply shape data to word grid (similar to archive display)
function applyWordGridData(grid, gridData) {
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
          placeShapeInWordCell(cell, shapeData);
        } else {
          console.warn('Shape not found in rulesData:', shapeInfo.shapeName);
        }
      } else {
        console.warn('Category/angleKey not found in rulesData:', shapeInfo.category, shapeInfo.angleKey);
      }
    }
  });
}

// Place shape in word cell
function placeShapeInWordCell(cell, shapeData) {
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
    return;
  }

  svgElement.setAttribute('alt', shapeData.shape.shape_name);

  // Apply positioning
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

// Setup controls (size tabs, borders, generate button)
function setupControls() {
  const stickySubnav = document.getElementById('sticky-subnav');

  if (!stickySubnav) {
    console.warn('Sticky subnav not found');
    return;
  }

  // Show the sticky subnav only on desktop (md breakpoint and above)
  // On mobile, it stays hidden due to the md:block class
  const isMobile = window.innerWidth < 768;
  if (!isMobile) {
    stickySubnav.classList.remove('hidden');
  }

  // Setup desktop size tabs
  setupDesktopSizeTabs(updateSizeDisplay);

  // Setup mobile size menu
  setupMobileSizeMenu('.word-grids-wrapper', updateSizeDisplay);

  // Setup borders toggle
  setupBordersToggle();

  // Setup mobile borders toggle
  setupMobileBordersToggle('.word-grid-cell', updateBordersDisplay);

  // Setup generate button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateWords);
  }

  // Setup mobile generate button
  const mobileGenerateBtn = document.getElementById('mobileGenerateBtn');
  if (mobileGenerateBtn) {
    mobileGenerateBtn.addEventListener('click', generateWords);
  }
}

// Size scale mapping (same as archive)
const SIZE_SCALES = {
  '7xl': 0.6,
  '6xl': 0.5,
  '5xl': 0.4,
  '4xl': 0.3,
  '3xl': 0.25,
  '2xl': 0.2,
  'xl': 0.167,
  'lg': 0.15,
  'base': 0.133,
  'sm': 0.117,
  'xs': 0.1
};

// Update size display across all grid wrappers
function updateSizeDisplay(size) {
  const scale = SIZE_SCALES[size] || SIZE_SCALES['4xl'];
  const allGridWrappers = document.querySelectorAll('.word-grids-wrapper');
  const allFormsWrappers = document.querySelectorAll('.word-forms-wrapper');

  // Calculate the actual display size (500px grid * scale)
  const displaySize = 500 * scale;

  // Update grid scale
  allGridWrappers.forEach(wrapper => {
    wrapper.style.transform = `scale(${scale})`;
    // Update the parent formWrapper dimensions to match scaled size
    if (wrapper.parentElement) {
      const formWrapper = wrapper.parentElement;
      formWrapper.style.width = `${displaySize}px`;
      formWrapper.style.height = `${displaySize}px`;

      // Update kerning margins to scale with the size
      const leftKern = parseFloat(formWrapper.dataset.leftKern || 0);
      const rightKern = parseFloat(formWrapper.dataset.rightKern || 0);

      if (leftKern > 0) {
        formWrapper.style.marginLeft = `-${leftKern * scale}px`;
      }
      if (rightKern > 0) {
        formWrapper.style.marginRight = `-${rightKern * scale}px`;
      }
    }
  });

  // Update gap between forms to scale proportionally
  // Base gap is 8px, scaled by the size
  const scaledGap = `calc(${scale} * 8px)`;
  allFormsWrappers.forEach(wrapper => {
    wrapper.style.gap = scaledGap;
  });

  console.log(`Size changed to ${size} (scale: ${scale}, size: ${displaySize}px, gap: ${scaledGap}) for ${allGridWrappers.length} forms`);
}

// Setup borders toggle
function setupBordersToggle() {
  const bordersToggle = document.getElementById('bordersToggle');

  if (!bordersToggle) {
    console.warn('Borders toggle not found');
    return;
  }

  // Apply initial state (borders on by default)
  updateBordersDisplay(bordersToggle.checked, '.word-grid-cell');

  // Listen for toggle changes
  bordersToggle.addEventListener('change', (e) => {
    updateBordersDisplay(e.target.checked, '.word-grid-cell');
  });
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWordGenerator);
} else {
  initWordGenerator();
}

// Make functions globally accessible for debugging
window.initWordGenerator = initWordGenerator;
window.generateWords = generateWords;
