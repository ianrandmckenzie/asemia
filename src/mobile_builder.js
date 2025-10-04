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

let currentSize = '7xl'; // Default mobile size
let mobileCleanMode = false; // Track if mobile clean mode is active

// Initialize mobile builder
async function initMobileBuilder() {
  // Check if this is a builder page (has mobile shape tabs)
  const mobileSerifTab = document.getElementById('mobileSerifTab');
  if (!mobileSerifTab) {
    console.log('Mobile builder not needed on this page (no shape tabs found)');
    return;
  }

  // Wait for builder core to be ready
  if (!window.rulesData) {
    console.warn('rulesData not available yet, waiting for builderReady event...');
    // Don't use setTimeout, wait for the proper event
    return;
  }

  setupMobileUI();
  setupMobileToolbar();
  setupSizeOptions();
  applyResponsiveScale();

  // Listen for window resize to adjust scale
  window.addEventListener('resize', applyResponsiveScale);

  // Open serifs tab by default
  switchMobileTab('serifs');

  console.log('Mobile builder initialized');
}

// Setup mobile UI - tabs and horizontal scrollable shape selectors
function setupMobileUI() {
  const mobileSerifTab = document.getElementById('mobileSerifTab');
  const mobileBodiesTab = document.getElementById('mobileBodiesTab');
  const mobileJoinsTab = document.getElementById('mobileJoinsTab');
  const mobileTexturesTab = document.getElementById('mobileTexturesTab');

  if (!mobileSerifTab) return; // Not on mobile or element doesn't exist

  // Populate mobile shape selectors
  populateMobileShapes('serifs', 'mobileSerifShapes');
  populateMobileShapes('bodies', 'mobileBodiesShapes');
  populateMobileShapes('joins', 'mobileJoinsShapes');
  populateMobileTextures('mobileTexturesShapes');

  // Tab switching - allow toggling off if clicking active tab
  mobileSerifTab.addEventListener('click', () => switchMobileTab('serifs'));
  mobileBodiesTab.addEventListener('click', () => switchMobileTab('bodies'));
  mobileJoinsTab.addEventListener('click', () => switchMobileTab('joins'));
  mobileTexturesTab.addEventListener('click', () => switchMobileTab('textures'));

  // Start with all hidden (no initial tab)
}

// Populate mobile shape selector
function populateMobileShapes(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.rulesData?.shapes) return;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  container.innerHTML = `
    <button id="mobile${capitalizedCategory}EraseBtn" class="mobile-shape-btn flex-shrink-0">
      <img src="/assets/icons/erase.svg" alt="Erase ${capitalizedCategory}" class="w-6 h-6 dark:invert">
    </button>
  `;

  const categoryData = window.rulesData.shapes[category];
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

// Populate mobile textures selector
function populateMobileTextures(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Add color picker section first
  const colorPickerSection = createMobileColorPickerSection();
  container.appendChild(colorPickerSection);

  // Add clean button
  const cleanButton = createMobileCleanButton();
  container.appendChild(cleanButton);

  // Add textures if available
  if (window.texturesData?.textures) {
    window.texturesData.textures.forEach(texture => {
      const textureButton = createMobileTextureButton(texture);
      container.appendChild(textureButton);
    });
  }
}

// Create mobile color picker section
function createMobileColorPickerSection() {
  const section = document.createElement('div');
  section.className = 'flex gap-2 mb-3 pr-2';

  // Black button
  const blackButton = createMobileColorButton('Black', '#000000', 'black');
  section.appendChild(blackButton);

  // White button
  const whiteButton = createMobileColorButton('White', '#FFFFFF', 'white');
  section.appendChild(whiteButton);

  // Color picker button
  const colorPickerButton = createMobileColorPickerButton();
  section.appendChild(colorPickerButton);

  return section;
}

// Create mobile solid color button
function createMobileColorButton(name, color, id) {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn flex-shrink-0 overflow-hidden flex flex-col';
  button.dataset.category = 'textures';
  button.dataset.colorId = id;
  button.dataset.colorValue = color;

  // Color preview
  const preview = document.createElement('div');
  preview.className = 'flex-1 w-full';
  preview.style.backgroundColor = color;
  if (id === 'white') {
    preview.style.border = '1px solid #d1d5db';
  }

  // Label
  const label = document.createElement('div');
  label.className = 'text-[10px] font-medium py-0.5';
  label.textContent = name;

  button.appendChild(preview);
  button.appendChild(label);

  button.addEventListener('click', () => {
    handleMobileColorSelection(button, {
      type: 'color',
      id: id,
      name: name,
      color: color
    });
  });

  return button;
}

