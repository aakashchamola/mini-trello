-- Fresh Seed Data for Mini Trello (Simplified Schema)
-- This file populates the database with sample data matching the current flow

-- Note: All users have password 'Password123!' 
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm

-- Insert sample users
INSERT INTO users (email, username, password, avatar_url, email_verified) VALUES
('john.doe@example.com', 'johndoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://ui-avatars.com/api/?name=John+Doe&background=0079bf&color=fff', 1),
('jane.smith@example.com', 'janesmith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://ui-avatars.com/api/?name=Jane+Smith&background=eb5a46&color=fff', 1),
('alice.johnson@example.com', 'alicejohnson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://ui-avatars.com/api/?name=Alice+Johnson&background=c377e0&color=fff', 1),
('bob.wilson@example.com', 'bobwilson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://ui-avatars.com/api/?name=Bob+Wilson&background=026aa7&color=fff', 1),
('carol.brown@example.com', 'carolbrown', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBNFkb4OBiZZpm', 'https://ui-avatars.com/api/?name=Carol+Brown&background=f2d600&color=fff', 1);

-- Insert sample boards
INSERT INTO boards (title, description, owner_id, color, is_starred) VALUES
('Product Development', 'Main product development board for tracking features and bugs', 1, '#0079bf', 1),
('Marketing Campaign', 'Q4 marketing campaign planning and execution', 2, '#eb5a46', 0),
('Personal Tasks', 'Personal todo list and projects', 2, '#c377e0', 1),
('Mobile App MVP', 'Development of mobile app minimum viable product', 3, '#026aa7', 0),
('Website Redesign', 'Complete redesign of company website', 1, '#61bd4f', 0),
('Team Sprint Board', 'Agile sprint planning and tracking', 4, '#ff6900', 1);

-- Insert board members (including automatic owner as admin)
INSERT INTO board_members (board_id, user_id, role) VALUES
-- Product Development board (Owner: John - id 1)
(1, 1, 'admin'),   -- Owner automatically added as admin
(1, 2, 'editor'),  -- Jane as editor
(1, 3, 'editor'),  -- Alice as editor
(1, 4, 'viewer'),  -- Bob as viewer

-- Marketing Campaign board (Owner: Jane - id 2)
(2, 2, 'admin'),   -- Owner automatically added as admin
(2, 1, 'editor'),  -- John as editor
(2, 5, 'editor'),  -- Carol as editor

-- Personal Tasks board (Owner: Jane - id 2)
(3, 2, 'admin'),   -- Owner automatically added as admin

-- Mobile App MVP board (Owner: Alice - id 3)
(4, 3, 'admin'),   -- Owner automatically added as admin
(4, 4, 'editor'),  -- Bob as editor
(4, 5, 'editor'),  -- Carol as editor
(4, 1, 'viewer'),  -- John as viewer

-- Website Redesign board (Owner: John - id 1)
(5, 1, 'admin'),   -- Owner automatically added as admin
(5, 2, 'editor'),  -- Jane as editor
(5, 3, 'editor'),  -- Alice as editor

-- Team Sprint Board (Owner: Bob - id 4)
(6, 4, 'admin'),   -- Owner automatically added as admin
(6, 1, 'editor'),  -- John as editor
(6, 2, 'editor'),  -- Jane as editor
(6, 3, 'editor');  -- Alice as editor

-- Insert sample lists
INSERT INTO lists (title, board_id, position) VALUES
-- Product Development board (id: 1)
('Backlog', 1, 1000),
('In Progress', 1, 2000),
('Code Review', 1, 3000),
('Testing', 1, 4000),
('Done', 1, 5000),

-- Marketing Campaign board (id: 2)
('Ideas', 2, 1000),
('Planning', 2, 2000),
('In Progress', 2, 3000),
('Review', 2, 4000),
('Published', 2, 5000),

-- Personal Tasks board (id: 3)
('To Do', 3, 1000),
('In Progress', 3, 2000),
('Done', 3, 3000),

-- Mobile App MVP board (id: 4)
('User Stories', 4, 1000),
('Development', 4, 2000),
('Testing', 4, 3000),
('Ready for Release', 4, 4000),

-- Website Redesign board (id: 5)
('Research', 5, 1000),
('Design', 5, 2000),
('Development', 5, 3000),
('Review', 5, 4000),

-- Team Sprint Board (id: 6)
('Sprint Backlog', 6, 1000),
('In Progress', 6, 2000),
('In Review', 6, 3000),
('Done', 6, 4000);

-- Insert sample cards
INSERT INTO cards (title, description, list_id, position, due_date, is_completed) VALUES
-- Product Development board cards
('Implement JWT Authentication', 'Set up JWT-based user authentication with login, logout, and token refresh functionality. Include proper password hashing and security measures.', 1, 1000, '2025-09-15 17:00:00', 0),
('Real-time Collaboration Features', 'Add Socket.IO-based real-time updates for board collaboration. Users should see live changes when others move cards or add comments.', 1, 2000, '2025-09-20 17:00:00', 0),
('Drag and Drop Interface', 'Implement smooth drag and drop functionality for cards and lists using React Beautiful DnD library.', 2, 1000, '2025-09-10 17:00:00', 0),
('API Documentation with Swagger', 'Create comprehensive API documentation using Swagger/OpenAPI. Include all endpoints with examples and validation schemas.', 3, 1000, NULL, 0),
('Database Performance Optimization', 'Optimize database queries and add proper indexing for better performance. Focus on board loading and card operations.', 4, 1000, NULL, 0),
('Fix Card Position Bug', 'Fix bug where cards lose their position after moving between lists. Ensure position values are properly maintained.', 5, 1000, NULL, 1),

-- Marketing Campaign board cards
('Q4 Campaign Strategy Document', 'Develop comprehensive strategy for Q4 marketing campaign including target audience, channels, and success metrics.', 6, 1000, '2025-08-30 17:00:00', 0),
('Social Media Content Calendar', 'Create detailed content calendar for social media posts throughout Q4. Include themes, posting schedule, and engagement tactics.', 7, 1000, '2025-09-05 17:00:00', 0),
('Email Newsletter Templates', 'Design responsive email templates for weekly newsletters. Include A/B testing variations for subject lines.', 8, 1000, '2025-09-12 17:00:00', 0),
('Analytics Dashboard Setup', 'Set up comprehensive tracking and analytics dashboard for campaign metrics. Include conversion tracking and ROI calculations.', 9, 1000, NULL, 0),
('Influencer Partnerships', 'Research and reach out to potential influencer partners for Q4 campaign. Focus on micro-influencers in our target niche.', 10, 1000, '2025-09-25 17:00:00', 1),

-- Personal Tasks board cards
('Learn Advanced TypeScript', 'Complete advanced TypeScript course focusing on generics, conditional types, and design patterns. Apply learnings to current projects.', 11, 1000, '2025-09-30 17:00:00', 0),
('Set Up Home Office', 'Organize and optimize home office setup for better productivity. Include ergonomic desk setup and lighting improvements.', 12, 1000, NULL, 0),
('Read Clean Architecture Book', 'Read and take notes on "Clean Architecture" by Robert Martin. Focus on applying principles to current codebase.', 11, 2000, '2025-10-15 17:00:00', 0),
('Plan Winter Vacation', 'Research and book vacation for December holidays. Compare destinations and accommodation options.', 13, 1000, NULL, 1),

-- Mobile App MVP board cards
('User Registration and Onboarding', 'Design and implement complete user registration flow with email verification and guided onboarding experience.', 14, 1000, '2025-09-12 17:00:00', 0),
('Core App Navigation System', 'Implement bottom tab navigation and screen routing using React Navigation. Include deep linking support.', 15, 1000, '2025-09-08 17:00:00', 0),
('Push Notifications Integration', 'Integrate Firebase Cloud Messaging for push notifications. Include notification scheduling and targeting features.', 14, 2000, '2025-09-18 17:00:00', 0),
('App Store Preparation', 'Prepare app for App Store and Google Play submission. Include app icons, screenshots, and store descriptions.', 17, 1000, '2025-10-01 17:00:00', 0),
('User Testing and Feedback', 'Conduct user testing sessions with beta testers. Gather feedback and prioritize improvements for next iteration.', 16, 1000, '2025-09-25 17:00:00', 0),

-- Website Redesign board cards
('User Research and Analysis', 'Conduct user interviews and surveys to understand current pain points and desired improvements for the website.', 18, 1000, '2025-08-25 17:00:00', 0),
('Wireframes and Prototypes', 'Create low and high fidelity wireframes for all main pages. Build interactive prototypes for user testing.', 19, 1000, '2025-09-01 17:00:00', 0),
('Homepage Redesign Implementation', 'Implement new homepage design with responsive layout, improved loading speed, and modern design principles.', 20, 1000, '2025-09-15 17:00:00', 0),
('SEO and Performance Optimization', 'Optimize website for search engines and improve page load speeds. Implement proper meta tags and schema markup.', 21, 1000, '2025-09-25 17:00:00', 0),

-- Team Sprint Board cards
('Sprint Planning Meeting', 'Conduct sprint planning for upcoming 2-week sprint. Review backlog items and estimate story points.', 22, 1000, '2025-08-26 10:00:00', 1),
('Code Review Process Improvement', 'Establish better code review guidelines and implement automated checks for code quality and security.', 23, 1000, '2025-09-02 17:00:00', 0),
('Team Retrospective', 'Conduct team retrospective to discuss what went well, what could be improved, and action items for next sprint.', 24, 1000, '2025-09-09 15:00:00', 0),
('Documentation Update', 'Update technical documentation including API docs, deployment guides, and onboarding materials for new team members.', 22, 2000, NULL, 0);

-- Insert sample comments
INSERT INTO comments (content, card_id, author_id) VALUES
-- Comments on JWT Authentication card
('I think we should use refresh tokens for better security. This way we can invalidate sessions if needed.', 1, 2),
('Agreed! Also, let''s make sure to implement proper rate limiting for login attempts to prevent brute force attacks.', 1, 3),
('Good points. I''ll also add password strength validation and account lockout after failed attempts.', 1, 1),

-- Comments on Real-time Collaboration card
('Socket.IO looks like the best choice for this. It handles fallbacks to polling automatically if WebSocket fails.', 2, 4),
('Should we implement room-based connections so users only get updates for boards they''re viewing?', 2, 1),
('Yes, that''s exactly what I was thinking. We can join/leave rooms based on the current board.', 2, 2),

-- Comments on Drag and Drop card
('The current implementation feels a bit laggy on mobile devices. Any suggestions for optimization?', 3, 3),
('I''ve been reading about react-beautiful-dnd performance tips. We might need to optimize our list rendering.', 3, 1),
('Let''s also consider adding haptic feedback for mobile users when they pick up and drop cards.', 3, 2),

-- Comments on Social Media Calendar card
('The content themes look great! Should we also include TikTok in our strategy for reaching younger audiences?', 8, 1),
('Absolutely! Gen Z is very active on TikTok. I''ll add short-form video content to the calendar.', 8, 2),
('We should also consider Instagram Reels and YouTube Shorts for maximum reach across platforms.', 8, 5),

-- Comments on TypeScript Learning card
('The advanced patterns section is really challenging but worth it. The conditional types chapter was eye-opening.', 11, 3),
('Any recommendations for practice projects to apply these concepts?', 11, 2),
('I found building a type-safe API client really helpful for understanding generics and mapped types.', 11, 1),

-- Comments on User Registration card
('Should we implement social login options like Google and Apple Sign-In alongside email registration?', 15, 4),
('That''s a great idea. It would reduce friction for user onboarding significantly.', 15, 3),
('I''ll research the implementation complexity and user preferences in our target demographic.', 15, 5),

-- Comments on Sprint Planning card
('Great session today! The story point estimates seem more accurate this time around.', 22, 1),
('The new estimation technique really helped. Thanks for introducing planning poker!', 22, 2),
('Looking forward to tackling these challenges in the upcoming sprint.', 22, 4);

-- Insert sample activities (recent board actions)
INSERT INTO activities (board_id, user_id, action, description, entity_type, entity_id, metadata) VALUES
-- Recent activities across different boards
(1, 1, 'created_card', 'John created "Implement JWT Authentication"', 'card', 1, '{"card_title": "Implement JWT Authentication", "list_title": "Backlog"}'),
(1, 2, 'commented', 'Jane commented on "Implement JWT Authentication"', 'comment', 1, '{"card_title": "Implement JWT Authentication", "comment_preview": "I think we should use refresh tokens..."}'),
(1, 3, 'moved_card', 'Alice moved "Drag and Drop Interface" from "Backlog" to "In Progress"', 'card', 3, '{"card_title": "Drag and Drop Interface", "from_list": "Backlog", "to_list": "In Progress"}'),
(1, 1, 'completed_card', 'John marked "Fix Card Position Bug" as completed', 'card', 6, '{"card_title": "Fix Card Position Bug"}'),

(2, 2, 'created_board', 'Jane created board "Marketing Campaign"', 'board', 2, '{"board_title": "Marketing Campaign"}'),
(2, 1, 'joined_board', 'John joined the board as an editor', 'board', 2, '{"member_name": "John Doe", "role": "editor"}'),
(2, 2, 'created_card', 'Jane created "Q4 Campaign Strategy Document"', 'card', 7, '{"card_title": "Q4 Campaign Strategy Document", "list_title": "Ideas"}'),
(2, 5, 'completed_card', 'Carol completed "Influencer Partnerships"', 'card', 11, '{"card_title": "Influencer Partnerships"}'),

(3, 2, 'created_list', 'Jane created list "To Do"', 'list', 11, '{"list_title": "To Do"}'),
(3, 2, 'created_card', 'Jane created "Learn Advanced TypeScript"', 'card', 12, '{"card_title": "Learn Advanced TypeScript", "list_title": "To Do"}'),
(3, 2, 'completed_card', 'Jane completed "Plan Winter Vacation"', 'card', 14, '{"card_title": "Plan Winter Vacation"}'),

(4, 3, 'created_board', 'Alice created board "Mobile App MVP"', 'board', 4, '{"board_title": "Mobile App MVP"}'),
(4, 4, 'joined_board', 'Bob joined the board as an editor', 'board', 4, '{"member_name": "Bob Wilson", "role": "editor"}'),
(4, 5, 'commented', 'Carol commented on "User Registration and Onboarding"', 'comment', 6, '{"card_title": "User Registration and Onboarding", "comment_preview": "Should we implement social login..."}'),

(5, 1, 'starred_board', 'John starred "Website Redesign"', 'board', 5, '{"board_title": "Website Redesign"}'),
(5, 2, 'created_card', 'Jane created "Wireframes and Prototypes"', 'card', 20, '{"card_title": "Wireframes and Prototypes", "list_title": "Design"}'),

(6, 4, 'created_board', 'Bob created board "Team Sprint Board"', 'board', 6, '{"board_title": "Team Sprint Board"}'),
(6, 1, 'completed_card', 'John completed "Sprint Planning Meeting"', 'card', 22, '{"card_title": "Sprint Planning Meeting"}'),
(6, 2, 'commented', 'Jane commented on "Sprint Planning Meeting"', 'comment', 8, '{"card_title": "Sprint Planning Meeting", "comment_preview": "The new estimation technique really helped..."}');

-- Update timestamps to show recent activity (last 7 days)
UPDATE activities SET created_at = datetime('now', '-' || (id * 2) || ' hours');
UPDATE comments SET created_at = datetime('now', '-' || (id * 3) || ' hours');
UPDATE cards SET created_at = datetime('now', '-' || (id * 4) || ' hours');
UPDATE lists SET created_at = datetime('now', '-' || (id * 6) || ' hours');
UPDATE boards SET created_at = datetime('now', '-' || (id * 12) || ' hours');
UPDATE users SET created_at = datetime('now', '-' || (id * 24) || ' hours');
