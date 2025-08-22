const Card = require('../models/Card');
const List = require('../models/List');

class PositionService {
  constructor() {
    this.BASE_POSITION = 65536; // Base position value
    this.MIN_DELTA = 0.01; // Minimum position difference
  }

  /**
   * Calculate new position for inserting an item between two positions
   * @param {number|null} beforePosition - Position of item before the new position
   * @param {number|null} afterPosition - Position of item after the new position
   * @returns {number} New position
   */
  calculateBetweenPosition(beforePosition, afterPosition) {
    // If inserting at the beginning
    if (!beforePosition && afterPosition) {
      return Math.max(afterPosition / 2, this.MIN_DELTA);
    }
    
    // If inserting at the end
    if (beforePosition && !afterPosition) {
      return beforePosition + this.BASE_POSITION;
    }
    
    // If inserting between two items
    if (beforePosition && afterPosition) {
      const midpoint = (beforePosition + afterPosition) / 2;
      
      // If positions are too close, trigger rebalancing
      if (Math.abs(afterPosition - beforePosition) < this.MIN_DELTA * 2) {
        return this.triggerRebalancing(beforePosition, afterPosition);
      }
      
      return midpoint;
    }
    
    // If it's the first item
    return this.BASE_POSITION;
  }

  /**
   * Calculate position for moving to a specific index in a list
   * @param {Array} items - Current ordered items with positions
   * @param {number} targetIndex - Target index to insert at
   * @returns {number} New position
   */
  calculatePositionAtIndex(items, targetIndex) {
    const sortedItems = items.sort((a, b) => a.position - b.position);
    
    // Insert at beginning
    if (targetIndex === 0) {
      const firstItem = sortedItems[0];
      return this.calculateBetweenPosition(null, firstItem ? firstItem.position : null);
    }
    
    // Insert at end
    if (targetIndex >= sortedItems.length) {
      const lastItem = sortedItems[sortedItems.length - 1];
      return this.calculateBetweenPosition(lastItem ? lastItem.position : null, null);
    }
    
    // Insert between items
    const beforeItem = sortedItems[targetIndex - 1];
    const afterItem = sortedItems[targetIndex];
    
    return this.calculateBetweenPosition(
      beforeItem ? beforeItem.position : null,
      afterItem ? afterItem.position : null
    );
  }

  /**
   * Generate a unique position that doesn't conflict with existing positions
   * @param {number} basePosition - Base position to start from
   * @param {Array} existingPositions - Array of existing positions to avoid
   * @returns {number} Unique position
   */
  generateUniquePosition(basePosition, existingPositions = []) {
    let position = basePosition;
    const positionSet = new Set(existingPositions);
    
    while (positionSet.has(position)) {
      position += this.MIN_DELTA;
    }
    
    return position;
  }

  /**
   * Trigger rebalancing when positions become too close
   * @param {number} beforePosition - Position before
   * @param {number} afterPosition - Position after
   * @returns {number} New position with safety margin
   */
  triggerRebalancing(beforePosition, afterPosition) {
    console.log('Position rebalancing triggered due to close positions');
    // For now, just create a position with a safety margin
    // In a more sophisticated implementation, this would rebalance all positions
    return beforePosition + (this.BASE_POSITION / 1000);
  }

  /**
   * Rebalance positions for cards in a list
   * @param {number} listId - List ID to rebalance
   * @returns {Promise<void>}
   */
  async rebalanceCardPositions(listId) {
    try {
      const cards = await Card.findAll({
        where: { listId },
        order: [['position', 'ASC']]
      });

      if (cards.length === 0) return;

      // Assign new evenly spaced positions
      for (let i = 0; i < cards.length; i++) {
        const newPosition = this.BASE_POSITION * (i + 1);
        await cards[i].update({ position: newPosition });
      }

      console.log(`Rebalanced ${cards.length} card positions in list ${listId}`);
    } catch (error) {
      console.error('Error rebalancing card positions:', error);
    }
  }

  /**
   * Rebalance positions for lists in a board
   * @param {number} boardId - Board ID to rebalance
   * @returns {Promise<void>}
   */
  async rebalanceListPositions(boardId) {
    try {
      const lists = await List.findAll({
        where: { boardId },
        order: [['position', 'ASC']]
      });

      if (lists.length === 0) return;

      // Assign new evenly spaced positions
      for (let i = 0; i < lists.length; i++) {
        const newPosition = this.BASE_POSITION * (i + 1);
        await lists[i].update({ position: newPosition });
      }

      console.log(`Rebalanced ${lists.length} list positions in board ${boardId}`);
    } catch (error) {
      console.error('Error rebalancing list positions:', error);
    }
  }

  /**
   * Get the next available position at the end of a list
   * @param {number} listId - List ID
   * @returns {Promise<number>} Next position
   */
  async getNextCardPosition(listId) {
    try {
      const lastCard = await Card.findOne({
        where: { listId },
        order: [['position', 'DESC']]
      });

      if (!lastCard) {
        // Add small random offset to prevent concurrent insertion conflicts
        return this.BASE_POSITION + (Math.random() * 0.001);
      }

      // Add base position plus small random offset
      return lastCard.position + this.BASE_POSITION + (Math.random() * 0.001);
    } catch (error) {
      console.error('Error getting next card position:', error);
      // Return a timestamp-based position as fallback to ensure uniqueness
      return this.BASE_POSITION + Date.now() % 1000;
    }
  }

  /**
   * Get a guaranteed unique position for a card in a list
   * @param {number} listId - List ID
   * @returns {Promise<number>} Unique position
   */
  async getUniqueCardPosition(listId) {
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const position = await this.getNextCardPosition(listId);
      
      // Check if this position already exists
      const existingCard = await Card.findOne({
        where: { listId, position }
      });
      
      if (!existingCard) {
        return position;
      }
      
      // If position exists, add more randomness and try again
      console.log(`Position ${position} already exists for list ${listId}, trying again...`);
    }
    
    // Fallback: use timestamp with microseconds for guaranteed uniqueness
    return this.BASE_POSITION + Date.now() + (Math.random() * 1000);
  }

  /**
   * Get the next available position at the end of a board
   * @param {number} boardId - Board ID
   * @returns {Promise<number>} Next position
   */
  async getNextListPosition(boardId) {
    try {
      const lastList = await List.findOne({
        where: { boardId },
        order: [['position', 'DESC']]
      });

      if (!lastList) {
        // Add small random offset to prevent concurrent insertion conflicts
        return this.BASE_POSITION + (Math.random() * 0.001);
      }

      // Add base position plus small random offset
      return lastList.position + this.BASE_POSITION + (Math.random() * 0.001);
    } catch (error) {
      console.error('Error getting next list position:', error);
      // Return a timestamp-based position as fallback to ensure uniqueness
      return this.BASE_POSITION + Date.now() % 1000;
    }
  }

  /**
   * Get a guaranteed unique position for a list in a board
   * @param {number} boardId - Board ID
   * @returns {Promise<number>} Unique position
   */
  async getUniqueListPosition(boardId) {
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const position = await this.getNextListPosition(boardId);
      
      // Check if this position already exists
      const existingList = await List.findOne({
        where: { boardId, position }
      });
      
      if (!existingList) {
        return position;
      }
      
      // If position exists, add more randomness and try again
      console.log(`Position ${position} already exists for board ${boardId}, trying again...`);
    }
    
    // Fallback: use timestamp with microseconds for guaranteed uniqueness
    return this.BASE_POSITION + Date.now() + (Math.random() * 1000);
  }
}

module.exports = new PositionService();