// Create mobile color picker button
function createMobileColorPickerButton() {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn flex-shrink-0 overflow-hidden flex flex-col relative';
  button.dataset.category = 'textures';
  button.type = 'button';

  // Color preview
  const preview = document.createElement('div');
  preview.className = 'flex-1 w-full relative';
  preview.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #FFA07A 75%, #98D8C8 100%)';

  // Hidden color input
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'absolute inset-0 w-full h-full opacity-0 cursor-pointer';
  colorInput.value = '#FF6B6B';
  preview.appendChild(colorInput);

  // Label
  const label = document.createElement('div');
  label.className = 'text-[10px] font-medium py-0.5';
  label.textContent = 'Custom';

  button.appendChild(preview);
  button.appendChild(label);

  // Handle color change
  colorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    preview.style.backgroundColor = color;

    handleMobileColorSelection(button, {
      type: 'color',
      id: 'custom',
      name: 'Custom Color',
      color: color
    });
  });

  // Click button to trigger color picker
  button.addEventListener('click', (e) => {
    if (e.target !== colorInput) {
      colorInput.click();
    }
  });

  return button;
}

// Create mobile clean button
function createMobileCleanButton() {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn flex-shrink-0 overflow-hidden flex flex-col items-center justify-center gap-1 bg-white dark:bg-slate-900 mr-2';
  button.id = 'mobileCleanTextureBtn';
  button.dataset.category = 'textures';
  button.type = 'button';

  // Icon
  const icon = document.createElement('img');
  icon.src = '/assets/icons/clean.svg';
  icon.alt = 'Clean';
  icon.className = 'h-6 w-6 dark:invert';

  // Label
  const label = document.createElement('div');
  label.className = 'text-[10px] font-medium';
  label.textContent = 'Clean';

  button.appendChild(icon);
  button.appendChild(label);

  button.addEventListener('click', () => {
    handleMobileCleanSelection(button);
  });

  return button;
}

// Handle mobile clean selection
function handleMobileCleanSelection(button) {
  // Clear any active mobile erase modes
  if (typeof clearMobileEraseModes === 'function') {
    clearMobileEraseModes();
  }

  // Toggle mobile clean mode
  mobileCleanMode = !mobileCleanMode;

  // Update button appearance
  if (mobileCleanMode) {
    // Remove selection from other buttons
    document.querySelectorAll('.mobile-shape-btn[data-category="textures"]').forEach(el => {
      if (el.id !== 'mobileCleanTextureBtn') {
        el.classList.remove('selected');
      }
    });

    button.classList.add('selected');

    // Clear selectedTexture
    if (window.setSelectedTexture) {
      window.setSelectedTexture(null);
    }

    // Reset textures tab icon to default
    const mobileTexturesTab = document.getElementById('mobileTexturesTab');
    if (mobileTexturesTab) {
      const iconContainer = mobileTexturesTab.querySelector('.flex.flex-col');
      if (iconContainer) {
        const existingIcon = iconContainer.querySelector('svg, img, div.color-indicator');
        if (existingIcon && !existingIcon.tagName === 'svg') {
          // Restore the default SVG icon
          const defaultSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          defaultSvg.setAttribute('class', 'h-6 w-auto');
          defaultSvg.setAttribute('fill', 'currentColor');
          defaultSvg.setAttribute('viewBox', '0 0 100 100');
          defaultSvg.innerHTML = '<rect width="40" height="40" x="0" y="0" opacity="0.8"/><rect width="40" height="40" x="60" y="0" opacity="0.5"/><rect width="40" height="40" x="0" y="60" opacity="0.3"/><rect width="40" height="40" x="60" y="60" opacity="0.9"/>';
          existingIcon.replaceWith(defaultSvg);
        }
      }
    }
  } else {
    button.classList.remove('selected');
  }

  // Sync with desktop clean mode
  if (window.clearCleanMode && !mobileCleanMode) {
    window.clearCleanMode();
  }

  if (window.updateSelectedShapeDisplay) {
    window.updateSelectedShapeDisplay();
  }
}

