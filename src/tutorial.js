/**
 * Freebuilder Tutorial System
 * Provides guided onboarding for first-time users
 *
 * Features:
 * - Step-by-step walkthrough of builder features
 * - Responsive design (mobile and desktop)
 * - Skippable at any point
 * - Persistent state (localStorage)
 * - Help button for returning users
 */

// Tutorial step definitions
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to the Asemic Typeform Crafter!',
    content: 'Build unique typographic forms using the fundamental elements of type: Serifs, Bodies, and Joins.\n\nLet\'s take a quick tour.',
    targetSelector: null, // Full overlay
    position: 'center',
    showSkip: true,
    highlightPulse: false
  },
  {
    id: 'grids',
    title: 'Understanding the Grids',
    content: 'You work with two overlapping grids:\n\n• 5×5 Serifs Grid (white cells)\n• 4×4 Joins Grid (inset, connecting elements)\n\nClick anywhere in the grid to place shapes.',
    targetSelector: '.builder-grids-wrapper',
    position: 'bottom',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'mobile-tabs',
    title: 'Selecting Shapes',
    content: 'Tap a tab to view available shapes in that category.\n\nThen tap a shape to select it.',
    targetSelector: '#mobileSerifTab',
    position: 'bottom',
    highlightPulse: true,
    showSkip: true,
    mobileOnly: true
  },
  {
    id: 'desktop-sidebar',
    title: 'Selecting Shapes',
    content: 'Choose from Bodies/Serifs or Joins in the sidebar.\n\nClick a shape to select it.\n\nYour selected shape appears at the top.',
    targetSelector: '#sidebar',
    position: 'right',
    highlightPulse: true,
    showSkip: true,
    desktopOnly: true
  },
  {
    id: 'placing-shapes',
    title: 'Placing Shapes',
    content: 'Click or tap any grid cell to place your selected shape.\n\n• Serifs/Bodies go in the 5×5 grid\n• Joins go in the 4×4 grid\n\nRight-click (or long-press) to remove a shape.',
    targetSelector: '.builder-grids-wrapper',
    position: 'bottom',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'erase-mode',
    title: 'Erase Mode',
    content: 'Toggle Erase Mode to quickly remove shapes.\n\nTap the Erase button, then tap any shape to remove it.',
    targetSelector: window.innerWidth < 768 ? '#mobileEraseBtn' : '#desktopEraseBtn',
    position: window.innerWidth < 768 ? 'top' : 'bottom',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'preview-mode',
    title: 'Preview Mode',
    content: 'Hide grid lines to see your form without distractions.\n\nToggle Preview Mode to view your composition cleanly.',
    targetSelector: window.innerWidth < 768 ? '#mobilePreviewBtn' : '#desktopPreviewBtn',
    position: window.innerWidth < 768 ? 'top' : 'bottom',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'saving',
    title: 'Saving & Loading',
    content: 'Save your work to browser storage or download as JSON.\n\nUse the Save menu to manage your compositions.',
    targetSelector: window.innerWidth < 768 ? '#mobileSaveMenuBtn' : null,
    position: window.innerWidth < 768 ? 'top' : 'center',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'size',
    title: 'Adjusting Size',
    content: 'Change the grid size to view your form at different scales.\n\nExperiment with different sizes to see how your composition looks.',
    targetSelector: window.innerWidth < 768 ? '#mobileSizeBtn' : null,
    position: window.innerWidth < 768 ? 'top' : 'center',
    highlightPulse: true,
    showSkip: true
  },
  {
    id: 'complete',
    title: 'You\'re Ready to Create!',
    content: 'Start building your asemic typeforms.\n\nExperiment, explore, and have fun.\n\n💡 Tip: Check out the Archive to see examples, or try the Word and Sentence Generators for inspiration.',
    targetSelector: null,
    position: 'center',
    highlightPulse: false,
    showSkip: false
  }
];

let currentStep = 0;
let tutorialActive = false;
let isMobile = window.innerWidth < 768;

// Forward declare these functions so they can be used in window functions
let cleanupCurrentStep, getFilteredSteps, showStep, completeTutorial;

/**
 * Advance to next tutorial step
 */
window.nextTutorialStep = function() {
  console.log('Next button clicked, current step:', currentStep);
  cleanupCurrentStep();

  const filteredSteps = getFilteredSteps();
  currentStep++;

  if (currentStep >= filteredSteps.length) {
    completeTutorial();
    return;
  }

  showStep(filteredSteps[currentStep]);
}

/**
 * Go back to previous step
 */
