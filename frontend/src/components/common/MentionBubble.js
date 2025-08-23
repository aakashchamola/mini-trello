import React from 'react';
import './MentionBubble.css';

const MentionBubble = ({ count }) => {
  if (!count || count === 0) {
    return null;
  }

  return (
    <div className="mention-bubble">
      {count > 9 ? '9+' : count}
    </div>
  );
};

export default MentionBubble;