// Handle mobile color selection
function handleMobileColorSelection(button, colorData) {
  // Clear any active mobile erase modes
  if (typeof clearMobileEraseModes === 'function') {
    clearMobileEraseModes();
  }

  // Clear mobile clean mode
  mobileCleanMode = false;

  // Remove previous selection
  document.querySelectorAll('.mobile-shape-btn[data-category="textures"]').forEach(el => {
    el.classList.remove('selected');
  });

  // Add selection to clicked button
  button.classList.add('selected');

  // Update the mobile textures tab icon with a color indicator
  const mobileTexturesTab = document.getElementById('mobileTexturesTab');
  if (mobileTexturesTab) {
    const iconContainer = mobileTexturesTab.querySelector('.flex.flex-col');
    if (iconContainer) {
      const existingIcon = iconContainer.querySelector('svg, img, div.color-indicator');

      // Create color indicator
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'color-indicator h-6 w-6 rounded border border-gray-300 dark:border-gray-600';
      colorIndicator.style.backgroundColor = colorData.color;

      if (existingIcon) {
        existingIcon.replaceWith(colorIndicator);
      }
    }
  }

  // Update selectedTexture
  if (window.setSelectedTexture) {
    window.setSelectedTexture(colorData);
  }

  if (window.updateSelectedShapeDisplay) {
    window.updateSelectedShapeDisplay();
  }
}

// Create mobile texture button
function createMobileTextureButton(texture) {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn overflow-hidden';
  button.dataset.category = 'textures';
  button.dataset.textureId = texture.id;

  // Create an image element for the texture
  const img = document.createElement('img');
  img.src = `/assets/textures/${texture.filename}`;
  img.alt = texture.name;
  img.className = 'h-full w-auto object-contain pointer-events-none';

  button.appendChild(img);

  button.addEventListener('click', () => {
    handleMobileTextureSelection(button, texture);
  });

  return button;
}

// Handle mobile texture selection
function handleMobileTextureSelection(button, texture) {
  // Clear any active mobile erase modes when selecting a texture
  if (typeof clearMobileEraseModes === 'function') {
    clearMobileEraseModes();
  }

  // Clear mobile clean mode
  mobileCleanMode = false;

  // Remove previous selection from texture buttons
  document.querySelectorAll('.mobile-shape-btn[data-category="textures"]').forEach(el => {
    el.classList.remove('selected');
  });

  // Add selection to clicked button
  button.classList.add('selected');

  // Update the mobile textures tab icon with the selected texture
  const mobileTexturesTab = document.getElementById('mobileTexturesTab');
  if (mobileTexturesTab) {
    const iconContainer = mobileTexturesTab.querySelector('.flex.flex-col');
    if (iconContainer) {
      // Find the SVG or image element
      const existingIcon = iconContainer.querySelector('svg, img');

      if (existingIcon) {
        // Replace with an image of the selected texture
        const textureImg = document.createElement('img');
        textureImg.src = `/assets/textures/${texture.filename}`;
        textureImg.alt = texture.name;
        textureImg.className = 'h-6 w-6 object-cover rounded';

        existingIcon.replaceWith(textureImg);
      }
    }
  }

  // Update selectedTexture (not selectedShape)
  if (window.setSelectedTexture) {
    window.setSelectedTexture(texture);
  }

  if (window.updateSelectedShapeDisplay) {
    window.updateSelectedShapeDisplay();
  }
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
    'h-8 w-auto object-contain pointer-events-none'
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
  // Clear any active mobile erase modes when selecting a shape
  if (typeof clearMobileEraseModes === 'function') {
    clearMobileEraseModes();
  }

  // Clear any pending placement when selecting a new shape
  if (window.clearPendingPlacement) {
    window.clearPendingPlacement();
  }

  // Remove previous selection from shape buttons only
  document.querySelectorAll('.mobile-shape-btn.selected').forEach(el => {
    // Only clear if it's not a texture button
    if (!el.dataset.textureId) {
      el.classList.remove('selected');
    }
  });
  document.querySelectorAll('.shape-selected').forEach(el => {
    el.classList.remove('shape-selected', 'bg-blue-200', 'border-blue-500');
  });

  // Add selection to clicked button
  button.classList.add('selected');

  // Update selected shape (same as desktop)
  const selectedShape = {
    category,
    angleKey,
    shape,
    imagePath: `./assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`
  };

  if (window.setSelectedShape) {
    window.setSelectedShape(selectedShape);
  }

  // DON'T clear texture selection - textures and shapes should coexist

  if (window.updateSelectedShapeDisplay) {
    window.updateSelectedShapeDisplay();
  }
}

