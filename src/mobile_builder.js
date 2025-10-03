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
    console.warn('rulesData not available yet, waiting...');
    setTimeout(initMobileBuilder, 50);
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

  container.innerHTML = '';

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
  if (!container || !window.texturesData?.textures) return;

  container.innerHTML = '';

  window.texturesData.textures.forEach(texture => {
    const textureButton = createMobileTextureButton(texture);
    container.appendChild(textureButton);
  });
}

// Create mobile texture button
function createMobileTextureButton(texture) {
  const button = document.createElement('button');
  button.className = 'mobile-shape-btn';
  button.dataset.category = 'textures';
  button.dataset.textureId = texture.id;

  // Create an image element for the texture
  const img = document.createElement('img');
  img.src = `/assets/textures/${texture.filename}`;
  img.alt = texture.name;
  img.className = 'h-8 w-auto object-contain pointer-events-none';

  button.appendChild(img);

  button.addEventListener('click', () => {
    handleMobileTextureSelection(button, texture);
  });

  return button;
}

// Handle mobile texture selection
function handleMobileTextureSelection(button, texture) {
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
  const selectedShape = {
    category,
    angleKey,
    shape,
    imagePath: `./assets/shapes/${category}/${angleKey}/${shape.shape_name}.svg`
  };

  if (window.setSelectedShape) {
    window.setSelectedShape(selectedShape);
  }

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

  if (!mobileSaveMenuBtn) return; // Not on mobile

  // Save menu with slide animation
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

  // Size menu with slide animation
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

  // Preview toggle
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

  // Erase mode toggle
  const mobileEraseBtn = document.getElementById('mobileEraseBtn');
  if (mobileEraseBtn) {
    setupEraseMode(mobileEraseBtn);
  }
}

// Setup erase mode functionality
let eraseMode = false;

function setupEraseMode(eraseBtn) {
  eraseBtn.addEventListener('click', () => {
    eraseMode = !eraseMode;

    // Clear any pending erase highlight when toggling
    if (window.clearPendingEraseHighlight) {
      window.clearPendingEraseHighlight();
    }

    // Update button appearance and icon
    const textSpan = eraseBtn.querySelector('span');
    const icon = document.getElementById('mobileEraseIcon');

    if (eraseMode) {
      eraseBtn.classList.add('bg-red-100', 'dark:bg-red-900');
      if (textSpan) {
        textSpan.classList.remove('text-gray-600', 'dark:text-gray-300');
        textSpan.classList.add('text-red-700', 'dark:text-red-300');
      }
      if (icon) {
        icon.src = '/assets/icons/erasing.svg';
      }
    } else {
      eraseBtn.classList.remove('bg-red-100', 'dark:bg-red-900');
      if (textSpan) {
        textSpan.classList.remove('text-red-700', 'dark:text-red-300');
        textSpan.classList.add('text-gray-600', 'dark:text-gray-300');
      }
      if (icon) {
        icon.src = '/assets/icons/erase.svg';
      }
    }

    // Update cursor for grid cells
    const gridsWrapper = document.querySelector('.builder-grids-wrapper');
    if (gridsWrapper) {
      if (eraseMode) {
        gridsWrapper.style.cursor = 'crosshair';
      } else {
        gridsWrapper.style.cursor = '';
      }
    }
  });
}

// Export erase mode state
window.isEraseMode = () => eraseMode;

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
    // Wait a bit for builder.js to initialize
    setTimeout(initMobileBuilder, 100);
  });
} else {
  // DOM already loaded
  setTimeout(initMobileBuilder, 100);
}
