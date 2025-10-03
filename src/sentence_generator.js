// Sentence Generator - Compose typographic sentences from assembled forms
// This module creates random "sentences" by combining multiple "words" (form groups)

// Sentence Generator - Randomly assemble typographic forms into sentences
// This module creates random "sentences" by combining archived form compositions

import {
  initializeSize,
  getCurrentSize,
  updateSizeDisplay as updateSizeDisplayDefault,
  setupDesktopSizeTabs,
  setupMobileSizeMenu,
  setupMobileBordersToggle,
  updateBordersDisplay,
  getBorderClasses
} from './mobile_controls.js';

// Initialize the sentence generator page
async function initSentenceGenerator() {
  console.log('Initializing sentence generator...');

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

    // Generate initial sentences
    generateSentences();

    // Initialize size based on viewport (xs for sentence generator)
    initializeSize('xs', 'xs');

    // Apply initial size
    updateSizeDisplay(getCurrentSize(), '.sentence-grids-wrapper');

    // Show the controls
    setupControls();

  } catch (error) {
    console.error('Failed to initialize sentence generator:', error);
    loadingElement.innerHTML = `
      <div class="text-red-500 text-xl mb-4">⚠️</div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">Failed to initialize sentence generator</p>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Error: ${error.message}</p>
    `;
  }
}

// Store loaded compositions globally
let archivedCompositions = [];

