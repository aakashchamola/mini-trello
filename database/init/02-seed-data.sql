-- Seed data for Mini Trello
-- This file populates the database with sample data for development

-- Insert sample users
INSERT INTO users (email, username, password, avatar_url, email_verified) VALUES
('john.doe@example.com', 'johndoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://via.placeholder.com/150/0079bf/ffffff?text=JD', TRUE),
('jane.smith@example.com', 'janesmith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://via.placeholder.com/150/eb5a46/ffffff?text=JS', TRUE),
('alice.johnson@example.com', 'alicejohnson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://via.placeholder.com/150/c377e0/ffffff?text=AJ', TRUE),
('bob.wilson@example.com', 'bobwilson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://via.placeholder.com/150/026aa7/ffffff?text=BW', TRUE),
('carol.brown@example.com', 'carolbrown', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://via.placeholder.com/150/f2d600/ffffff?text=CB', TRUE);

-- Note: Password for all users is 'Password123!'

-- Insert sample workspaces
INSERT INTO workspaces (name, description, owner_id) VALUES
('Acme Corporation', 'Main workspace for Acme Corporation projects', 1),
('Personal Projects', 'Personal workspace for individual projects', 2),
('Startup Ventures', 'Workspace for startup collaboration', 3);

-- Insert workspace members
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
(1, 1, 'admin'),  -- John is admin of Acme Corporation
(1, 2, 'member'), -- Jane is member of Acme Corporation
(1, 3, 'member'), -- Alice is member of Acme Corporation
(1, 4, 'member'), -- Bob is member of Acme Corporation
(2, 2, 'admin'),  -- Jane is admin of Personal Projects
(3, 3, 'admin'),  -- Alice is admin of Startup Ventures
(3, 4, 'member'), -- Bob is member of Startup Ventures
(3, 5, 'member'); -- Carol is member of Startup Ventures

-- Insert sample boards
INSERT INTO boards (title, description, workspace_id, visibility, background) VALUES
('Product Development', 'Main product development board for tracking features and bugs', 1, 'workspace', '#0079bf'),
('Marketing Campaign', 'Q4 marketing campaign planning and execution', 1, 'workspace', '#eb5a46'),
('Personal Tasks', 'My personal todo list and projects', 2, 'private', '#c377e0'),
('Mobile App MVP', 'Development of mobile app minimum viable product', 3, 'workspace', '#026aa7'),
('Website Redesign', 'Complete redesign of company website', 1, 'workspace', '#61bd4f');

-- Insert board members
INSERT INTO board_members (board_id, user_id, role) VALUES
-- Product Development board
(1, 1, 'admin'),
(1, 2, 'editor'),
(1, 3, 'editor'),
(1, 4, 'commenter'),
-- Marketing Campaign board
(2, 1, 'admin'),
(2, 2, 'admin'),
(2, 5, 'editor'),
-- Personal Tasks board
(3, 2, 'admin'),
-- Mobile App MVP board
(4, 3, 'admin'),
(4, 4, 'editor'),
(4, 5, 'editor'),
-- Website Redesign board
(5, 1, 'admin'),
(5, 2, 'editor'),
(5, 3, 'viewer');

-- Insert sample lists
INSERT INTO lists (title, board_id, position) VALUES
-- Product Development board lists
('Backlog', 1, 1024.00000),
('In Progress', 1, 2048.00000),
('Code Review', 1, 3072.00000),
('Testing', 1, 4096.00000),
('Done', 1, 5120.00000),
-- Marketing Campaign board lists
('Ideas', 2, 1024.00000),
('Planning', 2, 2048.00000),
('In Progress', 2, 3072.00000),
('Review', 2, 4096.00000),
('Published', 2, 5120.00000),
-- Personal Tasks board lists
('To Do', 3, 1024.00000),
('Doing', 3, 2048.00000),
('Done', 3, 3072.00000),
-- Mobile App MVP board lists
('User Stories', 4, 1024.00000),
('Development', 4, 2048.00000),
('Testing', 4, 3072.00000),
('Ready for Release', 4, 4096.00000),
-- Website Redesign board lists
('Research', 5, 1024.00000),
('Design', 5, 2048.00000),
('Development', 5, 3072.00000),
('Review', 5, 4096.00000);

-- Insert sample labels
INSERT INTO labels (name, color, board_id) VALUES
-- Product Development board labels
('Bug', '#eb5a46', 1),
('Feature', '#61bd4f', 1),
('Enhancement', '#f2d600', 1),
('High Priority', '#ff6900', 1),
('Low Priority', '#c377e0', 1),
-- Marketing Campaign board labels
('Social Media', '#0079bf', 2),
('Email', '#61bd4f', 2),
('Content', '#f2d600', 2),
('Analytics', '#c377e0', 2),
-- Personal Tasks board labels
('Work', '#eb5a46', 3),
('Personal', '#61bd4f', 3),
('Learning', '#0079bf', 3),
-- Mobile App MVP board labels
('Frontend', '#61bd4f', 4),
('Backend', '#eb5a46', 4),
('API', '#f2d600', 4),
('UI/UX', '#c377e0', 4),
-- Website Redesign board labels
('Homepage', '#0079bf', 5),
('About', '#61bd4f', 5),
('Contact', '#f2d600', 5),
('Blog', '#c377e0', 5);

-- Insert sample cards
INSERT INTO cards (title, description, list_id, position, due_date) VALUES
-- Product Development board cards
('User Authentication System', 'Implement JWT-based user authentication with login, logout, and token refresh functionality', 1, 1024.00000, '2025-09-15 23:59:59'),
('Real-time Notifications', 'Add WebSocket-based real-time notifications for board updates', 1, 2048.00000, '2025-09-20 23:59:59'),
('Drag and Drop Interface', 'Implement drag and drop functionality for cards and lists using React DnD', 2, 1024.00000, '2025-09-10 23:59:59'),
('API Documentation', 'Create comprehensive API documentation using Swagger/OpenAPI', 3, 1024.00000, NULL),
('Performance Optimization', 'Optimize database queries and implement caching for better performance', 4, 1024.00000, NULL),
('Bug Fix: Card Positioning', 'Fix bug where cards lose their position after moving between lists', 5, 1024.00000, NULL),

-- Marketing Campaign board cards
('Q4 Campaign Strategy', 'Develop comprehensive strategy for Q4 marketing campaign', 6, 1024.00000, '2025-08-30 23:59:59'),
('Social Media Calendar', 'Create content calendar for social media posts throughout Q4', 7, 1024.00000, '2025-09-05 23:59:59'),
('Email Newsletter Template', 'Design responsive email template for weekly newsletters', 8, 1024.00000, NULL),
('Analytics Dashboard', 'Set up tracking and analytics dashboard for campaign metrics', 9, 1024.00000, NULL),

-- Personal Tasks board cards
('Learn TypeScript', 'Complete TypeScript course and apply knowledge to current projects', 11, 1024.00000, '2025-09-30 23:59:59'),
('Gym Membership', 'Sign up for local gym and create workout schedule', 12, 1024.00000, NULL),
('Read Tech Books', 'Read "Clean Code" and "System Design Interview" books', 11, 2048.00000, '2025-10-15 23:59:59'),
('Plan Vacation', 'Research and book vacation for December holidays', 13, 1024.00000, NULL),

-- Mobile App MVP board cards
('User Registration Flow', 'Design and implement user registration and onboarding flow', 14, 1024.00000, '2025-09-12 23:59:59'),
('Core App Navigation', 'Implement bottom tab navigation and screen routing', 15, 1024.00000, '2025-09-08 23:59:59'),
('Push Notifications', 'Integrate Firebase for push notifications functionality', 14, 2048.00000, '2025-09-18 23:59:59'),
('App Store Submission', 'Prepare app for App Store and Google Play submission', 17, 1024.00000, '2025-10-01 23:59:59'),

-- Website Redesign board cards
('User Research', 'Conduct user interviews and surveys to understand needs', 18, 1024.00000, '2025-08-25 23:59:59'),
('Wireframes', 'Create low and high fidelity wireframes for all pages', 19, 1024.00000, '2025-09-01 23:59:59'),
('Homepage Development', 'Implement new homepage design with responsive layout', 20, 1024.00000, '2025-09-15 23:59:59'),
('SEO Optimization', 'Optimize website for search engines and page speed', 21, 1024.00000, '2025-09-25 23:59:59');

-- Insert card assignees
INSERT INTO card_assignees (card_id, user_id) VALUES
-- Product Development assignments
(1, 1), (1, 3),  -- User Authentication assigned to John and Alice
(2, 2),          -- Real-time Notifications assigned to Jane
(3, 3),          -- Drag and Drop assigned to Alice
(4, 4),          -- API Documentation assigned to Bob
(5, 1), (5, 2),  -- Performance Optimization assigned to John and Jane
(6, 3),          -- Bug Fix assigned to Alice

-- Marketing Campaign assignments
(7, 2),          -- Q4 Strategy assigned to Jane
(8, 2), (8, 5),  -- Social Media Calendar assigned to Jane and Carol
(9, 5),          -- Email Template assigned to Carol
(10, 2),         -- Analytics Dashboard assigned to Jane

-- Personal Tasks assignments
(11, 2),         -- Learn TypeScript assigned to Jane
(12, 2),         -- Gym Membership assigned to Jane
(13, 2),         -- Read Tech Books assigned to Jane
(14, 2),         -- Plan Vacation assigned to Jane

-- Mobile App MVP assignments
(15, 3), (15, 4), -- User Registration assigned to Alice and Bob
(16, 4),          -- Core Navigation assigned to Bob
(17, 5),          -- Push Notifications assigned to Carol
(18, 3),          -- App Store Submission assigned to Alice

-- Website Redesign assignments
(19, 1),          -- User Research assigned to John
(20, 2),          -- Wireframes assigned to Jane
(21, 3),          -- Homepage Development assigned to Alice
(22, 1), (22, 3); -- SEO Optimization assigned to John and Alice

-- Insert card labels
INSERT INTO card_labels (card_id, label_id) VALUES
-- Product Development card labels
(1, 2), (1, 4),  -- User Authentication: Feature, High Priority
(2, 2), (2, 3),  -- Real-time Notifications: Feature, Enhancement
(3, 2),          -- Drag and Drop: Feature
(4, 3),          -- API Documentation: Enhancement
(5, 3), (5, 4),  -- Performance Optimization: Enhancement, High Priority
(6, 1), (6, 4),  -- Bug Fix: Bug, High Priority

-- Marketing Campaign card labels
(7, 8), (7, 9),  -- Q4 Strategy: Analytics, Content
(8, 6),          -- Social Media Calendar: Social Media
(9, 7),          -- Email Template: Email
(10, 8),         -- Analytics Dashboard: Analytics

-- Personal Tasks card labels
(11, 12), (11, 13), -- Learn TypeScript: Personal, Learning
(12, 11),        -- Gym Membership: Personal
(13, 12), (13, 13), -- Read Tech Books: Personal, Learning
(14, 11),        -- Plan Vacation: Personal

-- Mobile App MVP card labels
(15, 17),        -- User Registration: UI/UX
(16, 14),        -- Core Navigation: Frontend
(17, 15),        -- Push Notifications: Backend
(18, 14), (18, 17), -- App Store Submission: Frontend, UI/UX

-- Website Redesign card labels
(19, 21),        -- User Research: Blog
(20, 18),        -- Wireframes: Homepage
(21, 18),        -- Homepage Development: Homepage
(22, 18);        -- SEO Optimization: Homepage

-- Insert sample comments
INSERT INTO comments (text, card_id, user_id) VALUES
('I think we should use JWT with refresh tokens for better security', 1, 2),
('Agreed! Also, we need to implement proper password hashing with bcrypt', 1, 3),
('The WebSocket implementation looks good. Should we use Socket.IO?', 2, 1),
('Socket.IO would be perfect for this. It handles fallbacks automatically', 2, 3),
('The drag and drop feels a bit laggy on mobile. Can we optimize it?', 3, 4),
('I''ll look into using react-beautiful-dnd for better mobile support', 3, 3),
('Great progress on the Q4 strategy! The target metrics look achievable', 7, 1),
('Thanks! I''ve also added some competitor analysis data', 7, 2),
('The social media calendar is comprehensive. Love the content themes!', 8, 1),
('Should we include TikTok in our social media strategy?', 8, 5),
('Good point! Gen Z is very active on TikTok. Let''s add it', 8, 2),
('The TypeScript course is really helpful. Highly recommend the advanced patterns section', 11, 3),
('I''m struggling with generics. Any good resources?', 11, 2),
('The TypeScript handbook has great examples for generics', 11, 1),
('User research shows people want faster loading times', 19, 2),
('We should definitely prioritize performance in the redesign', 19, 3);

-- Insert sample checklists
INSERT INTO checklists (title, card_id) VALUES
('Authentication Requirements', 1),
('API Endpoints', 1),
('Testing Checklist', 3),
('Campaign Deliverables', 7),
('App Store Requirements', 18),
('SEO Checklist', 22);

-- Insert sample checklist items
INSERT INTO checklist_items (text, checklist_id, completed, position) VALUES
-- Authentication Requirements checklist
('JWT token generation', 1, TRUE, 1024.00000),
('Password hashing with bcrypt', 1, TRUE, 2048.00000),
('Token refresh mechanism', 1, FALSE, 3072.00000),
('Login rate limiting', 1, FALSE, 4096.00000),
('Password reset functionality', 1, FALSE, 5120.00000),

-- API Endpoints checklist
('POST /api/auth/login', 2, TRUE, 1024.00000),
('POST /api/auth/register', 2, TRUE, 2048.00000),
('POST /api/auth/refresh', 2, FALSE, 3072.00000),
('POST /api/auth/logout', 2, FALSE, 4096.00000),
('GET /api/auth/profile', 2, FALSE, 5120.00000),

-- Testing Checklist
('Unit tests for drag handlers', 3, FALSE, 1024.00000),
('Integration tests for position updates', 3, FALSE, 2048.00000),
('E2E tests for user workflows', 3, FALSE, 3072.00000),
('Mobile responsiveness testing', 3, FALSE, 4096.00000),
('Accessibility testing', 3, FALSE, 5120.00000),

-- Campaign Deliverables
('Brand guidelines document', 4, TRUE, 1024.00000),
('Content calendar template', 4, FALSE, 2048.00000),
('Social media assets', 4, FALSE, 3072.00000),
('Email templates', 4, FALSE, 4096.00000),
('Analytics tracking setup', 4, FALSE, 5120.00000),

-- App Store Requirements
('App icon in all required sizes', 5, FALSE, 1024.00000),
('Screenshots for all device types', 5, FALSE, 2048.00000),
('App description and keywords', 5, FALSE, 3072.00000),
('Privacy policy', 5, FALSE, 4096.00000),
('Terms of service', 5, FALSE, 5120.00000),

-- SEO Checklist
('Meta tags optimization', 6, FALSE, 1024.00000),
('Sitemap generation', 6, FALSE, 2048.00000),
('Page speed optimization', 6, FALSE, 3072.00000),
('Mobile-first indexing', 6, FALSE, 4096.00000),
('Schema markup implementation', 6, FALSE, 5120.00000);

-- Insert sample activities
INSERT INTO activities (action, entity_type, entity_id, user_id, board_id, metadata) VALUES
('created', 'card', 1, 1, 1, '{"title": "User Authentication System"}'),
('assigned', 'card', 1, 1, 1, '{"assignee": "Alice Johnson"}'),
('commented', 'card', 1, 2, 1, '{"comment": "I think we should use JWT with refresh tokens"}'),
('moved', 'card', 3, 3, 1, '{"from_list": "Backlog", "to_list": "In Progress"}'),
('created', 'card', 7, 2, 2, '{"title": "Q4 Campaign Strategy"}'),
('updated', 'card', 7, 2, 2, '{"field": "due_date", "value": "2025-08-30"}'),
('created', 'board', 4, 3, 4, '{"title": "Mobile App MVP"}'),
('added_member', 'board', 4, 3, 4, '{"member": "Bob Wilson", "role": "editor"}'),
('created', 'list', 14, 3, 4, '{"title": "User Stories"}'),
('archived', 'card', 6, 1, 1, '{"title": "Bug Fix: Card Positioning"}');

-- Insert sample notifications
INSERT INTO notifications (type, title, message, user_id) VALUES
('assignment', 'You were assigned to a card', 'John Doe assigned you to "User Authentication System"', 3),
('comment', 'New comment on your card', 'Jane Smith commented on "User Authentication System"', 1),
('due_date', 'Card due soon', '"Drag and Drop Interface" is due in 2 days', 3),
('mention', 'You were mentioned', 'Alice Johnson mentioned you in a comment', 2),
('board_invite', 'Board invitation', 'You were invited to join "Mobile App MVP" board', 5);

-- Insert sample webhooks
INSERT INTO webhooks (name, url, board_id, events, secret, active) VALUES
('Slack Integration', 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX', 1, '["card_created", "card_moved", "comment_added"]', 'slack_webhook_secret_123', TRUE),
('Discord Notifications', 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz', 2, '["card_created", "card_completed"]', 'discord_webhook_secret_456', TRUE),
('Custom Analytics', 'https://analytics.example.com/webhooks/trello', 4, '["card_created", "card_moved", "card_completed", "board_activity"]', 'analytics_secret_789', TRUE);
