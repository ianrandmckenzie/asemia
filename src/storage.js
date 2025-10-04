// Storage functionality for Typographic Tinkerer
// Handles both local browser storage (IndexedDB) and file downloads

// IndexedDB database configuration
const DB_NAME = 'TypographicTinkerer';
const DB_VERSION = 1;
const STORE_NAME = 'compositions';

let db = null;

// Initialize IndexedDB
async function initStorage() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('created', 'created', { unique: false });
      }
    };
  });
}

// Save composition to browser storage
async function saveToBrowser(compositionData) {
  if (!db) await initStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Add timestamp and ensure unique naming
    const composition = {
      ...compositionData,
      saved: new Date().toISOString()
    };

    const request = store.add(composition);

    request.onsuccess = () => {
      console.log('Composition saved to browser:', composition.metadata.name);
      showNotification(`"${composition.metadata.name}" saved to browser`, 'success');
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Failed to save composition:', request.error);
      showNotification('Failed to save composition', 'error');
      reject(request.error);
    };
  });
}

// Save composition to computer as JSON file
async function saveToComputer(compositionData) {
  const jsonString = JSON.stringify(compositionData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const filename = `${compositionData.metadata.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Composition downloaded:', compositionData.metadata.name);
  showNotification(`"${compositionData.metadata.name}" downloaded`, 'success');

  // If on localhost, also trigger download of updated manifest
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    await saveUpdatedManifest(filename);
  }
}

// Generate and download an updated manifest file (localhost only)
async function saveUpdatedManifest(newFilename) {
  try {
    // Load current manifest
    const response = await fetch('./archive/manifest.json');
    let manifest;

    if (response.ok) {
      manifest = await response.json();
    } else {
      // Create new manifest if it doesn't exist
      manifest = {
        files: [],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }

    // Add the new file if it's not already in the list
    if (!manifest.files.includes(newFilename)) {
      manifest.files.push(newFilename);
      manifest.files.sort(); // Keep alphabetically sorted
    }

    // Update the lastUpdated timestamp
    manifest.lastUpdated = new Date().toISOString().split('T')[0];

    // Download the updated manifest
    const manifestString = JSON.stringify(manifest, null, 2);
    const manifestBlob = new Blob([manifestString], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    const a = document.createElement('a');
    a.href = manifestUrl;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(manifestUrl);

    showNotification('Updated manifest.json also downloaded', 'info');
  } catch (error) {
    console.warn('Could not generate updated manifest:', error);
    // Don't show error to user, this is a nice-to-have feature
  }
}

// Get all compositions from browser storage
async function getAllCompositions() {
  if (!db) await initStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete composition from browser storage
async function deleteFromBrowser(id) {
  if (!db) await initStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Composition deleted from browser:', id);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Create composition data from current grid state
// Captures both regular shapes and textured shapes (with applied textures)
function createCompositionData(name) {
  return {
    metadata: {
      name: name || 'Untitled',
      created: new Date().toISOString(),
      version: '1.0'
    },
    grids: {
      serifs: extractGridData('serifsGrid', 'serifs'),
      joins: extractGridData('joinsGrid', 'joins')
    }
  };
}

// Extract data from a grid
// Handles regular SVG shapes and textured elements (divs with texture applied)
function extractGridData(gridId, gridType) {
  const grid = document.getElementById(gridId);
  const cells = [];

  console.log(`Extracting data from ${gridId}:`, grid);

  for (let i = 0; i < grid.children.length; i++) {
    const cell = grid.children[i];
    const imgs = cell.querySelectorAll('img');
    const svgs = cell.querySelectorAll('svg');
    const texturedElements = cell.querySelectorAll('[data-textured="true"]');

    // Handle all img elements in the cell
    imgs.forEach(img => {
      if (img.src) {
        // Extract shape info from image path
        const srcPath = img.src;
        const pathParts = srcPath.split('/');
        const fileName = pathParts[pathParts.length - 1].replace('.svg', '');
        const angleKey = pathParts[pathParts.length - 2];
        const category = pathParts[pathParts.length - 3];

        console.log(`Found img in cell ${i}:`, { srcPath, fileName, angleKey, category });

        cells.push({
          index: i,
          category: category,
          angleKey: angleKey,
          shapeName: fileName,
          imagePath: `./assets/shapes/${category}/${angleKey}/${fileName}.svg`
        });
      }
    });

    // Handle all SVG elements in the cell (skip textured ones, they're handled separately)
    svgs.forEach(svg => {
      // Skip textured SVGs - they will be handled in the texturedElements section
      if (svg.dataset.textured === 'true') {
        return;
      }

      console.log(`Found svg in cell ${i}:`, svg);
      // Try to extract data from SVG attributes or data attributes
      const category = svg.getAttribute('data-category');
      const angleKey = svg.getAttribute('data-angle-key');
      const shapeName = svg.getAttribute('data-shape-name');

      if (category && angleKey && shapeName) {
        cells.push({
          index: i,
          category: category,
          angleKey: angleKey,
          shapeName: shapeName,
          imagePath: `./assets/shapes/${category}/${angleKey}/${shapeName}.svg`
        });
      }
    });

    // Handle textured elements (divs with texture applied)
    texturedElements.forEach(texturedElement => {
      console.log(`Found textured element in cell ${i}:`, texturedElement);

      const category = texturedElement.dataset.category;
      const angleKey = texturedElement.dataset.angleKey;
      const shapeName = texturedElement.dataset.shapeName;
      const textureId = texturedElement.dataset.textureId;
      const textureType = texturedElement.dataset.textureType;
      const textureColor = texturedElement.dataset.textureColor;

      if (category && angleKey && shapeName && textureId) {
        const textureData = {
          id: textureId,
          applied: true
        };

        // If it's a color texture, save the color data
        if (textureType === 'color' && textureColor) {
          textureData.type = 'color';
          textureData.color = textureColor;
        }

        cells.push({
          index: i,
          category: category,
          angleKey: angleKey,
          shapeName: shapeName,
          imagePath: `./assets/shapes/${category}/${angleKey}/${shapeName}.svg`,
          texture: textureData
        });
      }
    });
  }

  console.log(`Extracted ${cells.length} shapes from ${gridId}`);

  return {
    gridType: gridType,
    gridSize: gridType === 'serifs' ? 5 : 4,
    shapes: cells
  };
}

// Load composition from file
function loadFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = handleFileLoad;
  input.click();
}

// Handle file selection and loading
function handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const composition = JSON.parse(e.target.result);
      applyComposition(composition);
      console.log('Composition loaded from file:', composition.metadata?.name || 'Unknown');
    } catch (error) {
      alert('Error loading file: Invalid JSON format');
      console.error('Load error:', error);
    }
  };
  reader.readAsText(file);
}

// Apply a loaded composition to the grids
function applyComposition(composition) {
  console.log('Loading composition:', composition);

  // Clear existing grids
  clearAllGrids();

  // Apply shapes to each grid
  if (composition.grids?.serifs) {
    console.log('Loading serifs grid with', composition.grids.serifs.shapes.length, 'shapes');
    applyGridData('serifsGrid', composition.grids.serifs);
  }

  if (composition.grids?.joins) {
    console.log('Loading joins grid with', composition.grids.joins.shapes.length, 'shapes');
    applyGridData('joinsGrid', composition.grids.joins);
  }

  // Show success message
  const name = composition.metadata?.name || 'Composition';
  showNotification(`"${name}" loaded successfully`, 'success');
}

// Apply shape data to a specific grid
// Re-applies both regular shapes and textures from saved composition data
function applyGridData(gridId, gridData) {
  const grid = document.getElementById(gridId);

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
          if (window.placeShapeInCell) {
            // Clear cell for the first shape, allow overlap for subsequent shapes
            const allowOverlap = shapeIndex > 0;
            window.placeShapeInCell(cell, shapeData, allowOverlap);

            // Apply texture if the shape had one
            if (shapeInfo.texture && shapeInfo.texture.applied && shapeInfo.texture.id) {
              // Check if it's a color texture
              if (shapeInfo.texture.type === 'color' && shapeInfo.texture.color) {
                // Create color texture object
                const colorTexture = {
                  type: 'color',
                  id: shapeInfo.texture.id,
                  name: shapeInfo.texture.id === 'black' ? 'Black' :
                        shapeInfo.texture.id === 'white' ? 'White' : 'Custom Color',
                  color: shapeInfo.texture.color
                };

                if (window.applyTextureToShape) {
                  // Find the SVG element that was just placed
                  const placedSvg = cell.querySelector(`svg[data-shape-name="${shapeInfo.shapeName}"]`);

                  if (placedSvg) {
                    // Apply the color texture to the shape
                    const texturedElement = window.applyTextureToShape(placedSvg, colorTexture);

                    // Replace the SVG with the textured element
                    if (texturedElement && texturedElement !== placedSvg) {
                      placedSvg.parentNode.replaceChild(texturedElement, placedSvg);
                      console.log(`Applied color "${colorTexture.color}" to shape "${shapeInfo.shapeName}"`);
                    }
                  } else {
                    console.warn('Could not find placed SVG to apply color');
                  }
                }
              } else {
                // Handle image-based texture
                if (window.texturesData && window.applyTextureToShape) {
                  const texture = window.texturesData.textures.find(t => t.id === shapeInfo.texture.id);

                  if (texture) {
                    // Find the SVG element that was just placed
                    const placedSvg = cell.querySelector(`svg[data-shape-name="${shapeInfo.shapeName}"]`);

                    if (placedSvg) {
                      // Apply the texture to the shape
                      const texturedElement = window.applyTextureToShape(placedSvg, texture);

                      // Replace the SVG with the textured element
                      if (texturedElement && texturedElement !== placedSvg) {
                        placedSvg.parentNode.replaceChild(texturedElement, placedSvg);
                        console.log(`Applied texture "${texture.name}" to shape "${shapeInfo.shapeName}"`);
                      }
                    } else {
                      console.warn('Could not find placed SVG to apply texture');
                    }
                  } else {
                    console.warn(`Texture not found: ${shapeInfo.texture.id}`);
                  }
                } else {
                  console.warn('Texture system not available');
                }
              }
            }
          } else {
            console.warn('placeShapeInCell function not available');
          }
        } else {
          console.warn('Shape not found in rulesData:', shapeInfo.shapeName);
        }
      } else {
        console.warn('Category/angleKey not found in rulesData:', shapeInfo.category, shapeInfo.angleKey);
      }
    });
  });
}

// Clear all shapes from both grids
function clearAllGrids() {
  const serifsGrid = document.getElementById('serifsGrid');
  const joinsGrid = document.getElementById('joinsGrid');

  // Clear serifs grid
  for (let i = 0; i < serifsGrid.children.length; i++) {
    serifsGrid.children[i].innerHTML = '';
  }

  // Clear joins grid
  for (let i = 0; i < joinsGrid.children.length; i++) {
    joinsGrid.children[i].innerHTML = '';
  }

  // Clear clean mode if active
  if (window.clearCleanMode) {
    window.clearCleanMode();
  }

  console.log('All grids cleared');
  showNotification('Grids cleared', 'info');
}

// Show notification message
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
    type === 'success' ? 'bg-green-500 dark:bg-green-600' :
    type === 'error' ? 'bg-red-500 dark:bg-red-600' :
    'bg-blue-500 dark:bg-blue-600'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Show input modal for naming compositions
function showNameInputModal(title, placeholder, onConfirm) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-center justify-center';

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-sm w-full mx-4';

  // Create modal header
  const header = document.createElement('div');
  header.className = 'px-6 py-4 border-b border-gray-200 dark:border-gray-700';
  header.innerHTML = `
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">${title}</h3>
  `;

  // Create modal body with input
  const body = document.createElement('div');
  body.className = 'px-6 py-4';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.className = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  input.value = '';

  body.appendChild(input);

  // Create modal footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors';
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = () => document.body.removeChild(overlay);

  const saveButton = document.createElement('button');
  saveButton.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors';
  saveButton.textContent = 'Save';

  const handleSave = () => {
    const name = input.value.trim();
    if (name) {
      document.body.removeChild(overlay);
      onConfirm(name);
    } else {
      input.focus();
      input.className = input.className + ' border-red-500';
      setTimeout(() => {
        input.className = input.className.replace(' border-red-500', '');
      }, 2000);
    }
  };

  saveButton.onclick = handleSave;

  // Handle Enter key
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      document.body.removeChild(overlay);
    }
  };

  footer.appendChild(cancelButton);
  footer.appendChild(saveButton);

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Add to page
  document.body.appendChild(overlay);

  // Focus input
  setTimeout(() => input.focus(), 100);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

// Main save function (called from save button)
async function saveComposition() {
  showNameInputModal('Save Composition', 'Enter composition name...', async (name) => {
    const compositionData = createCompositionData(name);

    try {
      await saveToBrowser(compositionData);
    } catch (error) {
      console.error('Save failed:', error);
      showNotification('Failed to save composition', 'error');
    }
  });
}

// Save to computer function (called from dropdown)
async function saveCompositionToComputer() {
  showNameInputModal('Save to Computer', 'Enter composition name...', async (name) => {
    const compositionData = createCompositionData(name);
    await saveToComputer(compositionData);
  });
}

// Load from browser function (shows selection modal)
async function loadFromBrowser() {
  try {
    const compositions = await getAllCompositions();

    if (compositions.length === 0) {
      showNotification('No saved compositions found in browser', 'info');
      return;
    }

    // Create a simple selection interface
    showCompositionSelector(compositions);
  } catch (error) {
    console.error('Failed to load compositions:', error);
    showNotification('Failed to load compositions from browser', 'error');
  }
}

// Show delete confirmation modal
function showDeleteConfirmation(composition, parentOverlay, onSuccess) {
  // Create confirmation overlay
  const confirmOverlay = document.createElement('div');
  confirmOverlay.className = 'fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-center justify-center';

  // Create confirmation modal
  const confirmModal = document.createElement('div');
  confirmModal.className = 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-sm w-full mx-4';

  // Create header
  const header = document.createElement('div');
  header.className = 'px-6 py-4 border-b border-gray-200 dark:border-gray-700';
  header.innerHTML = `
    <h3 class="text-lg font-medium text-red-600 dark:text-red-400">Delete Composition</h3>
  `;

  // Create body
  const body = document.createElement('div');
  body.className = 'px-6 py-4';
  body.innerHTML = `
    <p class="text-gray-700 dark:text-gray-200">Are you sure you want to delete <strong>"${composition.metadata.name}"</strong>?</p>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">This action cannot be undone.</p>
  `;

  // Create footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => document.body.removeChild(confirmOverlay);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors';
  deleteBtn.textContent = 'Delete';

  deleteBtn.onclick = async () => {
    try {
      await deleteFromBrowser(composition.id);
      showNotification(`"${composition.metadata.name}" deleted`, 'success');
      document.body.removeChild(confirmOverlay);
      onSuccess();
    } catch (error) {
      console.error('Delete failed:', error);
      showNotification('Failed to delete composition', 'error');
    }
  };

  footer.appendChild(cancelBtn);
  footer.appendChild(deleteBtn);

  // Assemble confirmation modal
  confirmModal.appendChild(header);
  confirmModal.appendChild(body);
  confirmModal.appendChild(footer);
  confirmOverlay.appendChild(confirmModal);

  // Add to page
  document.body.appendChild(confirmOverlay);

  // Close on overlay click
  confirmOverlay.onclick = (e) => {
    if (e.target === confirmOverlay) {
      document.body.removeChild(confirmOverlay);
    }
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(confirmOverlay);
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
}

// Show composition selector modal
function showCompositionSelector(compositions) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-center justify-center';

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden';

  // Create modal header
  const header = document.createElement('div');
  header.className = 'px-6 py-4 border-b border-gray-200 dark:border-gray-700';
  header.innerHTML = `
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Load Composition</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">Choose a composition to load</p>
  `;

  // Create compositions list
  const list = document.createElement('div');
  list.className = 'max-h-64 overflow-y-auto px-6 py-4';

  compositions.forEach((composition, index) => {
  const item = document.createElement('div');
  item.className = 'border border-gray-200 dark:border-gray-700 rounded mb-2 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors';

    const date = new Date(composition.saved || composition.metadata.created).toLocaleDateString();

    // Create content container
    const content = document.createElement('div');
    content.className = 'flex items-center justify-between';

    // Create info section (clickable to load)
    const info = document.createElement('button');
    info.className = 'flex-1 text-left';
    info.innerHTML = `
      <div class="font-medium text-gray-900 dark:text-gray-100">${composition.metadata.name}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">Saved: ${date}</div>
    `;

    info.onclick = () => {
      applyComposition(composition);
      document.body.removeChild(overlay);
    };

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ml-3 px-2 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition-colors text-sm';
    deleteBtn.innerHTML = '<img src="/assets/icons/trash.svg" alt="Delete" class="w-6 h-6 inline-block dark:invert">';
    deleteBtn.title = 'Delete composition';

    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      showDeleteConfirmation(composition, overlay, () => {
        // Refresh the modal with updated list
        document.body.removeChild(overlay);
        loadFromBrowser();
      });
    };

    content.appendChild(info);
    content.appendChild(deleteBtn);
    item.appendChild(content);
    list.appendChild(item);
  });

  // Create modal footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors';
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = () => document.body.removeChild(overlay);

  footer.appendChild(cancelButton);

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(list);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Add to page
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

// Manage saved compositions (shows modal for loading/deleting)
async function manageCompositions() {
  try {
    const compositions = await getAllCompositions();

    if (compositions.length === 0) {
      showNotification('No saved compositions found in browser', 'info');
      return;
    }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-center justify-center';

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-108 overflow-hidden';

    // Create modal header
    const header = document.createElement('div');
    header.className = 'px-6 py-4 border-b border-gray-200 dark:border-gray-700';
    header.innerHTML = `
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Manage Saved Compositions</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">Load or delete your saved compositions</p>
    `;

    // Create compositions list
    const list = document.createElement('div');
    list.className = 'max-h-64 overflow-y-auto px-6 py-4';

    const refreshList = async () => {
      const updatedCompositions = await getAllCompositions();
      list.innerHTML = '';

      if (updatedCompositions.length === 0) {
        list.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">No compositions saved</p>';
        return;
      }

      updatedCompositions.forEach((composition) => {
  const item = document.createElement('div');
  item.className = 'border border-gray-200 dark:border-gray-700 rounded mb-2 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors';

        const date = new Date(composition.saved || composition.metadata.created).toLocaleDateString();

        // Create content container
        const content = document.createElement('div');
        content.className = 'flex items-center justify-between';

        // Create info section
        const info = document.createElement('div');
        info.className = 'flex-1';
        info.innerHTML = `
          <div class="font-medium text-gray-900 dark:text-gray-100">${composition.metadata.name}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Saved: ${date}</div>
        `;

        // Create buttons container
        const buttons = document.createElement('div');
        buttons.className = 'flex gap-2 ml-3';

        // Load button
  const loadBtn = document.createElement('button');
  loadBtn.className = 'px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded text-sm transition-colors';
        loadBtn.textContent = 'Load';
        loadBtn.onclick = () => {
          applyComposition(composition);
          document.body.removeChild(overlay);
        };

        // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'px-3 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded text-sm transition-colors';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
          if (confirm(`Delete "${composition.metadata.name}"?`)) {
            try {
              await deleteFromBrowser(composition.id);
              showNotification(`"${composition.metadata.name}" deleted`, 'success');
              refreshList();
            } catch (error) {
              console.error('Delete failed:', error);
              showNotification('Failed to delete composition', 'error');
            }
          }
        };

        buttons.appendChild(loadBtn);
        buttons.appendChild(deleteBtn);
        content.appendChild(info);
        content.appendChild(buttons);
        item.appendChild(content);
        list.appendChild(item);
      });
    };

    await refreshList();

    // Create modal footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end';

  const closeButton = document.createElement('button');
  closeButton.className = 'px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors';
    closeButton.textContent = 'Close';
    closeButton.onclick = () => document.body.removeChild(overlay);

    footer.appendChild(closeButton);

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(list);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    // Add to page
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };

  } catch (error) {
    console.error('Failed to load compositions:', error);
    showNotification('Failed to load compositions from browser', 'error');
  }
}

// Load composition function (default to file)
function loadComposition() {
  loadFromFile();
}

// Initialize storage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize IndexedDB
  initStorage().catch(console.error);

  // Make functions globally available
  window.saveComposition = saveComposition;
  window.saveCompositionToComputer = saveCompositionToComputer;
  window.loadComposition = loadComposition;
  window.loadFromBrowser = loadFromBrowser;
  window.manageCompositions = manageCompositions;
  window.clearAllGrids = clearAllGrids;
  window.getAllCompositions = getAllCompositions;
  window.deleteFromBrowser = deleteFromBrowser;
  window.showNotification = showNotification;

  console.log('Storage functionality initialized');
});

console.log('Storage module loaded');