// Switch mobile tab
let activeTab = null; // Track which tab is currently active

function switchMobileTab(category) {
  const tabs = {
    serifs: document.getElementById('mobileSerifTab'),
    bodies: document.getElementById('mobileBodiesTab'),
    joins: document.getElementById('mobileJoinsTab'),
    textures: document.getElementById('mobileTexturesTab')
  };

  const selectors = {
    serifs: document.getElementById('mobileSerifShapes'),
    bodies: document.getElementById('mobileBodiesShapes'),
    joins: document.getElementById('mobileJoinsShapes'),
    textures: document.getElementById('mobileTexturesShapes')
  };

  const selectorWrapper = document.getElementById('mobileShapeSelectorWrapper');

  // Clear any pending placement when switching tabs
  if (window.clearPendingPlacement) {
    window.clearPendingPlacement();
  }

  // Clear erase modes when switching tabs
  clearMobileEraseModes();

  // Clear clean mode when switching away from textures
  if (category !== 'textures' && mobileCleanMode) {
    mobileCleanMode = false;
    const cleanBtn = document.getElementById('mobileCleanTextureBtn');
    if (cleanBtn) {
      cleanBtn.classList.remove('selected');
    }
  }

  // If clicking the active tab, toggle it off
  if (activeTab === category) {
    // Hide the selector wrapper
    if (selectorWrapper) {
      selectorWrapper.classList.add('hidden');
    }

    // Reset all tabs to inactive state
    Object.keys(tabs).forEach(key => {
      if (tabs[key]) {
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-gray-200 dark:bg-slate-800 border-r border-gray-300 dark:border-gray-700';
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
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-white dark:bg-slate-700 border-r border-gray-300 dark:border-gray-700';
      } else {
        tabs[key].className = 'mobile-tab flex-1 py-3 px-2 bg-gray-200 dark:bg-slate-800 border-r border-gray-300 dark:border-gray-700';
      }
    }
  });

  // Update active tab
  activeTab = category;

  // Update current tab for grid layer management
  if (window.setCurrentTab) {
    if (category === 'bodies') {
      window.setCurrentTab('bodies');
    } else if (category === 'serifs') {
      window.setCurrentTab('bodies'); // Serifs use the same grid as bodies
    } else if (category === 'joins') {
      window.setCurrentTab('joins');
    }
  }

  if (window.updateGridLayers) {
    window.updateGridLayers();
  }
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

  // Save menu with slide animation (if it exists)
  if (mobileSaveMenuBtn && mobileSaveMenu && closeSaveMenu) {
    mobileSaveMenuBtn.addEventListener('click', () => {
    const isHidden = mobileSaveMenu.classList.contains('hidden');
    const panel = mobileSaveMenu.querySelector('.absolute');

    if (isHidden) {
      // Show menu: remove hidden and translate
      mobileSaveMenu.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.remove('translate-y-full');
          panel.classList.add('translate-y-0');
        });
      });
    } else {
      // Hide menu: slide down then hide
      mobileSaveMenu.classList.add('opacity-0');
      panel.classList.remove('translate-y-0');
      panel.classList.add('translate-y-full');
      setTimeout(() => {
        mobileSaveMenu.classList.add('hidden');
        mobileSaveMenu.classList.remove('opacity-0');
      }, 200);
    }
  });

  closeSaveMenu.addEventListener('click', () => {
    const panel = mobileSaveMenu.querySelector('.absolute');
    mobileSaveMenu.classList.add('opacity-0');
    panel.classList.remove('translate-y-0');
    panel.classList.add('translate-y-full');
    setTimeout(() => {
      mobileSaveMenu.classList.add('hidden');
      mobileSaveMenu.classList.remove('opacity-0');
    }, 150);
  });

  // Close on backdrop click
  mobileSaveMenu.addEventListener('click', (e) => {
    if (e.target === mobileSaveMenu) {
      const panel = mobileSaveMenu.querySelector('.absolute');
      mobileSaveMenu.classList.add('opacity-0');
      panel.classList.remove('translate-y-0');
      panel.classList.add('translate-y-full');
      setTimeout(() => {
        mobileSaveMenu.classList.add('hidden');
        mobileSaveMenu.classList.remove('opacity-0');
      }, 150);
    }
  });
  } // End mobileSaveMenuBtn if block

  // Size menu with slide animation
  if (mobileSizeBtn && mobileSizeMenu && closeSizeMenu) {
  mobileSizeBtn.addEventListener('click', () => {
    const isHidden = mobileSizeMenu.classList.contains('hidden');
    const panel = mobileSizeMenu.querySelector('.absolute');

    if (isHidden) {
      // Show menu: remove hidden and translate
      mobileSizeMenu.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.remove('translate-y-full');
          panel.classList.add('translate-y-0');
        });
      });
    } else {
      // Hide menu: slide down then hide
      mobileSizeMenu.classList.add('opacity-0');
      panel.classList.remove('translate-y-0');
      panel.classList.add('translate-y-full');
      setTimeout(() => {
        mobileSizeMenu.classList.add('hidden');
        mobileSizeMenu.classList.remove('opacity-0');
      }, 200);
    }
  });

  closeSizeMenu.addEventListener('click', () => {
    const panel = mobileSizeMenu.querySelector('.absolute');
    mobileSizeMenu.classList.add('opacity-0');
    panel.classList.remove('translate-y-0');
    panel.classList.add('translate-y-full');
    setTimeout(() => {
      mobileSizeMenu.classList.add('hidden');
      mobileSizeMenu.classList.remove('opacity-0');
    }, 150);
  });

  mobileSizeMenu.addEventListener('click', (e) => {
    if (e.target === mobileSizeMenu) {
      const panel = mobileSizeMenu.querySelector('.absolute');
      mobileSizeMenu.classList.add('opacity-0');
      panel.classList.remove('translate-y-0');
      panel.classList.add('translate-y-full');
      setTimeout(() => {
        mobileSizeMenu.classList.add('hidden');
        mobileSizeMenu.classList.remove('opacity-0');
      }, 150);
    }
  });
  } // End mobileSizeBtn if block

  // Preview toggle
  if (mobilePreviewBtn) {
  let previewActive = false;
  mobilePreviewBtn.addEventListener('click', () => {
    previewActive = !previewActive;

    if (window.setPreviewMode) {
      window.setPreviewMode(previewActive);
    }

    // Update button appearance and icon
    const textSpan = mobilePreviewBtn.querySelector('span');
    const icon = document.getElementById('mobilePreviewIcon');

    if (previewActive) {
      mobilePreviewBtn.classList.add('bg-blue-100', 'dark:bg-blue-900');
      if (textSpan) {
        textSpan.classList.remove('text-gray-600', 'dark:text-gray-300');
        textSpan.classList.add('text-blue-700', 'dark:text-blue-300');
      }
      if (icon) {
        icon.src = '/assets/icons/eye-slash.svg';
      }
    } else {
      mobilePreviewBtn.classList.remove('bg-blue-100', 'dark:bg-blue-900');
      if (textSpan) {
        textSpan.classList.remove('text-blue-700', 'dark:text-blue-300');
        textSpan.classList.add('text-gray-600', 'dark:text-gray-300');
      }
      if (icon) {
        icon.src = '/assets/icons/eye.svg';
      }
    }
  });
  } // End mobilePreviewBtn if block

  // Clear Grids button
  const mobileClearGridsBtn = document.getElementById('mobileClearGridsBtn');
  if (mobileClearGridsBtn) {
    mobileClearGridsBtn.addEventListener('click', () => {
      if (window.clearAllGrids) {
        window.clearAllGrids();
      }
    });
  }

  // Setup mobile category erase buttons
  setupMobileCategoryEraseButtons();
}

