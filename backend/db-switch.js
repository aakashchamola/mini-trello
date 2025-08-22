#!/usr/bin/env node

/**
 * Database Switch Utility
 * 
 * This script helps you switch between MySQL and SQLite databases
 * and ensures proper schema synchronization.
 */

const fs = require('fs');
const path = require('path');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command || !['mysql', 'sqlite'].includes(command)) {
  console.log('🔧 Database Switch Utility\n');
  console.log('Usage:');
  console.log('  node db-switch.js mysql   - Switch to MySQL database');
  console.log('  node db-switch.js sqlite  - Switch to SQLite database');
  console.log('\nCurrent database configuration:');
  
  const useMySQL = envContent.includes('USE_MYSQL=true');
  console.log(`Database: ${useMySQL ? 'MySQL' : 'SQLite'}`);
  
  if (useMySQL) {
    const dbName = envContent.match(/DB_NAME=(.+)/)?.[1] || 'mini_trello';
    const dbHost = envContent.match(/DB_HOST=(.+)/)?.[1] || 'localhost';
    const dbPort = envContent.match(/DB_PORT=(.+)/)?.[1] || '3306';
    console.log(`MySQL Host: ${dbHost}:${dbPort}`);
    console.log(`MySQL Database: ${dbName}`);
  } else {
    const sqlitePath = path.join(__dirname, 'database.sqlite');
    const exists = fs.existsSync(sqlitePath);
    const stats = exists ? fs.statSync(sqlitePath) : null;
    console.log(`SQLite File: ${sqlitePath}`);
    console.log(`SQLite Exists: ${exists ? 'Yes' : 'No'}`);
    if (stats) {
      console.log(`SQLite Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`SQLite Modified: ${stats.mtime.toISOString()}`);
    }
  }
  
  process.exit(0);
}

console.log(`🔄 Switching to ${command.toUpperCase()} database...\n`);

// Switch database configuration
if (command === 'mysql') {
  envContent = envContent.replace(/USE_MYSQL=false/g, 'USE_MYSQL=true');
  console.log('✅ Updated .env to use MySQL');
  console.log('📝 Make sure your MySQL server is running and accessible');
  console.log('🔧 The application will use MySQL with the current schema');
  
} else if (command === 'sqlite') {
  envContent = envContent.replace(/USE_MYSQL=true/g, 'USE_MYSQL=false');
  console.log('✅ Updated .env to use SQLite');
  
  // Check if SQLite file exists and ask about recreation
  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const exists = fs.existsSync(sqlitePath);
  
  if (exists) {
    console.log('⚠️  Existing SQLite database found');
    console.log('🗑️  To ensure clean schema, removing old database...');
    
    try {
      fs.unlinkSync(sqlitePath);
      console.log('✅ Old SQLite database removed');
      console.log('🆕 New SQLite database will be created on next server start');
    } catch (error) {
      console.error('❌ Error removing old SQLite database:', error.message);
      console.log('💡 You may need to manually delete: ' + sqlitePath);
    }
  } else {
    console.log('🆕 SQLite database will be created on next server start');
  }
}

// Write updated .env file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully');
} catch (error) {
  console.error('❌ Error writing .env file:', error.message);
  process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. Restart your server: npm start');
console.log('2. The database will be initialized with the correct schema');
console.log('3. You can then create new users and data');

if (command === 'sqlite') {
  console.log('\n💡 SQLite Tips:');
  console.log('- SQLite is perfect for development and testing');
  console.log('- Data is stored in ./database.sqlite file');
  console.log('- No separate database server needed');
} else {
  console.log('\n💡 MySQL Tips:');
  console.log('- Make sure MySQL server is running');
  console.log('- Database and user should already exist');
  console.log('- Check connection settings in .env file');
}
