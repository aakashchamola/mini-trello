import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateBoard } from '../../hooks/useBoards';
import { useCreateList } from '../../hooks/useLists';
import { useCreateCard } from '../../hooks/useCards';

const MutationTester = () => {
  const [boardData, setBoardData] = useState({ title: 'Test Board', description: 'Test Description' });
  const [listData, setListData] = useState({ title: 'Test List' });
  const [cardData, setCardData] = useState({ title: 'Test Card', description: 'Test Card Description' });
  const [boardId, setBoardId] = useState('');
  const [listId, setListId] = useState('');

  const createBoardMutation = useCreateBoard();
  const createListMutation = useCreateList();
  const createCardMutation = useCreateCard();

  const handleCreateBoard = () => {
    console.log('🧪 Testing board creation...');
    createBoardMutation.mutate(boardData, {
      onSuccess: (data) => {
        console.log('🧪 Board creation test - Success:', data);
        setBoardId(data.id);
      },
      onError: (error) => {
        console.log('🧪 Board creation test - Error:', error);
      }
    });
  };

  const handleCreateList = () => {
    if (!boardId) {
      toast.error('Create a board first!');
      return;
    }
    console.log('🧪 Testing list creation...');
    createListMutation.mutate({ boardId, listData }, {
      onSuccess: (data) => {
        console.log('🧪 List creation test - Success:', data);
        setListId(data.id);
      },
      onError: (error) => {
        console.log('🧪 List creation test - Error:', error);
      }
    });
  };

  const handleCreateCard = () => {
    if (!listId) {
      toast.error('Create a list first!');
      return;
    }
    console.log('🧪 Testing card creation...');
    createCardMutation.mutate({ boardId, listId, cardData }, {
      onSuccess: (data) => {
        console.log('🧪 Card creation test - Success:', data);
      },
      onError: (error) => {
        console.log('🧪 Card creation test - Error:', error);
      }
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #333', 
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h3>🧪 Mutation Tester</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleCreateBoard}
          disabled={createBoardMutation.isLoading}
          style={{ marginRight: '5px', padding: '5px' }}
        >
          {createBoardMutation.isLoading ? 'Creating...' : 'Create Board'}
        </button>
        {createBoardMutation.isError && <span style={{ color: 'red' }}>❌</span>}
        {createBoardMutation.isSuccess && <span style={{ color: 'green' }}>✅</span>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleCreateList}
          disabled={createListMutation.isLoading || !boardId}
          style={{ marginRight: '5px', padding: '5px' }}
        >
          {createListMutation.isLoading ? 'Creating...' : 'Create List'}
        </button>
        {createListMutation.isError && <span style={{ color: 'red' }}>❌</span>}
        {createListMutation.isSuccess && <span style={{ color: 'green' }}>✅</span>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleCreateCard}
          disabled={createCardMutation.isLoading || !listId}
          style={{ marginRight: '5px', padding: '5px' }}
        >
          {createCardMutation.isLoading ? 'Creating...' : 'Create Card'}
        </button>
        {createCardMutation.isError && <span style={{ color: 'red' }}>❌</span>}
        {createCardMutation.isSuccess && <span style={{ color: 'green' }}>✅</span>}
      </div>

      <div style={{ fontSize: '10px' }}>
        BoardId: {boardId}<br/>
        ListId: {listId}
      </div>
    </div>
  );
};

export default MutationTester;