// Load all archived forms from the public/archive directory AND browser storage
async function loadArchivedForms() {
  try {
    const compositions = [];

    // PART 1: Load from archive folder
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

    // Load all archive files
    for (const filename of archiveFiles) {
      try {
        console.log(`Attempting to load: ./archive/${filename}`);
        const response = await fetch(`./archive/${filename}`);
        if (response.ok) {
          const composition = await response.json();
          composition.filename = filename;
          composition.source = 'archive';
          compositions.push(composition);
          console.log(`✅ Loaded ${filename}:`, composition.metadata?.name || 'Unknown');
        } else {
          console.warn(`❌ Failed to load ${filename}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ Error loading ${filename}:`, error);
      }
    }

    console.log(`Total compositions loaded from archive: ${compositions.length}`);

    // PART 2: Load from browser storage
    try {
      if (window.getAllCompositions) {
        const browserCompositions = await window.getAllCompositions();
        console.log(`📦 Found ${browserCompositions.length} compositions in browser storage`);

        // Add browser compositions to the list
        browserCompositions.forEach(comp => {
          comp.source = 'browser';
          compositions.push(comp);
          console.log(`✅ Loaded from browser:`, comp.metadata?.name || 'Unknown');
        });
      } else {
        console.warn('Browser storage not available (getAllCompositions function not found)');
      }
    } catch (browserError) {
      console.warn('Could not load compositions from browser storage:', browserError);
      // Don't throw - browser storage is optional
    }

    console.log(`Total compositions loaded: ${compositions.length} (archive + browser)`);

    if (compositions.length === 0) {
      throw new Error('No compositions could be loaded');
    }

    archivedCompositions = compositions;
    console.log(`🎉 Successfully loaded ${compositions.length} forms as source material`);

  } catch (error) {
    console.error('Failed to load archived forms:', error);
    throw error;
  }
}

// Generate random sentences
function generateSentences() {
  const loadingElement = document.getElementById('loading');
  const sentencesGrid = document.getElementById('sentences-grid');
  const sentencesContainer = document.getElementById('sentences-container');
  const sentenceCountInput = document.getElementById('sentenceCount');

  const sentenceCount = parseInt(sentenceCountInput?.value || 3);

  // Hide loading, show sentences grid
  loadingElement.classList.add('hidden');
  sentencesGrid.classList.remove('hidden');

  // Clear existing sentences
  sentencesContainer.innerHTML = '';

  // Generate the specified number of sentences
  for (let i = 0; i < sentenceCount; i++) {
    const sentenceElement = createRandomSentence(i);
    sentencesContainer.appendChild(sentenceElement);
  }

  // Apply the current size settings to the newly generated sentences
  updateSizeDisplay(getCurrentSize());

  console.log(`Generated ${sentenceCount} random sentences`);
}

// Create a single random "sentence" by combining multiple words
function createRandomSentence(index) {
  const sentenceContainer = document.createElement('div');
  sentenceContainer.className = 'bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-2 md:p-6';

  // Random sentence length (3-7 words)
  const sentenceLength = Math.floor(Math.random() * 5) + 3; // 3 to 7 words

  // Header
  const header = document.createElement('div');
  header.className = 'mb-4 text-center';

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold text-gray-900 dark:text-gray-100';
  title.textContent = `Sentence ${index + 1}`;

  const meta = document.createElement('div');
  meta.className = 'text-sm text-gray-600 dark:text-gray-400 mt-1';
  meta.textContent = `${sentenceLength} word${sentenceLength > 1 ? 's' : ''}`;

  header.appendChild(title);
  header.appendChild(meta);
  sentenceContainer.appendChild(header);

  // Create container for the sentence (horizontal layout of words with line wrapping)
  const sentenceDisplay = document.createElement('div');
  sentenceDisplay.className = 'relative bg-gray-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center overflow-x-auto';
  sentenceDisplay.style.minHeight = '400px';

  const wordsWrapper = document.createElement('div');
  wordsWrapper.className = 'flex flex-wrap items-center justify-center sentence-words-wrapper';
  // Using gap for vertical spacing between wrapped lines only (default base = 0.133)
  wordsWrapper.style.rowGap = 'calc(0.133 * 24px)'; // 24px base row spacing

  // Generate random words for this sentence, inserting empty grids as spaces
  for (let i = 0; i < sentenceLength; i++) {
    const wordElement = createRandomWord();
    wordsWrapper.appendChild(wordElement);

    // Add empty grid as space between words (but not after the last word)
    if (i < sentenceLength - 1) {
      const spaceElement = createWordSpace();
      wordsWrapper.appendChild(spaceElement);
    }
  }

  sentenceDisplay.appendChild(wordsWrapper);
  sentenceContainer.appendChild(sentenceDisplay);

  return sentenceContainer;
}

// Create a random "word" (2-5 forms) - reusing word generator logic
function createRandomWord() {
  const wordWrapper = document.createElement('div');
  wordWrapper.className = 'inline-flex items-center word-forms-wrapper';

  // Random word length (2-5 forms)
  const wordLength = Math.floor(Math.random() * 4) + 2; // 2 to 5 forms

  // Set gap based on current scale (default base = 0.133)
  wordWrapper.style.gap = 'calc(0.133 * 8px)'; // Will be updated by size changes

  // Generate random forms for this word
  for (let i = 0; i < wordLength; i++) {
    const formElement = createRandomFormForWord();
    wordWrapper.appendChild(formElement);
  }

  return wordWrapper;
}

// Create an empty grid to serve as a space between words
function createWordSpace() {
  const spaceWrapper = document.createElement('div');
  spaceWrapper.className = 'inline-block word-space';
  // Set to the scaled size (500px * 0.133 = 66.5px at default base)
  spaceWrapper.style.width = '66.5px';
  spaceWrapper.style.height = '66.5px';

  const gridsWrapper = document.createElement('div');
  gridsWrapper.className = 'relative sentence-grids-wrapper';
  gridsWrapper.style.transform = 'scale(0.133)'; // Default base scale
  gridsWrapper.style.transformOrigin = 'top left';

  // Create empty serifs grid (5x5) - no shapes will be added
  const serifsGrid = document.createElement('div');
  serifsGrid.className = 'grid grid-cols-5 gap-0 z-10';
  serifsGrid.style.width = '500px';
  serifsGrid.style.height = '500px';

  // Create grid cells (empty)
  createSentenceGridCells(serifsGrid, 25);

  gridsWrapper.appendChild(serifsGrid);
  spaceWrapper.appendChild(gridsWrapper);

  // Mark this as a space so kerning logic can skip it
  spaceWrapper.dataset.isSpace = 'true';

  return spaceWrapper;
}

// Create a random form by selecting a random composition from archives
function createRandomFormForWord() {
  // Pick a random composition
  const randomComposition = archivedCompositions[Math.floor(Math.random() * archivedCompositions.length)];

  const formWrapper = document.createElement('div');
  formWrapper.className = 'inline-block';
  // Set formWrapper to the scaled size (500px * 0.133 = 66.5px at default base)
  formWrapper.style.width = '66.5px';
  formWrapper.style.height = '66.5px';
  formWrapper.style.overflow = 'hidden';

  const gridsWrapper = document.createElement('div');
  gridsWrapper.className = 'relative sentence-grids-wrapper';
  gridsWrapper.style.transform = 'scale(0.133)'; // Default base scale
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
  createSentenceGridCells(serifsGrid, 25); // 5x5 = 25 cells
  createSentenceGridCells(joinsGrid, 16);  // 4x4 = 16 cells

  gridsWrapper.appendChild(serifsGrid);
  gridsWrapper.appendChild(joinsGrid);
  formWrapper.appendChild(gridsWrapper);

  // Apply the composition data to the grids
  if (randomComposition.grids?.serifs) {
    applySentenceGridData(serifsGrid, randomComposition.grids.serifs);
  }

  if (randomComposition.grids?.joins) {
    applySentenceGridData(joinsGrid, randomComposition.grids.joins);
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
}

// Create grid cells for sentence display
function createSentenceGridCells(grid, cellCount) {
  const borderClasses = getBorderClasses();
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = `w-[100px] h-[100px] relative sentence-grid-cell ${borderClasses}`;
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

// Apply shape data to sentence grid
function applySentenceGridData(grid, gridData) {
  // Group shapes by cell index to handle overlapping shapes properly
  const shapesByCell = {};
  gridData.shapes.forEach(shapeInfo => {
    if (!shapesByCell[shapeInfo.index]) {
      shapesByCell[shapeInfo.index] = [];
    }
    shapesByCell[shapeInfo.index].push(shapeInfo);
  });

  // Place shapes in each cell
  Object.keys(shapesByCell).forEach(cellIndex => {
    const cell = grid.children[cellIndex];
    if (!cell) return;

    const shapesInCell = shapesByCell[cellIndex];

    shapesInCell.forEach((shapeInfo, shapeIndex) => {
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
          // Clear cell for the first shape, allow overlap for subsequent shapes
          const allowOverlap = shapeIndex > 0;
          placeShapeInSentenceCell(cell, shapeData, allowOverlap);
        } else {
          console.warn('Shape not found in rulesData:', shapeInfo.shapeName);
        }
      } else {
        console.warn('Category/angleKey not found in rulesData:', shapeInfo.category, shapeInfo.angleKey);
      }
    });
  });
}

// Place shape in sentence cell
function placeShapeInSentenceCell(cell, shapeData, allowOverlap = false) {
  // Clear existing content only if not allowing overlap
  if (!allowOverlap) {
    cell.innerHTML = '';
  }

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
  setupMobileSizeMenu('.sentence-grids-wrapper', updateSizeDisplay);

  // Setup borders toggle
  setupBordersToggle();

  // Setup mobile borders toggle
  setupMobileBordersToggle('.sentence-grid-cell', updateBordersDisplay);

  // Setup generate button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateSentences);
  }

  // Setup mobile generate button
  const mobileGenerateBtn = document.getElementById('mobileGenerateBtn');
  if (mobileGenerateBtn) {
    mobileGenerateBtn.addEventListener('click', generateSentences);
  }
}

