// ============================================================================
// MOBILE UI FUNCTIONS
// ============================================================================

// Size scale mapping (matching archive.js)
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

let currentSize = '5xl'; // Default mobile size

// Setup mobile UI - tabs and horizontal scrollable shape selectors
function setupMobileUI() {
  const mobileSerifTab = document.getElementById('mobileSerifTab');
  const mobileBodiesTab = document.getElementById('mobileBodiesTab');
  const mobileJoinsTab = document.getElementById('mobileJoinsTab');

  if (!mobileSerifTab) return; // Not on mobile or element doesn't exist

  // Populate mobile shape selectors
  populateMobileShapes('serifs', 'mobileSerifShapes');
  populateMobileShapes('bodies', 'mobileBodiesShapes');
  populateMobileShapes('joins', 'mobileJoinsShapes');

  // Tab switching - allow toggling off if clicking active tab
  mobileSerifTab.addEventListener('click', () => switchMobileTab('serifs'));
  mobileBodiesTab.addEventListener('click', () => switchMobileTab('bodies'));
  mobileJoinsTab.addEventListener('click', () => switchMobileTab('joins'));

  // Set initial tab
  switchMobileTab('serifs');
}

// Populate mobile shape selector
function populateMobileShapes(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !rulesData?.shapes) return;

  container.innerHTML = '';

  const categoryData = rulesData.shapes[category];
  if (!categoryData) return;

  Object.keys(categoryData).forEach(angleKey => {
    if (angleKey === 'grid') return;

    const shapes = categoryData[angleKey];
    shapes.forEach(shape => {
      const shapeButton = createMobileShapeButton(category, angleKey, shape);
      container.appendChild(shapeButton);
    });
  });
}

// Create mobile shape button
function createMobileShapeButton(category, angleKey, shape) {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn';
  button.dataset.category = category;
  button.dataset.angleKey = angleKey;
  button.dataset.shapeName = shape.shape_name;

  // Create SVG element
  const svgElement = window.SVGUtils?.createSVGElement(
    category,
    angleKey,
    shape.shape_name,
    'w-12 h-12 object-contain pointer-events-none'
  );

  if (svgElement) {
    button.appendChild(svgElement);
  } else {
    button.textContent = shape.shape_name.substring(0, 2);
  }

  button.addEventListener('click', () => {
    handleMobileShapeSelection(button, category, angleKey, shape);
  });

  return button;
}

// Handle mobile shape selection
function handleMobileShapeSelection(button, category, angleKey, shape) {
  // Remove previous selection
  document.querySelectorAll('.mobile-shape-btn.selected').forEach(el => {
    el.classList.remove('selected');
  });
  document.querySelectorAll('.shape-selected').forEach(el => {
    el.classList.remove('shape-selected', 'bg-blue-200', 'border-blue-500');
  });

  // Add selection to clicked button
  button.classList.add('selected');

  // Update selected shape (same as desktop)
  selectedShape = {
    category,
    angleKey,
    shape,
    imagePath: `./assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`
  };

  updateSelectedShapeDisplay();
}

// Switch mobile tab
let activeTab = null; // Track which tab is currently active

function switchMobileTab(category) {
  const tabs = {
    serifs: document.getElementById('mobileSerifTab'),
    bodies: document.getElementById('mobileBodiesTab'),
    joins: document.getElementById('mobileJoinsTab')
  };

  const selectors = {
    serifs: document.getElementById('mobileSerifShapes'),
    bodies: document.getElementById('mobileBodiesShapes'),
    joins: document.getElementById('mobileJoinsShapes')
  };

  const selectorWrapper = document.getElementById('mobileShapeSelectorWrapper');

  // If clicking the active tab, toggle it off
  if (activeTab === category) {
    // Hide the selector wrapper
    if (selectorWrapper) {
      selectorWrapper.classList.add('hidden');
    }

    // Reset all tabs to inactive state
    Object.keys(tabs).forEach(key => {
      if (tabs[key]) {
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-gray-200 dark:bg-slate-700 border-r border-gray-300 dark:border-gray-700';
      }
    });

    // Hide all selectors
    Object.keys(selectors).forEach(key => {
      if (selectors[key]) {
        selectors[key].classList.add('hidden');
      }
    });

    activeTab = null;
    return;
  }

  // First, hide all selectors
  Object.keys(selectors).forEach(key => {
    if (selectors[key]) {
      selectors[key].classList.add('hidden');
    }
  });

  // Show the selector wrapper
  if (selectorWrapper) {
    selectorWrapper.classList.remove('hidden');
  }

  // Show only the selected category's selector
  if (selectors[category]) {
    selectors[category].classList.remove('hidden');
  }

  // Update tab styles
  Object.keys(tabs).forEach(key => {
    if (tabs[key]) {
      if (key === category) {
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-white dark:bg-slate-800 border-r border-gray-300 dark:border-gray-700';
      } else {
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-gray-200 dark:bg-slate-700 border-r border-gray-300 dark:border-gray-700';
      }
    }
  });

  // Update active tab
  activeTab = category;

  // Update current tab for grid layer management
  if (category === 'bodies') {
    currentTab = 'bodies';
  } else if (category === 'serifs') {
    currentTab = 'bodies'; // Serifs use the same grid as bodies
  } else if (category === 'joins') {
    currentTab = 'joins';
  }

  updateGridLayers();
}

