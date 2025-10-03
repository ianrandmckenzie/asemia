/**
 * Shared components for Asemia project
 * This module provides reusable UI components like footer and nav
 */

/**
 * Creates and returns the fixed navigation bar element
 * @returns {HTMLElement} The nav element
 */
export function createNav() {
  const nav = document.createElement('nav');
  // Bottom on mobile, top on md+
  nav.className = 'fixed left-0 right-0 bottom-0 md:top-0 md:bottom-auto bg-white dark:bg-slate-800 border-t md:border-b md:border-t-0 border-gray-200 dark:border-slate-700 shadow-sm pb-[env(safe-area-inset-bottom)] md:pb-0';
  nav.style.zIndex = 1000;

  // Detect if we're on the freebuilder page
  const isOnFreebuilder = window.location.pathname.includes('/freebulder.html');

  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Left Section: Logo and Home -->
        <div class="flex items-center space-x-4">
          <a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/public/darkmode-logo-fullbleed.png" alt="Asemia Logo" class="h-8 md:h-12 w-auto dark:hidden rounded-md" />
            <img src="/public/lightmode-logo-fullbleed.png" alt="Asemia Logo" class="h-8 md:h-12 w-auto hidden dark:block rounded-md" />
            <span class="text-sm md:text-lg font-thin uppercase tracking-widest text-gray-900 dark:text-gray-100 font-sans">Asemia</span>
          </a>
        </div>

        <!-- Middle Section: Theme Toggle -->
        <div class="flex items-center">
          <div class="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              id="themeSystem"
              class="theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium"
              aria-label="System theme"
              title="System Theme"
            >
              <svg class="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l176 0-10.7 32L160 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-69.3 0L336 416l176 0c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0zM512 64l0 224L64 288 64 64l448 0z"/></svg>
              <span class="hidden md:inline">System</span>
            </button>
            <button
              id="themeLight"
              class="theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium"
              aria-label="Light theme"
              title="Light Theme"
            >
              <svg class="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>
              <span class="hidden md:inline">Light</span>
            </button>
            <button
              id="themeDark"
              class="theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium"
              aria-label="Dark theme"
              title="Dark Theme"
            >
              <svg class="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>
              <span class="hidden md:inline">Dark</span>
            </button>
          </div>
        </div>

        <!-- Right Section: Links -->
        <div class="flex items-center space-x-4">
          <a target="_blank"
            href="https://www.relentlesscurious.com/not-built"
            class="${isOnFreebuilder ? 'block' : 'hidden md:block'} text-xs md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Submit Typeform
          </a>
          <a
            href="/freebulder.html"
            class="${isOnFreebuilder ? 'hidden' : 'block'} text-xs md:text-base px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-medium transition-colors"
          >
            Start Making
          </a>
        </div>
      </div>
    </div>
  `;

  return nav;
}

/**
 * Initializes the navigation bar
 * Sets up theme switching and adds nav to top of page
 */
export function initNav() {
  const nav = createNav();
  document.body.insertBefore(nav, document.body.firstChild);

  // Add responsive padding to body to account for fixed nav (bottom on mobile, top on md+)
  function updateBodyPadding() {
    const mdUp = window.matchMedia('(min-width: 768px)').matches;
    if (mdUp) {
      document.body.style.paddingTop = '4rem';
      document.body.style.paddingBottom = '';
    } else {
      document.body.style.paddingTop = '';
      // Include iOS safe-area for bottom navigation
      document.body.style.paddingBottom = 'calc(4rem + env(safe-area-inset-bottom))';
    }
  }
  updateBodyPadding();
  // Update on resize or orientation change
  window.addEventListener('resize', updateBodyPadding);
  window.addEventListener('orientationchange', updateBodyPadding);

  // Theme management
  const themeSystem = document.getElementById('themeSystem');
  const themeLight = document.getElementById('themeLight');
  const themeDark = document.getElementById('themeDark');
  const html = document.documentElement;

  // Get stored theme or default to system
  let currentTheme = localStorage.getItem('theme') || 'system';

  // Apply theme
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);

    // Remove active class from all buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'dark:bg-slate-600', 'text-gray-900', 'dark:text-gray-100', 'shadow-sm');
      btn.classList.add('text-gray-600', 'dark:text-gray-400');
    });

    // Add active class to current button
    let activeBtn;
    if (theme === 'system') {
      activeBtn = themeSystem;
      // Apply system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    } else if (theme === 'light') {
      activeBtn = themeLight;
      html.classList.remove('dark');
    } else if (theme === 'dark') {
      activeBtn = themeDark;
      html.classList.add('dark');
    }

    if (activeBtn) {
      activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
      activeBtn.classList.add('bg-white', 'dark:bg-slate-600', 'text-gray-900', 'dark:text-gray-100', 'shadow-sm');
    }
  }

  // Set initial theme
  applyTheme(currentTheme);

  // Theme button event listeners
  themeSystem.addEventListener('click', () => applyTheme('system'));
  themeLight.addEventListener('click', () => applyTheme('light'));
  themeDark.addEventListener('click', () => applyTheme('dark'));

  // Listen for system theme changes when in system mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Creates and returns the footer HTML element
 * @returns {HTMLElement} The footer element
 */
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-16 mb-16 md:mb-0';

  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Column 1: Navigation Links -->
        <div>
          <h3 class="text-lg font-serif font-semibold text-gray-900 dark:text-gray-100 mb-4">Explore</h3>
          <ul class="space-y-2">
            <li>
              <a href="/archive.html" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Forms
              </a>
            </li>
            <li>
              <a href="/word_generator.html" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Words
              </a>
            </li>
            <li>
              <a href="/sentence_generator.html" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Sentences
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 2: Copyright and Branding -->
        <div>
          <h3 class="text-lg font-serif font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Copyright © Ian Rand McKenzie, <span id="startYear" class="hidden">2025 - </span><span id="thisYear">2025</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            More digital toys at <a href="https://www.relentlesscurious.com" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">www.relentlesscurious.com</a>
          </p>
          <a href="https://www.relentlesscurious.com" target="_blank" rel="noopener noreferrer" class="inline-block text-slate-900 dark:text-slate-50">
            <svg class="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 810.000000 810.000000" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0.000000,810.000000) scale(0.100000,-0.100000)"><path d="M4584 6225 c-190 -28 -408 -85 -799 -211 -176 -56 -392 -162 -507 -249 -47 -36 -128 -105 -180 -154 -51 -49 -135 -123 -185 -166 -167 -139 -299 -303 -609 -757 -328 -481 -350 -522 -433 -798 -68 -223 -76 -274 -76 -465 1 -199 19 -291 85 -433 74 -158 156 -237 279 -268 87 -22 132 -12 310 70 257 117 400 216 527 363 151 177 280 406 463 822 87 197 156 432 181 619 17 120 8 340 -18 444 l-19 77 51 10 c154 31 206 36 381 36 146 0 210 -4 275 -18 321 -69 602 -241 761 -467 115 -163 227 -371 274 -509 l22 -66 7 70 c14 137 -24 355 -89 501 -38 86 -126 212 -199 287 -192 193 -430 313 -721 363 -131 23 -571 30 -690 11 -49 -8 -91 -13 -93 -12 -2 1 66 57 150 124 175 139 143 130 384 111 463 -36 735 -128 999 -335 225 -177 368 -396 440 -676 40 -154 46 -379 16 -538 -45 -232 -143 -537 -308 -951 -190 -481 -290 -653 -513 -884 -122 -127 -208 -195 -405 -324 -88 -58 -179 -120 -201 -138 -38 -32 -184 -213 -184 -229 0 -4 30 -46 67 -94 36 -47 68 -88 69 -90 2 -2 43 26 91 61 48 36 144 103 213 149 145 97 340 281 460 433 46 58 82 95 94 95 10 1 52 -33 95 -77 73 -73 83 -88 173 -272 79 -160 106 -206 149 -250 l53 -55 4 35 c6 53 -16 253 -39 359 -32 150 -76 275 -144 414 -35 71 -67 147 -70 168 -10 55 28 128 104 203 l60 59 26 -17 c67 -44 132 -127 295 -376 48 -74 114 -162 146 -195 l59 -59 3 29 c10 84 -53 316 -135 500 -25 55 -87 177 -139 271 -73 132 -94 179 -94 209 0 28 23 84 83 206 45 92 84 168 87 168 3 1 36 -61 74 -136 37 -76 95 -187 128 -248 90 -163 348 -549 405 -605 l25 -25 -5 70 c-8 103 -58 298 -122 480 -167 470 -156 432 -154 527 2 105 26 266 79 533 101 512 138 895 101 1060 -37 168 -186 512 -281 649 -60 86 -235 260 -332 329 -82 58 -173 101 -348 162 -199 69 -281 85 -435 84 -71 -1 -171 -7 -221 -14z m-1658 -1537 c184 -335 211 -410 221 -608 9 -195 -27 -308 -136 -418 -104 -106 -233 -162 -372 -162 -135 0 -212 59 -293 225 -48 98 -66 173 -73 295 -9 166 26 307 108 447 35 58 212 250 282 305 35 28 138 77 163 78 5 0 50 -73 100 -162z" /><path d="M1384 5241 c-33 -22 -99 -80 -145 -128 -185 -193 -313 -448 -335 -668 l-6 -70 27 25 c63 57 244 262 312 353 128 173 192 302 213 430 16 99 7 107 -66 58z" /><path d="M1900 5074 c-74 -49 -203 -183 -267 -275 -115 -168 -196 -368 -208 -515 l-6 -79 85 90 c246 257 388 460 441 628 24 74 34 187 17 187 -4 0 -32 -16 -62 -36z" /></g></svg>
          </a>
        </div>

        <!-- Column 3: Policies -->
        <div>
          <h3 class="text-lg font-serif font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
          <ul class="space-y-2">
            <li>
              <a href="https://www.relentlesscurious.com/policy-hub" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Policies
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  return footer;
}

/**
 * Initializes the footer by appending it to the document body
 * Also sets up the current year and handles year range display
 */
export function initFooter() {
  const footer = createFooter();
  document.body.appendChild(footer);

  // Set current year
  const currentYear = new Date().getFullYear();
  const thisYearElement = document.getElementById('thisYear');
  const startYearElement = document.getElementById('startYear');

  if (thisYearElement) {
    thisYearElement.textContent = currentYear.toString();
  }

  // Show start year with range only if current year is not 2025
  if (startYearElement && currentYear !== 2025) {
    startYearElement.classList.remove('hidden');
  }
}
