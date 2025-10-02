/**
 * Quick Reference: Adding Shared Components to New Pages
 *
 * When creating new HTML pages in the Asemia project, follow these steps
 * to include shared components:
 */

// STEP 1: Add Footer to a New Page
// ================================
// Add this script block before the closing </body> tag:

/*
<script type="module">
  import { initFooter } from '/src/components.js';
  initFooter();
</script>
*/

// STEP 2: Add Navigation (Future Enhancement)
// ============================================
// To add the navigation bar, add this before the footer script:

/*
<script type="module">
  import { initNav } from '/src/components.js';
  // Pass current page ID: 'home', 'shapes', 'forms', 'words', or 'sentences'
  initNav('home');
</script>
*/

// STEP 3: Using Both Components
// ==============================
// You can import both in a single script block:

/*
<script type="module">
  import { initNav, initFooter } from '/src/components.js';
  initNav('words'); // Initialize nav with active page
  initFooter();      // Initialize footer
</script>
*/

// STEP 4: Custom Styling (if needed)
// ===================================
// The components use Tailwind classes. To customize:
// - Edit /src/components.js
// - Or add custom CSS in /src/style.css targeting component classes

// EXAMPLE: Complete HTML Page with Components
// ============================================
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Page</title>
  <link href="/src/style.css" rel="stylesheet" />
</head>
<body class="bg-gray-50 dark:bg-slate-900">

  <!-- Your page content here -->
  <main>
    <h1>Welcome</h1>
  </main>

  <!-- Initialize shared components -->
  <script type="module">
    import { initFooter } from '/src/components.js';
    initFooter();
  </script>

  <!-- Your page scripts -->
  <script type="module" src="/src/your-script.js"></script>
</body>
</html>
*/

// NOTES:
// - Components are loaded as ES6 modules (requires modern browser)
// - Footer is appended to document.body automatically
// - Nav is prepended to document.body (appears at top)
// - Components work with both light and dark mode
// - Year in footer updates automatically
