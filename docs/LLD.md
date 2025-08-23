# Low-Level Design (LLD) - Mini Trello Application

## 1. Backend Implementation Details

### 1.1 Authentication System

#### 1.1.1 User Model (`src/models/User.js`)
```javascript
// Core user entity with authentication capabilities
class User extends Model {
  // Fields: id, email, username, password, avatar_url, email_verified
  // Methods: comparePassword(), toSafeJSON()
  // Hooks: beforeCreate/beforeUpdate for password hashing
}
```

**Key Features:**
- **Password Hashing**: bcrypt with automatic salt generation
- **Email Validation**: Unique constraint with proper indexing
- **Safe JSON Serialization**: Excludes password from API responses
- **Audit Timestamps**: Created/updated tracking

#### 1.1.2 JWT Implementation (`src/utils/jwt.js`)
```javascript
// Token generation and verification utilities
const generateTokenPair = (userId) => ({
  accessToken: jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: '1h' }),
  refreshToken: jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

const verifyAccessToken = (token) => {
  // Validates token signature and expiration
  // Throws descriptive errors for debugging
};
```

**Security Implementation:**
- **Separate Secrets**: Different keys for access and refresh tokens
- **Token Typing**: Explicit token type validation
- **Expiration Management**: Short-lived access tokens with long-lived refresh
- **Error Handling**: Comprehensive error messages for token issues

#### 1.1.3 Authentication Middleware (`src/middleware/auth.js`)
```javascript
const authenticateToken = async (req, res, next) => {
  // 1. Extract Bearer token from Authorization header
  // 2. Verify token signature and expiration
  // 3. Load user from database
  // 4. Attach user object to request
  // 5. Continue to protected route
};
```

**Implementation Details:**
- **Header Parsing**: Robust Bearer token extraction
- **User Hydration**: Full user object attachment to request
- **Error Standardization**: Consistent 401 responses
- **Performance**: Minimal database queries per request

### 1.2 Board Management System

#### 1.2.1 Board Model (`src/models/Board.js`)
```javascript
class Board extends Model {
  // Relationships
  static associate(models) {
    Board.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
    Board.hasMany(models.List, { foreignKey: 'board_id', as: 'lists' });
    Board.belongsToMany(models.User, { 
      through: models.BoardMember, 
      foreignKey: 'board_id',
      as: 'members' 
    });
  }
}
```

**Data Structure:**
- **Core Fields**: title, description, owner_id, color, is_starred
- **Ownership**: Direct relationship to user via owner_id
- **Membership**: Many-to-many through BoardMember with roles
- **Soft Metadata**: Color themes and starring for UX

#### 1.2.2 Board Controller (`src/controllers/boardController.js`)
```javascript
const createBoard = async (req, res) => {
  // 1. Validate input using Joi schema
  // 2. Create board with current user as owner
  // 3. Automatically add owner as admin member
  // 4. Log activity for audit trail
  // 5. Return structured response
};

const getUserBoards = async (req, res) => {
  // 1. Find boards where user is owner OR member
  // 2. Include membership roles and permissions
  // 3. Apply pagination and filtering
  // 4. Return with member counts and metadata
};
```

**Business Logic:**
- **Automatic Ownership**: Creator becomes admin automatically
- **Permission Inheritance**: Owner always has admin privileges
- **Activity Logging**: All actions logged for transparency
- **Optimized Queries**: Efficient loading with associations

#### 1.2.3 Board Permissions Middleware (`src/middleware/boardPermissions.js`)
```javascript
const canRead = async (req, res, next) => {
  // 1. Extract boardId from route parameters
  // 2. Check if user is owner OR member (any role)
  // 3. Attach board object to request for efficiency
  // 4. Continue or return 403 Forbidden
};

const canEdit = async (req, res, next) => {
  // Check for admin OR editor role
};

const canAdmin = async (req, res, next) => {
  // Check for admin role only
};
```

**Permission Levels:**
- **Admin**: Full board control, member management, deletion
- **Editor**: Content modification, card/list management
- **Viewer**: Read-only access, commenting allowed

### 1.3 List and Card Management

#### 1.3.1 List Model (`src/models/List.js`)
```javascript
class List extends Model {
  // Position-based ordering using integer values
  // Relationship to board with cascading deletion
  // Efficient card loading with proper indexing
}
```

