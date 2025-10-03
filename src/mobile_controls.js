// Mobile Controls Module
// Shared functionality for mobile size and borders controls across archive, word_generator, and sentence_generator

// Size scale mapping
export const SIZE_SCALES = {
  '7xl': 0.6,      // text-7xl equivalent (72px / 4.5rem) - desktop default
  '6xl': 0.5,      // text-6xl equivalent (60px / 3.75rem)
  '5xl': 0.4,      // text-5xl equivalent (48px / 3rem)
  '4xl': 0.3,      // text-4xl equivalent (36px / 2.25rem) - mobile default
  '3xl': 0.25,     // text-3xl equivalent (30px / 1.875rem)
  '2xl': 0.2,      // text-2xl equivalent (24px / 1.5rem)
  'xl': 0.167,     // text-xl equivalent (20px / 1.25rem)
  'lg': 0.15,      // text-lg equivalent (18px / 1.125rem)
  'base': 0.133,   // text-base equivalent (16px / 1rem)
  'sm': 0.117,     // text-sm equivalent (14px / 0.875rem)
  'xs': 0.1        // text-xs equivalent (12px / 0.75rem)
};

let currentSize = null;

// Detect if we're on mobile
export function isMobile() {
  return window.innerWidth < 768; // md breakpoint
}

// Get current size
export function getCurrentSize() {
  return currentSize;
}

// Set current size
export function setCurrentSize(size) {
  currentSize = size;
}

// Initialize current size based on viewport and page type
export function initializeSize(mobileDefault = '4xl', desktopDefault = '7xl') {
  currentSize = isMobile() ? mobileDefault : desktopDefault;
  return currentSize;
}

// Update size display for given wrapper selector
export function updateSizeDisplay(size, wrapperSelector = '.archive-grids-wrapper') {
  const scale = SIZE_SCALES[size] || SIZE_SCALES[isMobile() ? '4xl' : '7xl'];
  const allGridWrappers = document.querySelectorAll(wrapperSelector);

  allGridWrappers.forEach(wrapper => {
    wrapper.style.transform = `scale(${scale})`;
  });

  console.log(`Size changed to ${size} (scale: ${scale}) for ${allGridWrappers.length} forms`);
}

// Setup desktop size tabs
export function setupDesktopSizeTabs(customUpdateFunction = null) {
  const stickySubnav = document.getElementById('sticky-subnav');

  if (!stickySubnav) {
    console.warn('Sticky subnav not found');
    return;
  }

  // Show the sticky subnav now that forms are loaded (desktop only)
  if (!isMobile()) {
    stickySubnav.classList.remove('hidden');
  }

  // Get all size tab buttons
  const sizeButtons = document.querySelectorAll('.size-tab');

  // Set initial active state
  sizeButtons.forEach(button => {
    if (button.dataset.size === currentSize) {
      button.className = 'size-tab px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-500 text-white';
    } else {
      button.className = 'size-tab px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700';
    }
  });

  // Add click handlers
  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const size = button.dataset.size;
      currentSize = size;

      // Update active state
      sizeButtons.forEach(btn => {
        if (btn === button) {
          btn.className = 'size-tab px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-500 text-white';
        } else {
          btn.className = 'size-tab px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700';
        }
      });

      // Apply the size change using custom function if provided
      if (customUpdateFunction) {
        customUpdateFunction(size);
      } else {
        updateSizeDisplay(size);
      }
    });
  });
}

// Setup mobile size menu
export function setupMobileSizeMenu(wrapperSelector = '.archive-grids-wrapper', customUpdateFunction = null) {
  const mobileSizeBtn = document.getElementById('mobileSizeBtn');
  const mobileSizeMenu = document.getElementById('mobileSizeMenu');
  const closeSizeMenu = document.getElementById('closeSizeMenu');
  const mobileSizeButtons = document.getElementById('mobileSizeButtons');

  if (!mobileSizeBtn || !mobileSizeMenu) {
    console.log('Mobile size controls not found (probably on desktop)');
    return;
  }

  // Always clear and rebuild buttons to ensure correct state
  const sizes = ['7xl', '6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'];

  // Clear existing buttons
  mobileSizeButtons.innerHTML = '';

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

      // Use custom update function if provided, otherwise use default
      if (customUpdateFunction) {
        customUpdateFunction(size);
      } else {
        updateSizeDisplay(size, wrapperSelector);
      }

      mobileSizeMenu.classList.add('hidden');

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

  console.log('Mobile size buttons created');

  // Only set up event listeners once
  if (!mobileSizeBtn.dataset.listenerAttached) {
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
    mobileSizeBtn.dataset.listenerAttached = 'true';

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

    console.log('Mobile size menu event listeners attached');
  }
}

// Setup mobile borders toggle
export function setupMobileBordersToggle(cellSelector, updateFunction) {
  const mobileBordersBtn = document.getElementById('mobileBordersBtn');
  const mobileBordersIcon = document.getElementById('mobileBordersIcon');
  const bordersToggle = document.getElementById('bordersToggle');

  if (!mobileBordersBtn) {
    console.log('Mobile borders button not found (probably on desktop)');
    return;
  }

  // Only set up event listeners once
  if (mobileBordersBtn.dataset.listenerAttached) {
    console.log('Mobile borders toggle already initialized, skipping');
    return;
  }
  mobileBordersBtn.dataset.listenerAttached = 'true';

  let bordersVisible = bordersToggle ? bordersToggle.checked : true;

  // Set initial icon
  if (mobileBordersIcon) {
    mobileBordersIcon.src = bordersVisible ? '/assets/icons/eye.svg' : '/assets/icons/eye-slash.svg';
  }

  mobileBordersBtn.addEventListener('click', () => {
    bordersVisible = !bordersVisible;

    // Use the provided update function or default
    if (updateFunction) {
      updateFunction(bordersVisible, cellSelector);
    } else {
      updateBordersDisplay(bordersVisible, cellSelector);
    }

    // Update icon
    if (mobileBordersIcon) {
      mobileBordersIcon.src = bordersVisible ? '/assets/icons/eye.svg' : '/assets/icons/eye-slash.svg';
    }

    // Update desktop toggle if it exists
    if (bordersToggle) {
      bordersToggle.checked = bordersVisible;
    }
  });

  console.log('Mobile borders toggle event listener attached');
}

// Default borders display update
export function updateBordersDisplay(showBorders, cellSelector = '.archive-grid-cell') {
  const allCells = document.querySelectorAll(cellSelector);

  allCells.forEach(cell => {
    if (showBorders) {
      cell.classList.add('border', 'border-gray-200', 'dark:border-gray-600', 'border-opacity-20');
    } else {
      cell.classList.remove('border', 'border-gray-200', 'dark:border-gray-600', 'border-opacity-20');
    }
  });
}