// Setup mobile category-specific erase buttons
let mobileEraseModes = {
  serifs: false,
  bodies: false,
  joins: false
};

function setupMobileCategoryEraseButtons() {
  const eraseButtons = {
    serifs: document.getElementById('mobileSerifsEraseBtn'),
    bodies: document.getElementById('mobileBodiesEraseBtn'),
    joins: document.getElementById('mobileJoinsEraseBtn')
  };

  Object.entries(eraseButtons).forEach(([category, btn]) => {
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Toggle this category's erase mode
      mobileEraseModes[category] = !mobileEraseModes[category];

      // Turn off other categories' erase modes
      Object.keys(mobileEraseModes).forEach(cat => {
        if (cat !== category) mobileEraseModes[cat] = false;
      });

      // Clear any pending erase highlight when toggling
      if (window.clearPendingEraseHighlight) {
        window.clearPendingEraseHighlight();
      }

      // Clear any pending placement when toggling erase mode
      if (window.clearPendingPlacement) {
        window.clearPendingPlacement();
      }

      // Update all button appearances
      updateMobileEraseButtonAppearances();

      // Update cursor for grid cells
      const gridsWrapper = document.querySelector('.builder-grids-wrapper');
      if (gridsWrapper) {
        const anyEraseMode = Object.values(mobileEraseModes).some(mode => mode);
        gridsWrapper.style.cursor = anyEraseMode ? 'crosshair' : '';
      }
    });
  });
}