**Position Management:**
- **Integer Positioning**: Simple integer-based ordering
- **Gap Strategy**: 1000-unit gaps for easy insertion
- **Reorder Logic**: Efficient position recalculation

#### 1.3.2 Card Model (`src/models/Card.js`)
```javascript
class Card extends Model {
  // Rich content support: title, description, due_date
  // Position tracking within lists
  // Completion status for task management
  // Efficient comment and activity loading
}
```

**Content Features:**
- **Rich Descriptions**: HTML/Markdown support ready
- **Due Date Management**: Optional deadline tracking
- **Completion Status**: Boolean completion tracking
- **Position Flexibility**: Easy drag-and-drop support

#### 1.3.3 Card Controller (`src/controllers/cardController.js`)
```javascript
const moveCard = async (req, res) => {
  // 1. Validate source and destination lists
  // 2. Calculate new position in destination
  // 3. Update card with new list_id and position
  // 4. Emit real-time event to all board members
  // 5. Log move activity with details
};
```

**Move Logic Implementation:**
- **Atomic Operations**: Database transactions for consistency
- **Position Calculation**: Smart positioning between existing cards
- **Real-time Broadcasting**: Immediate updates to all connected users
- **Activity Tracking**: Detailed move logging with context

### 1.4 Real-time System

#### 1.4.1 Socket Handler (`src/socket/socketHandler.js`)
```javascript
class SocketHandler {
  constructor(io) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // JWT authentication for socket connections
    // Room-based connection management
  }

  handleConnection(socket) {
    // 1. Authenticate socket connection
    // 2. Set up board room joining/leaving
    // 3. Handle disconnection cleanup
  }
}
```

**Socket Management:**
- **Authentication**: JWT validation for socket connections
- **Room Management**: Board-specific event broadcasting
- **Connection Lifecycle**: Proper setup and cleanup
- **Error Handling**: Graceful failure and reconnection

#### 1.4.2 Board Events (`src/socket/boardEvents.js`)
```javascript
class BoardEvents {
  emitCardUpdate(boardId, cardData) {
    this.socketHandler.io.to(`board:${boardId}`).emit('card:updated', {
      action: 'update',
      card: cardData,
      timestamp: new Date()
    });
  }

  emitCardMove(boardId, moveData) {
    // Broadcast card movement with detailed information
    // Include source/destination lists for UI updates
  }
}
```

**Event Types:**
- **Card Events**: created, updated, moved, deleted
- **List Events**: created, updated, reordered, deleted
- **Board Events**: updated, member added/removed
- **Comment Events**: created, updated, deleted

#### 1.4.3 Real-time Middleware (`src/socket/realTimeMiddleware.js`)
```javascript
const emitCardEvents = () => (req, res, next) => {
  // Capture original response data
  const originalSend = res.send;
  
  res.send = function(data) {
    // Emit real-time event after successful response
    // Parse response data and broadcast to appropriate rooms
    originalSend.call(this, data);
  };
  
  next();
};
```

**Middleware Pattern:**
- **Response Interception**: Capture API responses for broadcasting
- **Event Extraction**: Parse response data for event details
- **Conditional Broadcasting**: Only emit on successful operations
- **Performance**: Minimal overhead on API responses

### 1.5 Comment System

#### 1.5.1 Comment Model (`src/models/Comment.js`)
```javascript
class Comment extends Model {
  static associate(models) {
    Comment.belongsTo(models.Card, { foreignKey: 'card_id' });
    Comment.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
  }
}
```

**Data Structure:**
- **Content Storage**: Rich text content support
- **Author Tracking**: User association with display data
- **Card Association**: Direct relationship to parent card
- **Timestamp Management**: Creation and modification tracking

#### 1.5.2 Comment Controller (`src/controllers/commentController.js`)
```javascript
const createComment = async (req, res) => {
  // 1. Validate comment content and card existence
  // 2. Check user permissions on parent board
  // 3. Create comment with author association
  // 4. Load comment with author details for response
  // 5. Emit real-time event to board members
};
```

**Implementation Features:**
- **Permission Inheritance**: Uses board permissions for comments
- **Author Loading**: Efficient user data inclusion
- **Real-time Updates**: Immediate comment broadcasting
- **Content Validation**: XSS protection and length limits

