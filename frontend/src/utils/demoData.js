// Demo data for testing React Query implementation
export const demoBoard = {
  id: 'demo-board-1',
  title: 'React Query Demo Board',
  description: 'Testing React Query with Trello-like functionality',
  color: '#0079bf',
  background_color: '#0079bf',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lists: [
    {
      id: 'demo-list-1',
      title: 'To Do',
      position: 0,
      board_id: 'demo-board-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [
        {
          id: 'demo-card-1',
          title: 'Implement React Query for Boards',
          description: 'Add React Query hooks for board management with optimistic updates',
          position: 0,
          priority: 'high',
          labels: ['Feature', 'React Query'],
          assignees: [],
          list_id: 'demo-list-1',
          board_id: 'demo-board-1',
          is_completed: true,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-card-2',
          title: 'Create List Management Hooks',
          description: 'Implement useLists, useCreateList, useUpdateList, useDeleteList',
          position: 1024,
          priority: 'high',
          labels: ['Feature', 'Lists'],
          assignees: [],
          list_id: 'demo-list-1',
          board_id: 'demo-board-1',
          is_completed: true,
          created_at: new Date(Date.now() - 72000000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-card-3',
          title: 'Implement Card Hooks',
          description: 'Add useCards, useCreateCard, useUpdateCard, useDeleteCard, useMoveCard',
          position: 2048,
          priority: 'high',
          labels: ['Feature', 'Cards'],
          assignees: [],
          list_id: 'demo-list-1',
          board_id: 'demo-board-1',
          is_completed: true,
          created_at: new Date(Date.now() - 36000000).toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'demo-list-2',
      title: 'In Progress',
      position: 1024,
      board_id: 'demo-board-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [
        {
          id: 'demo-card-4',
          title: 'Enhance BoardPage with React Query',
          description: 'Update BoardPage component to use React Query hooks instead of local state',
          position: 0,
          priority: 'high',
          labels: ['In Progress', 'BoardPage'],
          assignees: [],
          list_id: 'demo-list-2',
          board_id: 'demo-board-1',
          is_completed: false,
          due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          created_at: new Date(Date.now() - 18000000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-card-5',
          title: 'Add Optimistic Updates',
          description: 'Implement optimistic updates for drag-and-drop and CRUD operations',
          position: 1024,
          priority: 'medium',
          labels: ['In Progress', 'UX'],
          assignees: [],
          list_id: 'demo-list-2',
          board_id: 'demo-board-1',
          is_completed: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'demo-list-3',
      title: 'Testing',
      position: 2048,
      board_id: 'demo-board-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [
        {
          id: 'demo-card-6',
          title: 'Test Drag and Drop',
          description: 'Ensure drag and drop works correctly with React Query optimistic updates',
          position: 0,
          priority: 'medium',
          labels: ['Testing', 'Drag & Drop'],
          assignees: [],
          list_id: 'demo-list-3',
          board_id: 'demo-board-1',
          is_completed: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'demo-list-4',
      title: 'Done',
      position: 3072,
      board_id: 'demo-board-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [
        {
          id: 'demo-card-7',
          title: 'Setup React Query',
          description: 'Install and configure @tanstack/react-query',
          position: 0,
          priority: 'high',
          labels: ['Done', 'Setup'],
          assignees: [],
          list_id: 'demo-list-4',
          board_id: 'demo-board-1',
          is_completed: true,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: 'demo-card-8',
          title: 'Create Query Keys Structure',
          description: 'Define consistent query keys for caching',
          position: 1024,
          priority: 'medium',
          labels: ['Done', 'Architecture'],
          assignees: [],
          list_id: 'demo-list-4',
          board_id: 'demo-board-1',
          is_completed: true,
          created_at: new Date(Date.now() - 144000000).toISOString(),
          updated_at: new Date(Date.now() - 72000000).toISOString(),
        }
      ]
    }
  ]
};

export const demoActivities = [
  {
    id: 'activity-1',
    board_id: 'demo-board-1',
    user_id: 'demo-user-1',
    action_type: 'card_moved',
    entity_type: 'card',
    entity_id: 'demo-card-4',
    description: 'moved "Enhance BoardPage with React Query" from To Do to In Progress',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  },
  {
    id: 'activity-2',
    board_id: 'demo-board-1',
    user_id: 'demo-user-1',
    action_type: 'card_created',
    entity_type: 'card',
    entity_id: 'demo-card-6',
    description: 'added "Test Drag and Drop" to Testing',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'activity-3',
    board_id: 'demo-board-1',
    user_id: 'demo-user-1',
    action_type: 'list_created',
    entity_type: 'list',
    entity_id: 'demo-list-3',
    description: 'added Testing list to this board',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  }
];

export const demoMembers = [
  {
    id: 'demo-user-1',
    email: 'developer@example.com',
    username: 'developer',
    first_name: 'Demo',
    last_name: 'Developer',
    avatar_url: null,
    role: 'admin'
  }
];