// Size scale mapping (same as word generator)
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
  const scale = SIZE_SCALES[size] || SIZE_SCALES['base'];
  const allGridWrappers = document.querySelectorAll('.sentence-grids-wrapper');
  const allWordWrappers = document.querySelectorAll('.word-forms-wrapper');
  const allSentenceWrappers = document.querySelectorAll('.sentence-words-wrapper');

  // Calculate the actual display size (500px grid * scale)
  const displaySize = 500 * scale;

  // Update grid scale and form wrapper dimensions
  allGridWrappers.forEach(wrapper => {
    wrapper.style.transform = `scale(${scale})`;
    // Update the parent formWrapper (or spaceWrapper) dimensions to match scaled size
    if (wrapper.parentElement) {
      const container = wrapper.parentElement;
      container.style.width = `${displaySize}px`;
      container.style.height = `${displaySize}px`;

      // Only apply kerning to actual forms, not spaces
      if (!container.dataset.isSpace) {
        // Update kerning margins to scale with the size
        const leftKern = parseFloat(container.dataset.leftKern || 0);
        const rightKern = parseFloat(container.dataset.rightKern || 0);

        if (leftKern > 0) {
          container.style.marginLeft = `-${leftKern * scale}px`;
        }
        if (rightKern > 0) {
          container.style.marginRight = `-${rightKern * scale}px`;
        }
      }
    }
  });

  // Update gap between forms within words
  const scaledFormGap = `calc(${scale} * 8px)`;
  allWordWrappers.forEach(wrapper => {
    wrapper.style.gap = scaledFormGap;
  });

  // Update row gap for wrapped sentence lines (no columnGap since we use empty grids for spacing)
  const scaledRowGap = `calc(${scale} * 24px)`; // Row spacing for wrapped lines
  allSentenceWrappers.forEach(wrapper => {
    wrapper.style.rowGap = scaledRowGap;
  });

  console.log(`Size changed to ${size} (scale: ${scale}, size: ${displaySize}px) for ${allGridWrappers.length} forms`);
}

// Setup borders toggle
function setupBordersToggle() {
  const bordersToggle = document.getElementById('bordersToggle');

  if (!bordersToggle) {
    console.warn('Borders toggle not found');
    return;
  }

  // Apply initial state (borders on by default)
  updateBordersDisplay(bordersToggle.checked, '.sentence-grid-cell');

  // Listen for toggle changes
  bordersToggle.addEventListener('change', (e) => {
    updateBordersDisplay(e.target.checked, '.sentence-grid-cell');
  });
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSentenceGenerator);
} else {
  initSentenceGenerator();
}

// Make functions globally accessible for debugging
window.initSentenceGenerator = initSentenceGenerator;
window.generateSentences = generateSentences;