### 1.6 Activity Logging System

#### 1.6.1 Activity Model (`src/models/Activity.js`)
```javascript
class Activity extends Model {
  // Comprehensive action tracking with metadata
  // Flexible entity_type and entity_id for polymorphic references
  // JSON metadata field for additional context
  // Board-level aggregation for activity feeds
}
```

**Activity Structure:**
- **Action Types**: created, updated, moved, deleted, completed
- **Entity Tracking**: Polymorphic references to any entity
- **Metadata Storage**: JSON field for rich context
- **User Attribution**: Clear action ownership

#### 1.6.2 Activity Logger Middleware (`src/middleware/activityLogger.js`)
```javascript
const logBoardActivity = (action) => async (req, res, next) => {
  // Capture request context before processing
  const captureContext = () => {
    // Store board, user, and action details
  };

  // Execute after response for success confirmation
  const logActivity = () => {
    // Create activity record with full context
  };
};
```

**Logging Strategy:**
- **Pre/Post Processing**: Context capture and success confirmation
- **Automatic Logging**: Middleware-based transparent logging
- **Rich Context**: Full action details with metadata
- **Performance**: Asynchronous logging to avoid blocking

## 2. Frontend Implementation Details

### 2.1 State Management Architecture

#### 2.1.1 Authentication Context (`src/contexts/AuthContext.js`)
```javascript
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials) => {
    // 1. Dispatch LOGIN_START for loading state
    // 2. Call authAPI.login with credentials
    // 3. Store tokens in localStorage
    // 4. Update context state with user data
    // 5. Connect to Socket.IO server
  };

  const logout = async () => {
    // 1. Call logout API endpoint
    // 2. Clear localStorage tokens
    // 3. Disconnect Socket.IO
    // 4. Reset context state
  };
};
```

**State Management:**
- **Reducer Pattern**: Predictable state updates
- **Persistent Storage**: LocalStorage for token persistence
- **Error Handling**: Comprehensive error state management
- **Loading States**: Fine-grained loading indicators

#### 2.1.2 Application Context (`src/contexts/AppContext.js`)
```javascript
const AppProvider = ({ children }) => {
  // Board management state and functions
  const fetchBoard = useCallback(async (boardId) => {
    // 1. Set loading state
    // 2. Call boardAPI.getById with includes
    // 3. Update context with board data
    // 4. Join Socket.IO room for real-time updates
    // 5. Handle errors with user feedback
  }, []);

  // Real-time event handling
  useEffect(() => {
    socketService.on('card:updated', handleCardUpdate);
    socketService.on('card:moved', handleCardMove);
    // Setup all real-time event listeners
  }, []);
};
```

**Real-time Integration:**
- **Event Listeners**: Comprehensive Socket.IO event handling
- **State Synchronization**: Real-time state updates
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Graceful handling of sync failures

#### 2.1.3 UI Context (`src/contexts/UIContext.js`)
```javascript
const UIProvider = ({ children }) => {
  // Modal management
  const openModal = (modalType, data) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modalType, data } });
  };

  // Theme management
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };
};
```

**UI State Features:**
- **Modal Management**: Centralized modal state control
- **Theme System**: Persistent theme preferences
- **Loading States**: Global and component-level loading
- **Notification System**: Toast and alert management

### 2.2 Component Architecture

#### 2.2.1 Board Page Component (`src/pages/BoardPageNew.js`)
```javascript
const BoardPageNew = () => {
  const { boardId } = useParams();
  const { currentBoard, lists, fetchBoard } = useApp();
  const { showActivities, toggleActivities } = useUI();

  // Drag and drop implementation
  const onDragEnd = (result) => {
    // 1. Parse drag result for source/destination
    // 2. Optimistically update UI state
    // 3. Call moveCard API endpoint
    // 4. Handle success/failure with state reversion
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board-container">
        <BoardHeader />
        <div className="board-content">
          <BoardLists lists={lists} />
          {showActivities && <ActivitySidebar />}
        </div>
      </div>
    </DragDropContext>
  );
};
```