window.previousTutorialStep = function() {
  console.log('Back button clicked');
  cleanupCurrentStep();
  currentStep--;

  const filteredSteps = getFilteredSteps();
  if (currentStep < 0) currentStep = 0;

  showStep(filteredSteps[currentStep]);
}

/**
 * Skip tutorial entirely
 */
window.skipTutorial = function() {
  console.log('Skip button clicked');
  cleanupCurrentStep();
  completeTutorial();
}

/**
 * Initialize tutorial system
 * Checks if user has seen tutorial before
 */
export function initTutorial() {
  console.log('Initializing tutorial system...');

  // Check if user has seen tutorial
  if (localStorage.getItem('hasSeenFreebuilderTutorial')) {
    console.log('User has seen tutorial, adding help button');
    addHelpButton();
    return;
  }

  // Show tutorial after brief delay to let UI settle
  setTimeout(() => {
    console.log('Starting tutorial for first-time user');
    startTutorial();
  }, 1500);
}

/**
 * Start the tutorial from beginning
 */
export function startTutorial() {
  tutorialActive = true;
  currentStep = 0;
  isMobile = window.innerWidth < 768;

  // Filter steps based on device
  const steps = getFilteredSteps();
  if (steps.length > 0) {
    showStep(steps[0]);
  }
}

/**
 * Get tutorial steps filtered by device type
 */
getFilteredSteps = function() {
  return TUTORIAL_STEPS.filter(step => {
    if (step.mobileOnly && !isMobile) return false;
    if (step.desktopOnly && isMobile) return false;
    return true;
  });
}

/**
 * Display a tutorial step
 */
showStep = function(step) {
  console.log('Showing tutorial step:', step.id);

  // Create overlay
  const overlay = createTutorialOverlay();
  document.body.appendChild(overlay);

  // Highlight target element if specified
  if (step.targetSelector) {
    const success = highlightElement(step.targetSelector, step.highlightPulse);
    if (!success) {
      console.warn('Target element not found:', step.targetSelector);
    }
  }

  // Create and position tooltip
  const tooltip = createTutorialTooltip(step);
  document.body.appendChild(tooltip);

  // Position tooltip after adding to DOM
  requestAnimationFrame(() => {
    positionTooltip(tooltip, step.targetSelector, step.position);
  });

  // Fade in animations
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    tooltip.style.opacity = '1';
  });
}

/**
 * Create semi-transparent overlay
 */
function createTutorialOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.className = 'fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300';
  overlay.style.opacity = '0';

  // Allow clicking overlay to skip (if enabled)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      const currentFilteredSteps = getFilteredSteps();
      const step = currentFilteredSteps[currentStep];
      if (step && step.showSkip) {
        skipTutorial();
      }
    }
  });

  return overlay;
}

/**
 * Create tutorial tooltip/card
 */
function createTutorialTooltip(step) {
  const tooltip = document.createElement('div');
  tooltip.id = 'tutorial-tooltip';
  tooltip.className = 'fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 md:p-6 max-w-sm md:max-w-md transition-opacity duration-300';
  tooltip.style.opacity = '0';

  const filteredSteps = getFilteredSteps();
  const currentIndex = filteredSteps.findIndex(s => s.id === step.id);
  const totalSteps = filteredSteps.length;

  tooltip.innerHTML = `
    <div class="space-y-3 md:space-y-4">
      <div class="flex items-start justify-between">
        <h3 class="text-lg md:text-xl font-serif font-bold text-gray-900 dark:text-gray-100 pr-8 leading-tight">
          ${step.title}
        </h3>
        ${step.showSkip ? `
          <button onclick="window.skipTutorial()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm font-medium">
            Skip
          </button>
        ` : ''}
      </div>

      <p class="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        ${step.content}
      </p>

      <div class="flex items-center justify-between pt-3 md:pt-4">
        <div class="text-xs md:text-sm text-gray-500">
          Step ${currentIndex + 1} of ${totalSteps}
        </div>

        <div class="flex gap-2">
          ${currentIndex > 0 ? `
            <button onclick="window.previousTutorialStep()"
              class="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200">
              Back
            </button>
          ` : ''}

          <button onclick="window.nextTutorialStep()"
            class="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            ${currentIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  `;

  return tooltip;
}

/**
 * Highlight target element with spotlight effect
 */
