import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import Avatar from 'react-avatar';
import { useAuth } from '../../contexts/AuthContext';
import './MentionInput.css';

const MentionInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  boardMembers = [], 
  placeholder = "Add a comment...",
  disabled = false,
  loading = false,
  autoFocus = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Get current user to exclude from mentions
  const { user: currentUser } = useAuth();

  // Filter members based on mention query and exclude current user
  const filteredMembers = boardMembers.filter(member => {
    // Exclude current user from mention suggestions
    if (currentUser && member.user?.id === currentUser.id) {
      return false;
    }
    
    if (!mentionQuery) return true;
    
    const query = mentionQuery.toLowerCase();
    const username = member.user?.username?.toLowerCase() || '';
    const firstName = member.user?.first_name?.toLowerCase() || '';
    const lastName = member.user?.last_name?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    
    return username.includes(query) || 
           firstName.includes(query) || 
           lastName.includes(query) ||
           fullName.includes(query);
  });

  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check for @ symbol to trigger mention suggestions
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Only show suggestions if @ is at start or preceded by space/newline
      const charBeforeAt = lastAtIndex === 0 ? ' ' : textBeforeCursor[lastAtIndex - 1];
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        // Check if there's a space after @ (which would end the mention)
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setMentionStart(lastAtIndex);
          setMentionQuery(textAfterAt);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    // Hide suggestions if no valid @ mention
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleMentionSelect(filteredMembers[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleMentionSelect = (member) => {
    if (mentionStart === -1) return;
    
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current.selectionStart);
    const newValue = `${beforeMention}@${member.user.username} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);
    
    // Focus back to textarea and position cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + member.user.username.length + 2; // +2 for @username + space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleClickOutside = (e) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        textareaRef.current && !textareaRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const getUserDisplayName = (member) => {
    if (member.user?.first_name && member.user?.last_name) {
      return `${member.user.first_name} ${member.user.last_name}`;
    }
    return member.user?.username || 'Unknown User';
  };

  return (
    <div className="mention-input-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        className="mention-textarea"
        rows="3"
      />
      
      {showSuggestions && filteredMembers.length > 0 && (
        <div className="mention-suggestions" ref={suggestionsRef}>
          <div className="mention-suggestions-header">
            <FiSearch size={14} />
            <span>Members</span>
          </div>
          <div className="mention-suggestions-list">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id || member.userId}
                className={`mention-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleMentionSelect(member)}
              >
                <Avatar
                  name={getUserDisplayName(member)}
                  src={member.user?.avatar_url}
                  size="24"
                  round={true}
                />
                <div className="mention-user-info">
                  <div className="mention-user-name">{getUserDisplayName(member)}</div>
                  <div className="mention-username">@{member.user?.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="mention-input-loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default MentionInput;
