-- Mini Trello Database Schema (Simplified - Only Used Tables)
-- SQLite Compatible

PRAGMA foreign_keys = ON;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS board_members;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Boards table (simplified - no workspace dependency)
CREATE TABLE boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    color VARCHAR(255) DEFAULT '#0079bf',
    is_starred BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_boards_starred ON boards(is_starred);

-- Board members table (for collaboration)
CREATE TABLE board_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(board_id, user_id)
);

CREATE INDEX idx_board_members_board ON board_members(board_id);
CREATE INDEX idx_board_members_user ON board_members(user_id);

-- Lists table
CREATE TABLE lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    board_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX idx_lists_board ON lists(board_id);
CREATE INDEX idx_lists_position ON lists(board_id, position);

-- Cards table
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    list_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    due_date TIMESTAMP NULL,
    is_completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_cards_list ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
CREATE INDEX idx_cards_due_date ON cards(due_date);

-- Comments table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    card_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_card ON comments(card_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created ON comments(created_at);

-- Activities table (for tracking board actions)
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(50), -- 'board', 'list', 'card', 'comment'
    entity_id INTEGER,
    metadata TEXT, -- JSON string for additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_board ON activities(board_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);

-- Triggers to update updated_at timestamps
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users 
    BEGIN 
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_boards_timestamp 
    AFTER UPDATE ON boards 
    BEGIN 
        UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_lists_timestamp 
    AFTER UPDATE ON lists 
    BEGIN 
        UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_cards_timestamp 
    AFTER UPDATE ON cards 
    BEGIN 
        UPDATE cards SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_comments_timestamp 
    AFTER UPDATE ON comments 
    BEGIN 
        UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
