# Shared Components Architecture

This document explains the component system architecture used in the Asemia project and provides guidelines for creating new shared components.

## Philosophy

The component system follows these core principles:

1. **Separation of Concerns**: Components are isolated, reusable units of UI
2. **ES6 Modules**: Components are exported as functions from `components.js`
3. **DOM Manipulation**: Components create and inject DOM elements programmatically
4. **Initialization Pattern**: Each component has a `create*()` function and an `init*()` function
5. **Self-Contained**: Components include their own HTML structure and behavior logic

## Current Components

### Navigation Bar (`createNav()` / `initNav()`)
Fixed navigation at the top of all pages with:
- **Left:** Logo and Home link
- **Middle:** Theme switcher (System/Light/Dark with icons)
- **Right:** Freebuilder link and Submit CTA button

**Features:**
- Fixed positioning (z-50)
- Theme persistence via localStorage
- System theme detection
- Automatic OS preference updates
- Smooth transitions

### Footer (`createFooter()` / `initFooter()`)
Site-wide footer with:
- **Column 1:** Navigation links (Shapes, Forms, Words, Sentences)
- **Column 2:** Copyright, branding, and Relentless Curious logo
- **Column 3:** Policies link

**Features:**
- Responsive 3-column grid
- Dynamic year display
- Inline SVG logo
- Dark mode support

## Component Architecture Pattern

### Basic Structure

Each component follows this pattern:

```javascript
/**
 * Creates and returns the [component name] element
 * @param {Object} options - Configuration options (if needed)
 * @returns {HTMLElement} The component element
 */
export function createComponentName(options = {}) {
  // 1. Create the root element
  const element = document.createElement('tagname');
  element.className = 'tailwind-classes';

  // 2. Build the inner HTML structure
  element.innerHTML = `
    <!-- Component markup -->
  `;

  // 3. Return the element
  return element;
}

/**
 * Initializes the component by adding it to the DOM
 * Handles any post-render logic (event listeners, dynamic updates, etc.)
 * @param {Object} options - Configuration options (if needed)
 */
export function initComponentName(options = {}) {
  // 1. Create the component
  const element = createComponentName(options);

  // 2. Insert into DOM (position depends on component type)
  // For headers/nav: document.body.insertBefore(element, document.body.firstChild);
  // For footers: document.body.appendChild(element);
  // For content: target.appendChild(element);

  // 3. Handle post-render logic
  // - Set up event listeners
  // - Update dynamic content
  // - Apply conditional logic
}
```

### Example: The Footer Component

The footer demonstrates this pattern:

```javascript
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'bg-white dark:bg-slate-800 border-t ...';

  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Three-column grid layout -->
    </div>
  `;

  return footer;
}

export function initFooter() {
  const footer = createFooter();
  document.body.appendChild(footer); // Append to bottom of page

  // Post-render logic: Update year and show/hide date range
  const currentYear = new Date().getFullYear();
  const thisYearElement = document.getElementById('thisYear');
  const startYearElement = document.getElementById('startYear');

  if (thisYearElement) {
    thisYearElement.textContent = currentYear.toString();
  }

  if (startYearElement && currentYear !== 2025) {
    startYearElement.classList.remove('hidden');
  }
}
```

## Usage in HTML Pages

Components are imported and initialized using ES6 module syntax:

```html
<!-- At the end of your HTML file, before </body> -->
<script type="module">
  import { initFooter, initNav } from '/src/components.js';

  // Initialize components in order
  initNav('shapes'); // Optional: pass current page identifier
  initFooter();
</script>
```

## Styling Guidelines

### Tailwind CSS

Components use Tailwind CSS classes following these conventions:

- **Responsive Design**: Mobile-first with `md:` and `lg:` breakpoints
- **Dark Mode**: Every color should have a `dark:` variant
- **Spacing**: Use consistent spacing scale (4, 8, 12, 16, etc.)
- **Transitions**: Add `transition-*` classes for interactive elements

Example:
```javascript
className = 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
```

### Component-Specific Styles

If a component needs custom CSS beyond Tailwind utilities:

1. Add styles to `/src/style.css`
2. Use semantic class names prefixed with component name
3. Document the custom styles in this README

## Dynamic Content

### ID-Based Updates

For content that needs post-render updates:

1. Add `id` attributes in the component's HTML
2. Query and update in the `init*()` function

Example:
```javascript
footer.innerHTML = `<span id="thisYear">2025</span>`;
// Later in initFooter():
document.getElementById('thisYear').textContent = currentYear;
```

### Conditional Display

Use `hidden` class for conditional visibility:

```javascript
// In HTML:
<span id="startYear" class="hidden">2025 - </span>

// In init function:
if (condition) {
  element.classList.remove('hidden');
}
```

## Creating New Components

### Checklist

When creating a new component:

- [ ] Define `create*()` function that returns HTMLElement
- [ ] Define `init*()` function that handles DOM insertion and logic
- [ ] Use Tailwind classes for styling
- [ ] Support both light and dark modes
- [ ] Make responsive (mobile-first)
- [ ] Add JSDoc comments
- [ ] Export both functions
- [ ] Update this README with usage example
- [ ] Test on all target pages

### Common Component Types

**Navigation/Header Components**:
```javascript
export function initNav() {
  const nav = createNav();
  document.body.insertBefore(nav, document.body.firstChild);
}
```

**Footer Components**:
```javascript
export function initFooter() {
  const footer = createFooter();
  document.body.appendChild(footer);
}
```

**Content Components** (modals, cards, etc.):
```javascript
export function initModal(targetSelector) {
  const modal = createModal();
  const target = document.querySelector(targetSelector);
  target.appendChild(modal);
}
```

## Best Practices

1. **Keep Components Simple**: Each component should do one thing well
2. **Avoid Global State**: Components should be self-contained
3. **Use Parameters**: Make components configurable via function parameters
4. **Handle Edge Cases**: Check for null elements, handle missing data gracefully
5. **Progressive Enhancement**: Components should work without JavaScript when possible
6. **Accessibility**: Include ARIA labels, semantic HTML, keyboard navigation
7. **Performance**: Minimize DOM queries, use event delegation where appropriate

## Files Using Components

Current pages using the component system:
- `index.html`
- `svg.html`
- `archive.html`
- `word_generator.html`
- `sentence_generator.html`
- `freebulder.html`

## Future Enhancements

Potential component additions:
- Modal/Dialog system
- Toast notifications
- Loading indicators
- Breadcrumb navigation
- Page headers with consistent styling
- Search/filter components
- Theme toggle component
- Keyboard shortcut helper