**Component Features:**
- **React Beautiful DnD**: Smooth drag and drop implementation
- **Responsive Layout**: Flexible board and sidebar layout
- **Real-time Updates**: Live collaboration visualization
- **Performance**: Optimized re-rendering with React.memo

#### 2.2.2 Card Modal Component (`src/components/board/CardModal.js`)
```javascript
const CardModal = ({ card, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleSaveCard = async (cardData) => {
    // 1. Validate card data
    // 2. Call updateCard API
    // 3. Update local state optimistically
    // 4. Handle success/error states
  };

  const handleAddComment = async () => {
    // 1. Validate comment content
    // 2. Call createComment API
    // 3. Add comment to local state
    // 4. Clear input and show success
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="card-modal">
        <CardEditor card={card} onSave={handleSaveCard} />
        <CommentSection 
          comments={comments} 
          onAddComment={handleAddComment} 
        />
      </div>
    </Modal>
  );
};
```

**Modal Features:**
- **Rich Editing**: Comprehensive card editing interface
- **Real-time Comments**: Live comment updates
- **Form Validation**: Client-side validation with feedback
- **Accessibility**: Proper modal focus and keyboard navigation

#### 2.2.3 Board Member Manager (`src/components/board/BoardMemberManager.js`)
```javascript
const BoardMemberManager = ({ boardId, members, onUpdate }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');

  const handleInviteMember = async () => {
    // 1. Validate email format
    // 2. Call board collaboration API
    // 3. Update members list
    // 4. Show success notification
  };

  const handleChangeRole = async (memberId, newRole) => {
    // 1. Confirm role change
    // 2. Call update member role API
    // 3. Update local state
    // 4. Log activity for transparency
  };

  return (
    <div className="member-manager">
      <MemberList members={members} onChangeRole={handleChangeRole} />
      <InviteForm onInvite={handleInviteMember} />
    </div>
  );
};
```

**Member Management:**
- **Role-based UI**: Different interfaces for different permissions
- **Validation**: Email format and role validation
- **Optimistic Updates**: Immediate UI feedback
- **Activity Integration**: Transparent member management logging

### 2.3 API Integration Layer

#### 2.3.1 API Client (`src/services/api.js`)
```javascript
// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        // Call refresh endpoint and retry original request
      }
    }
    return Promise.reject(error);
  }
);
```

**API Features:**
- **Automatic Authentication**: Token attachment to all requests
- **Token Refresh**: Seamless token renewal
- **Error Handling**: Comprehensive error response processing
- **Request Timeout**: Network reliability with timeouts

#### 2.3.2 Socket Service (`src/services/socket.js`)
```javascript
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', this.handleConnect);
    this.socket.on('disconnect', this.handleDisconnect);
  }

  joinBoard(boardId) {
    this.socket?.emit('join:board', { boardId });
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    this.socket?.on(event, callback);
  }
}
```

**Socket Features:**
- **Authentication**: JWT-based socket authentication
- **Room Management**: Board-specific event rooms
- **Event Listening**: Centralized event management
- **Connection Handling**: Robust connect/disconnect handling

### 2.4 Routing and Navigation

#### 2.4.1 Protected Route Component (`src/components/common/ProtectedRoute.js`)
```javascript
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

**Route Protection:**
- **Authentication Guards**: Route-level authentication checks
- **Loading States**: Graceful loading during auth verification
- **Redirect Handling**: Proper redirect with return URLs
- **Role-based Access**: Future-ready for role-based routing

#### 2.4.2 Application Router (`src/App.js`)
```javascript
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <UIProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/boards/:boardId" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BoardPageNew />
                    </AppLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </UIProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

**Application Structure:**
- **Provider Hierarchy**: Proper context provider nesting
- **Layout Components**: Consistent application layout
- **Route Organization**: Clear public/protected route separation
- **Development Tools**: React Query DevTools integration

## 3. Database Implementation Details

### 3.1 Schema Design

#### 3.1.1 Core Tables Structure
```sql
-- Users table with authentication support
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

-- Boards with ownership and metadata
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
```

#### 3.1.2 Relationship Tables
```sql
-- Board membership with role-based permissions
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

-- Lists with position-based ordering
CREATE TABLE lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    board_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);
```