// Setup mobile toolbar buttons
function setupMobileToolbar() {
  const mobileSaveMenuBtn = document.getElementById('mobileSaveMenuBtn');
  const mobileSizeBtn = document.getElementById('mobileSizeBtn');
  const mobilePreviewBtn = document.getElementById('mobilePreviewBtn');
  const mobileSaveMenu = document.getElementById('mobileSaveMenu');
  const mobileSizeMenu = document.getElementById('mobileSizeMenu');
  const closeSaveMenu = document.getElementById('closeSaveMenu');
  const closeSizeMenu = document.getElementById('closeSizeMenu');

  if (!mobileSaveMenuBtn) return; // Not on mobile

  // Save menu
  mobileSaveMenuBtn.addEventListener('click', () => {
    mobileSaveMenu.classList.remove('hidden');
  });

  closeSaveMenu.addEventListener('click', () => {
    mobileSaveMenu.classList.add('hidden');
  });

  // Close on backdrop click
  mobileSaveMenu.addEventListener('click', (e) => {
    if (e.target === mobileSaveMenu) {
      mobileSaveMenu.classList.add('hidden');
    }
  });

  // Size menu
  mobileSizeBtn.addEventListener('click', () => {
    mobileSizeMenu.classList.remove('hidden');
  });

  closeSizeMenu.addEventListener('click', () => {
    mobileSizeMenu.classList.add('hidden');
  });

  mobileSizeMenu.addEventListener('click', (e) => {
    if (e.target === mobileSizeMenu) {
      mobileSizeMenu.classList.add('hidden');
    }
  });

  // Preview toggle
  let previewActive = false;
  mobilePreviewBtn.addEventListener('click', () => {
    previewActive = !previewActive;
    previewMode = previewActive;
    document.body.classList.toggle('preview-mode', previewActive);

    const icon = document.getElementById('mobilePreviewIcon');
    if (icon) {
      icon.src = previewActive ? '/assets/icons/eye-slash.svg' : '/assets/icons/eye.svg';
    }
  });
}

// Setup size options
function setupSizeOptions() {
  const mobileSizeButtons = document.getElementById('mobileSizeButtons');
  if (!mobileSizeButtons) return;

  const sizes = ['7xl', '6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'];

  sizes.forEach(size => {
    const button = document.createElement('button');
    button.className = `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      size === currentSize
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
    }`;
    button.textContent = size;
    button.addEventListener('click', () => {
      currentSize = size;
      applyGridScale(size);
      document.getElementById('mobileSizeMenu').classList.add('hidden');

      // Update button styles
      mobileSizeButtons.querySelectorAll('button').forEach(btn => {
        if (btn === button) {
          btn.className = 'px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-blue-500 text-white';
        } else {
          btn.className = 'px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600';
        }
      });
    });
    mobileSizeButtons.appendChild(button);
  });
}

// Apply grid scale based on size
function applyGridScale(size) {
  const scale = SIZE_SCALES[size] || SIZE_SCALES['5xl'];
  const gridsWrapper = document.querySelector('.builder-grids-wrapper');

  if (gridsWrapper) {
    gridsWrapper.style.transform = `scale(${scale})`;
  }
}

// Apply responsive scale based on screen size
function applyResponsiveScale() {
  const isMobile = window.innerWidth < 768; // md breakpoint

  if (isMobile) {
    // On mobile, apply the selected size scale
    applyGridScale(currentSize);
  } else {
    // On desktop, use full size (scale 1)
    const gridsWrapper = document.querySelector('.builder-grids-wrapper');
    if (gridsWrapper) {
      gridsWrapper.style.transform = 'scale(1)';
    }
  }
}
