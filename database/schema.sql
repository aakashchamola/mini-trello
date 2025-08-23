-- Mini Trello Database Schema
-- MySQL 8.0 Compatible

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS webhook_deliveries;
DROP TABLE IF EXISTS webhooks;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS checklist_items;
DROP TABLE IF EXISTS checklists;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS card_labels;
DROP TABLE IF EXISTS labels;
DROP TABLE IF EXISTS card_assignees;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS board_members;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Workspaces table
CREATE TABLE workspaces (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id)
);

-- Workspace members table
CREATE TABLE workspace_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_workspace_user (workspace_id, user_id),
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id)
);

-- Boards table
CREATE TABLE boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id INT NOT NULL,
    visibility ENUM('private', 'workspace', 'public') DEFAULT 'workspace',
    background VARCHAR(255) DEFAULT '#0079bf',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_visibility (visibility),
    INDEX idx_archived (archived)
);

-- Board members table
CREATE TABLE board_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'editor', 'commenter', 'viewer') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_board_user (board_id, user_id),
    INDEX idx_board (board_id),
    INDEX idx_user (user_id)
);

-- Lists table
CREATE TABLE lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    board_id INT NOT NULL,
    position DECIMAL(10,5) NOT NULL DEFAULT 1024.00000,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_board_position (board_id, position),
    INDEX idx_board_archived (board_id, archived)
);

-- Cards table
CREATE TABLE cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    list_id INT NOT NULL,
    position DECIMAL(10,5) NOT NULL DEFAULT 1024.00000,
    due_date TIMESTAMP NULL,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    INDEX idx_list_position (list_id, position),
    INDEX idx_list_archived (list_id, archived),
    INDEX idx_due_date (due_date),
    FULLTEXT idx_search (title, description)
);

-- Card assignees table
CREATE TABLE card_assignees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_card_assignee (card_id, user_id),
    INDEX idx_card (card_id),
    INDEX idx_user (user_id)
);

-- Labels table
CREATE TABLE labels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#61bd4f',
    board_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_board (board_id)
);

-- Card labels table
CREATE TABLE card_labels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_id INT NOT NULL,
    label_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_card_label (card_id, label_id),
    INDEX idx_card (card_id),
    INDEX idx_label (label_id)
);

-- Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text TEXT NOT NULL,
    card_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_card_created (card_id, created_at),
    INDEX idx_user (user_id)
);

-- Checklists table
CREATE TABLE checklists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    card_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX idx_card (card_id)
);

-- Checklist items table
CREATE TABLE checklist_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(500) NOT NULL,
    checklist_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    position DECIMAL(10,5) NOT NULL DEFAULT 1024.00000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    INDEX idx_checklist_position (checklist_id, position),
    INDEX idx_completed (completed)
);

-- Attachments table
CREATE TABLE attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    card_id INT NOT NULL,
    user_id INT NOT NULL,
    size INT NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_card (card_id),
    INDEX idx_user (user_id)
);

-- Activities table
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NOT NULL,
    board_id INT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_board_created (board_id, created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_entity (entity_type, entity_id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    user_id INT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, read_at),
    INDEX idx_user_created (user_id, created_at)
);

-- Webhooks table
CREATE TABLE webhooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    board_id INT NOT NULL,
    events JSON NOT NULL,
    secret VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_board_active (board_id, active)
);