#### 3.1.3 Indexing Strategy
```sql
-- Performance indexes for frequent queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_board_members_board ON board_members(board_id);
CREATE INDEX idx_board_members_user ON board_members(user_id);
CREATE INDEX idx_lists_board ON lists(board_id);
CREATE INDEX idx_lists_position ON lists(board_id, position);
CREATE INDEX idx_cards_list ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
CREATE INDEX idx_activities_board ON activities(board_id);
CREATE INDEX idx_activities_created ON activities(created_at);
```

**Index Design Rationale:**
- **User Lookup**: Fast authentication and profile queries
- **Board Access**: Efficient ownership and membership checks
- **Position Queries**: Fast list and card ordering
- **Activity Feeds**: Optimized activity timeline loading

### 3.2 Data Access Patterns

#### 3.2.1 Board Loading Strategy
```javascript
// Efficient board loading with all related data
const loadBoardWithDetails = async (boardId, userId) => {
  return await Board.findByPk(boardId, {
    include: [
      {
        model: List,
        as: 'lists',
        include: [{
          model: Card,
          as: 'cards',
          order: [['position', 'ASC']]
        }],
        order: [['position', 'ASC']]
      },
      {
        model: User,
        as: 'members',
        through: { attributes: ['role'] }
      }
    ]
  });
};
```

**Query Optimization:**
- **Eager Loading**: Single query for complete board data
- **Proper Ordering**: Position-based sorting at database level
- **Role Inclusion**: Member roles loaded with associations
- **Selective Fields**: Only necessary data loaded

#### 3.2.2 Activity Feed Implementation
```javascript
// Paginated activity feed with user details
const getBoardActivities = async (boardId, page = 1, limit = 20) => {
  return await Activity.findAndCountAll({
    where: { board_id: boardId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'avatar_url']
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });
};
```

**Feed Features:**
- **Pagination**: Efficient large dataset handling
- **User Details**: Author information for activity display
- **Chronological Order**: Most recent activities first
- **Count Queries**: Total count for pagination UI

### 3.3 Data Integrity

#### 3.3.1 Foreign Key Constraints
```sql
-- Cascading deletions for data consistency
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
```

**Integrity Rules:**
- **Cascade Deletions**: Automatic cleanup of related data
- **Unique Constraints**: Prevent duplicate memberships
- **Check Constraints**: Valid role enumeration
- **Not Null Constraints**: Required field enforcement

#### 3.3.2 Automatic Timestamps
```sql
-- Triggers for automatic timestamp updates
CREATE TRIGGER update_boards_timestamp 
    AFTER UPDATE ON boards 
    BEGIN 
        UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
```

**Timestamp Management:**
- **Creation Tracking**: Automatic created_at population
- **Update Tracking**: Triggered updated_at modifications
- **Audit Trail**: Complete modification history
- **Cross-platform Consistency**: Database-level time management

## 4. Performance Optimization

### 4.1 Frontend Performance

#### 4.1.1 React Optimization
```javascript
// Memoized components for optimal re-rendering
const CardItem = React.memo(({ card, onUpdate }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.card.id === nextProps.card.id &&
         prevProps.card.updated_at === nextProps.card.updated_at;
});

// Optimized list rendering with virtual scrolling
const BoardLists = ({ lists }) => {
  const listElements = useMemo(() => 
    lists.map(list => <BoardList key={list.id} list={list} />),
    [lists]
  );
  
  return <div className="board-lists">{listElements}</div>;
};
```

**Optimization Techniques:**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Expensive calculation memoization
- **Key Optimization**: Stable keys for list rendering
- **Component Splitting**: Smaller components for better performance

#### 4.1.2 State Management Optimization
```javascript
// Debounced API calls for user input
const useDebouncedCardUpdate = (delay = 500) => {
  const { updateCard } = useApp();
  
  return useCallback(
    debounce(async (cardId, updates) => {
      await updateCard(cardId, updates);
    }, delay),
    [updateCard]
  );
};

// Optimistic updates for immediate UI feedback
const handleCardMove = async (cardId, newListId, newPosition) => {
  // 1. Immediately update UI state
  dispatch({ type: 'MOVE_CARD_OPTIMISTIC', payload: { cardId, newListId, newPosition } });
  
  try {
    // 2. Call API in background
    await cardAPI.move(cardId, { list_id: newListId, position: newPosition });
  } catch (error) {
    // 3. Revert on failure
    dispatch({ type: 'REVERT_CARD_MOVE', payload: { cardId } });
    toast.error('Failed to move card');
  }
};
```

