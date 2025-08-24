#!/usr/bin/env node

/**
 * Database Seeder Script for Mini Trello
 * 
 * This script handles seeding the database with sample data
 * Works with both SQLite (development) and MySQL (production)
 * 
 * Usage:
 *   npm run seed              # Run all seeders
 *   npm run seed:fresh        # Reset and run all seeders
 *   npm run seed:undo         # Undo all seeders
 */

const { sequelize } = require('../src/config/database');
const { syncDatabase } = require('../src/models');
const path = require('path');
const fs = require('fs');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runSeeders(fresh = false) {
  try {
    colorLog('cyan', '🌱 Starting database seeding process...\n');

    // Test database connection
    colorLog('blue', '📡 Testing database connection...');
    await sequelize.authenticate();
    colorLog('green', '✓ Database connection successful');

    // Sync database tables
    colorLog('blue', '🔧 Synchronizing database tables...');
    await syncDatabase(fresh);
    colorLog('green', '✓ Database tables synchronized');

    if (fresh) {
      colorLog('yellow', '🧹 Fresh seed requested - tables will be recreated');
    }

    // Get all seeder files
    const seedersDir = path.join(__dirname);
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js' && file !== 'seed-runner.js')
      .sort(); // This ensures they run in order (01-, 02-, etc.)

    colorLog('blue', `📁 Found ${seederFiles.length} seeder files:`);
    seederFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log();

    // Run each seeder
    for (const file of seederFiles) {
      const seederName = file.replace('.js', '');
      colorLog('blue', `🌱 Running seeder: ${seederName}...`);
      
      try {
        const seeder = require(path.join(seedersDir, file));
        await seeder.up(sequelize.getQueryInterface(), sequelize.constructor);
        colorLog('green', `✓ ${seederName} completed successfully`);
      } catch (error) {
        colorLog('red', `✗ ${seederName} failed: ${error.message}`);
        
        // If it's a unique constraint error in fresh mode, that's expected
        if (fresh && error.name === 'SequelizeUniqueConstraintError') {
          colorLog('yellow', '  (Ignoring duplicate data - this is expected in fresh mode)');
          continue;
        }
        
        throw error;
      }
    }

    console.log();
    colorLog('green', '🎉 All seeders completed successfully!');
    colorLog('cyan', '📊 Database has been populated with sample data');
    
    // Show summary
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', { 
      type: sequelize.QueryTypes.SELECT 
    });
    const boardCount = await sequelize.query('SELECT COUNT(*) as count FROM boards', { 
      type: sequelize.QueryTypes.SELECT 
    });
    const cardCount = await sequelize.query('SELECT COUNT(*) as count FROM cards', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log();
    colorLog('magenta', '📈 Data Summary:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Boards: ${boardCount[0].count}`);
    console.log(`   Cards: ${cardCount[0].count}`);
    
    console.log();
    colorLog('yellow', '🔐 Default login credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Password123!');
    console.log();
    console.log('   Other users: john.doe@example.com, jane.smith@example.com, etc.');
    console.log('   All users have the same password: Password123!');

  } catch (error) {
    console.log();
    colorLog('red', `❌ Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function undoSeeders() {
  try {
    colorLog('cyan', '🧹 Starting database cleanup...\n');

    // Test database connection
    await sequelize.authenticate();
    colorLog('green', '✓ Database connection successful');

    // Get all seeder files in reverse order
    const seedersDir = path.join(__dirname);
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js' && file !== 'seed-runner.js')
      .sort()
      .reverse(); // Reverse order for cleanup

    colorLog('blue', `🧹 Undoing ${seederFiles.length} seeders...`);

    // Run each seeder's down method
    for (const file of seederFiles) {
      const seederName = file.replace('.js', '');
      colorLog('blue', `🧹 Undoing seeder: ${seederName}...`);
      
      try {
        const seeder = require(path.join(seedersDir, file));
        if (seeder.down) {
          await seeder.down(sequelize.getQueryInterface(), sequelize.constructor);
          colorLog('green', `✓ ${seederName} undone successfully`);
        } else {
          colorLog('yellow', `⚠ ${seederName} has no down method`);
        }
      } catch (error) {
        colorLog('red', `✗ ${seederName} undo failed: ${error.message}`);
        // Continue with other seeders even if one fails
      }
    }

    console.log();
    colorLog('green', '🎉 Database cleanup completed!');

  } catch (error) {
    console.log();
    colorLog('red', `❌ Cleanup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'fresh':
      await runSeeders(true);
      break;
    case 'undo':
      await undoSeeders();
      break;
    case 'run':
    default:
      await runSeeders(false);
      break;
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  colorLog('red', `❌ Unhandled rejection: ${err.message}`);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  runSeeders,
  undoSeeders
};