function highlightElement(selector, pulse = false) {
  const element = document.querySelector(selector);
  if (!element) return false;

  const rect = element.getBoundingClientRect();

  // Create spotlight cutout
  const spotlight = document.createElement('div');
  spotlight.id = 'tutorial-spotlight';
  spotlight.className = `fixed z-[9998] border-4 border-blue-500 rounded-lg pointer-events-none transition-all duration-300 ${pulse ? 'animate-pulse' : ''}`;
  spotlight.style.cssText = `
    top: ${rect.top - 8}px;
    left: ${rect.left - 8}px;
    width: ${rect.width + 16}px;
    height: ${rect.height + 16}px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
  `;

  document.body.appendChild(spotlight);
  return true;
}

/**
 * Position tooltip relative to target
 */
function positionTooltip(tooltip, targetSelector, position) {
  if (!targetSelector || position === 'center') {
    // Center on screen
    tooltip.style.cssText += `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    return;
  }

  const target = document.querySelector(targetSelector);
  if (!target) {
    // Fallback to center if target not found
    tooltip.style.cssText += `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    return;
  }

  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 16;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let top, left, transform = '';

  switch (position) {
    case 'bottom':
      top = rect.bottom + padding;
      left = rect.left + (rect.width / 2);
      transform = 'translateX(-50%)';

      // Keep within viewport
      if (top + tooltipRect.height > windowHeight) {
        top = rect.top - tooltipRect.height - padding;
      }
      break;

    case 'top':
      top = rect.top - tooltipRect.height - padding;
      left = rect.left + (rect.width / 2);
      transform = 'translateX(-50%)';

      // Keep within viewport
      if (top < 0) {
        top = rect.bottom + padding;
      }
      break;

    case 'right':
      top = rect.top + (rect.height / 2);
      left = rect.right + padding;
      transform = 'translateY(-50%)';

      // Keep within viewport
      if (left + tooltipRect.width > windowWidth) {
        left = rect.left - tooltipRect.width - padding;
      }
      break;

    case 'left':
      top = rect.top + (rect.height / 2);
      left = rect.left - tooltipRect.width - padding;
      transform = 'translateY(-50%)';

      // Keep within viewport
      if (left < 0) {
        left = rect.right + padding;
      }
      break;

    default:
      // Center on screen as fallback
      top = windowHeight / 2;
      left = windowWidth / 2;
      transform = 'translate(-50%, -50%)';
  }

  // Ensure tooltip stays within viewport with some padding
  if (left < padding) left = padding;
  if (left + tooltipRect.width > windowWidth - padding) {
    left = windowWidth - tooltipRect.width - padding;
  }
  if (top < padding) top = padding;
  if (top + tooltipRect.height > windowHeight - padding) {
    top = windowHeight - tooltipRect.height - padding;
  }

  tooltip.style.cssText += `
    top: ${top}px;
    left: ${left}px;
    transform: ${transform};
  `;
}

/**
 * Clean up current step elements
 */
cleanupCurrentStep = function() {
  const overlay = document.getElementById('tutorial-overlay');
  const tooltip = document.getElementById('tutorial-tooltip');
  const spotlight = document.getElementById('tutorial-spotlight');

  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }
  if (tooltip) {
    tooltip.style.opacity = '0';
    setTimeout(() => tooltip.remove(), 300);
  }
  if (spotlight) spotlight.remove();
}

/**
 * Mark tutorial as complete
 */
completeTutorial = function() {
  tutorialActive = false;
  localStorage.setItem('hasSeenFreebuilderTutorial', 'true');
  console.log('Tutorial completed');
  addHelpButton();
}

/**
 * Add help button to navigation for returning users
 */
function addHelpButton() {
  // Check if help button already exists
  if (document.getElementById('tutorialHelpBtn')) {
    return;
  }

  // Find the nav element
  const nav = document.querySelector('nav');
  if (!nav) {
    console.warn('Nav element not found, cannot add help button');
    return;
  }

  // Find the middle section (theme toggle container)
  const middleSection = nav.querySelector('.flex.items-center.bg-gray-100');
  if (!middleSection) {
    console.warn('Middle section not found, cannot add help button');
    return;
  }

  // Create help button
  const helpBtn = document.createElement('button');
  helpBtn.id = 'tutorialHelpBtn';
  helpBtn.className = 'theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600';
  helpBtn.title = 'Tutorial';
  helpBtn.innerHTML = `
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="hidden md:inline">Help</span>
  `;

  helpBtn.addEventListener('click', () => {
    console.log('Help button clicked, restarting tutorial');
    startTutorial();
  });

  // Insert help button before theme buttons
  middleSection.insertBefore(helpBtn, middleSection.firstChild);

  console.log('Help button added to navigation');
}

// Export functions for external use (window functions are already globally accessible)
export { startTutorial as restartTutorial };