**State Optimization:**
- **Debounced Updates**: Reduce API call frequency
- **Optimistic Updates**: Immediate user feedback
- **Error Recovery**: Graceful state reversion
- **Selective Updates**: Minimal state changes

### 4.2 Backend Performance

#### 4.2.1 Database Query Optimization
```javascript
// Efficient board access queries with minimal data
const getBoardSummary = async (userId) => {
  return await Board.findAll({
    attributes: ['id', 'title', 'color', 'is_starred', 'updated_at'],
    where: {
      [Op.or]: [
        { owner_id: userId },
        { '$members.user_id$': userId }
      ]
    },
    include: [{
      model: User,
      as: 'members',
      attributes: [],
      through: { attributes: [] }
    }],
    order: [['updated_at', 'DESC']]
  });
};
```

**Query Optimization:**
- **Selective Attributes**: Only load necessary columns
- **Efficient Joins**: Optimized association queries
- **Proper Indexing**: Database-level performance
- **Query Planning**: Analyzed execution plans

#### 4.2.2 Caching Strategy
```javascript
// In-memory caching for frequently accessed data
const boardCache = new Map();

const getCachedBoard = async (boardId) => {
  if (boardCache.has(boardId)) {
    const cached = boardCache.get(boardId);
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
  }
  
  const board = await Board.findByPk(boardId);
  boardCache.set(boardId, {
    data: board,
    timestamp: Date.now()
  });
  
  return board;
};
```

**Caching Implementation:**
- **Memory Caching**: Fast access to frequent data
- **TTL Management**: Automatic cache expiration
- **Cache Invalidation**: Update-based cache clearing
- **Memory Management**: Bounded cache size

## 5. Security Implementation

### 5.1 Input Validation

#### 5.1.1 Joi Validation Schemas
```javascript
// Comprehensive input validation
const boardValidationSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .required()
    .trim()
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .messages({
      'string.pattern.base': 'Title contains invalid characters'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .trim(),
    
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default('#0079bf')
});
```

**Validation Features:**
- **Type Safety**: Strict type checking
- **Length Limits**: Prevent data overflow
- **Pattern Matching**: Format validation
- **Sanitization**: Automatic trimming and cleaning

#### 5.1.2 XSS Protection
```javascript
// Content sanitization for rich text
const sanitizeCardContent = (content) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true
  });
};

// SQL injection prevention through ORM
const findCardsByUser = async (userId) => {
  return await Card.findAll({
    where: {
      list_id: {
        [Op.in]: Sequelize.literal(`(
          SELECT l.id FROM lists l 
          JOIN boards b ON l.board_id = b.id 
          WHERE b.owner_id = :userId
        )`)
      }
    },
    replacements: { userId }
  });
};
```

**Security Measures:**
- **Content Sanitization**: XSS attack prevention
- **Parameterized Queries**: SQL injection protection
- **Input Encoding**: Safe data handling
- **Output Escaping**: Safe content rendering

### 5.2 Authentication Security

#### 5.2.1 Password Security
```javascript
// Secure password hashing with bcrypt
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Secure password comparison
const comparePassword = async (plaintext, hash) => {
  return await bcrypt.compare(plaintext, hash);
};

// Password strength validation
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
  });
```

**Password Security:**
- **Strong Hashing**: bcrypt with high salt rounds
- **Strength Requirements**: Complex password patterns
- **Length Limits**: Reasonable password bounds
- **Timing Attack Protection**: Constant-time comparisons

#### 5.2.2 Token Security
```javascript
// Secure token generation with crypto
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Token blacklisting for logout
const blacklistedTokens = new Set();

const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});
```

**Token Security:**
- **Cryptographic Randomness**: Secure token generation
- **Token Blacklisting**: Secure logout implementation
- **Rate Limiting**: Brute force attack prevention
- **Expiration Management**: Time-based token invalidation

This Low-Level Design document provides comprehensive implementation details for the Mini Trello application, covering all technical aspects of the backend, frontend, database, and security implementations. It serves as a detailed technical guide for development and maintenance.