// Update all mobile erase button appearances
function updateMobileEraseButtonAppearances() {
  const buttons = [
    { category: 'serifs', id: 'mobileSerifsEraseBtn' },
    { category: 'bodies', id: 'mobileBodiesEraseBtn' },
    { category: 'joins', id: 'mobileJoinsEraseBtn' }
  ];

  buttons.forEach(({ category, id }) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    const icon = btn.querySelector('img');
    const isActive = mobileEraseModes[category];

    if (isActive) {
      // Active state - red theme with scale effect
      btn.classList.remove('border-gray-300', 'dark:border-gray-700');
      btn.classList.add('border-red-500', 'dark:border-red-400');
      btn.style.borderWidth = '3px';
      btn.style.boxShadow = '0 0 0 2px rgb(254 202 202)'; // red-200
      if (icon) {
        icon.src = '/assets/icons/erasing.svg';
      }
    } else {
      // Inactive state - default theme
      btn.classList.remove('border-red-500', 'dark:border-red-400');
      btn.classList.add('border-gray-300', 'dark:border-gray-700');
      btn.style.borderWidth = '';
      btn.style.boxShadow = '';
      if (icon) {
        icon.src = '/assets/icons/erase.svg';
      }
    }
  });
}

// Clear all mobile erase modes and update UI
function clearMobileEraseModes() {
  mobileEraseModes.serifs = false;
  mobileEraseModes.bodies = false;
  mobileEraseModes.joins = false;

  if (window.clearPendingEraseHighlight) {
    window.clearPendingEraseHighlight();
  }

  updateMobileEraseButtonAppearances();

  // Update cursor
  const gridsWrapper = document.querySelector('.builder-grids-wrapper');
  if (gridsWrapper) {
    gridsWrapper.style.cursor = '';
  }
}

// Export erase mode state
window.isEraseMode = () => Object.values(mobileEraseModes).some(mode => mode);
window.getMobileEraseCategory = () => {
  for (const [category, active] of Object.entries(mobileEraseModes)) {
    if (active) return category;
  }
  return null;
};

// Export clean mode state
window.getMobileCleanMode = () => mobileCleanMode;
window.clearMobileCleanMode = () => {
  if (mobileCleanMode) {
    mobileCleanMode = false;
    const cleanBtn = document.getElementById('mobileCleanTextureBtn');
    if (cleanBtn) {
      cleanBtn.classList.remove('selected');
    }
  }
};

// Export function to hide save menu with animation (for onclick handlers)
window.hideMobileSaveMenu = function() {
  const mobileSaveMenu = document.getElementById('mobileSaveMenu');
  const panel = mobileSaveMenu?.querySelector('.absolute');
  if (mobileSaveMenu && panel) {
    mobileSaveMenu.classList.add('opacity-0');
    panel.classList.remove('translate-y-0');
    panel.classList.add('translate-y-full');
    setTimeout(() => {
      mobileSaveMenu.classList.add('hidden');
      mobileSaveMenu.classList.remove('opacity-0');
    }, 150);
  }
};

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

      // Hide menu with animation
      const mobileSizeMenu = document.getElementById('mobileSizeMenu');
      const panel = mobileSizeMenu.querySelector('.absolute');
      mobileSizeMenu.classList.add('opacity-0');
      panel.classList.remove('translate-y-0');
      panel.classList.add('translate-y-full');
      setTimeout(() => {
        mobileSizeMenu.classList.add('hidden');
        mobileSizeMenu.classList.remove('opacity-0');
      }, 150);

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

// Initialize when DOM is ready and builder is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for builder to be ready
    document.addEventListener('builderReady', initMobileBuilder, { once: true });
  });
} else {
  // DOM already loaded, wait for builder
  document.addEventListener('builderReady', initMobileBuilder, { once: true });
}
