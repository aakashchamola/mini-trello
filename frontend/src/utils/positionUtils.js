/**
 * Utility functions for calculating positions in drag and drop operations
 */

/**
 * Calculate the new position for an item when moving it to a new index
 * @param {Array} items - Array of items with position property
 * @param {number} newIndex - Target index for the item
 * @param {Object} movingItem - The item being moved (optional, for same-list moves)
 * @returns {number} - New position value
 */
export const calculateNewPosition = (items, newIndex, movingItem = null) => {
  // Filter out the moving item if it's a same-list move
  const filteredItems = movingItem 
    ? items.filter(item => item.id !== movingItem.id)
    : items;

  // Sort items by position to ensure correct order
  const sortedItems = [...filteredItems].sort((a, b) => a.position - b.position);

  // If inserting at the beginning
  if (newIndex === 0) {
    if (sortedItems.length === 0) {
      return 1024; // Default starting position
    }
    return sortedItems[0].position / 2;
  }

  // If inserting at the end
  if (newIndex >= sortedItems.length) {
    if (sortedItems.length === 0) {
      return 1024; // Default starting position
    }
    return sortedItems[sortedItems.length - 1].position + 1024;
  }

  // Inserting between two items
  const prevItem = sortedItems[newIndex - 1];
  const nextItem = sortedItems[newIndex];

  return (prevItem.position + nextItem.position) / 2;
};

/**
 * Calculate new positions for reordering multiple items
 * @param {Array} items - Array of items to reorder
 * @param {Array} newOrder - Array of item IDs in new order
 * @returns {Array} - Array of {id, position} objects
 */
export const calculateReorderPositions = (items, newOrder) => {
  const basePosition = 1024;
  const increment = 1024;

  return newOrder.map((itemId, index) => ({
    id: itemId,
    position: basePosition + (index * increment)
  }));
};

/**
 * Validate that positions maintain proper order
 * @param {Array} items - Array of items with position property
 * @returns {boolean} - True if positions are in correct order
 */
export const validatePositions = (items) => {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].position <= sorted[i - 1].position) {
      return false;
    }
  }
  
  return true;
};

/**
 * Fix position conflicts by reassigning positions
 * @param {Array} items - Array of items with position conflicts
 * @returns {Array} - Array of items with fixed positions
 */
export const fixPositionConflicts = (items) => {
  const basePosition = 1024;
  const increment = 1024;

  return items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({
      ...item,
      position: basePosition + (index * increment)
    }));
};

/**
 * Get the minimum gap between positions to ensure proper ordering
 * @param {Array} items - Array of items with positions
 * @returns {number} - Minimum safe gap
 */
export const getMinimumPositionGap = (items) => {
  if (items.length < 2) return 1024;

  const sorted = [...items].sort((a, b) => a.position - b.position);
  let minGap = Infinity;

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].position - sorted[i - 1].position;
    minGap = Math.min(minGap, gap);
  }

  return Math.max(minGap / 2, 1); // Ensure minimum gap of 1
};
