import React from 'react';
import { FiClock, FiMessageCircle, FiPaperclip, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './CardItem.css';

dayjs.extend(relativeTime);

const CardItem = ({ card, onClick }) => {
  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = dayjs(date);
    const now = dayjs();
    const isOverdue = dueDate.isBefore(now);
    const isDueSoon = dueDate.diff(now, 'hour') <= 24;

    return {
      text: dueDate.format('MMM DD'),
      className: isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'due-later'
    };
  };

  const dueDateInfo = formatDueDate(card.due_date);

  return (
    <div className="card-item" onClick={onClick}>
      {/* Card Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.slice(0, 4).map((label, index) => (
            <span
              key={index}
              className="card-label"
              style={{ backgroundColor: label.color || '#666' }}
              title={label.name || label}
            />
          ))}
          {card.labels.length > 4 && (
            <span className="more-labels">+{card.labels.length - 4}</span>
          )}
        </div>
      )}

      {/* Card Title */}
      <h4 className="card-title">{card.title}</h4>

      {/* Card Description Preview */}
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}

      {/* Card Meta Information */}
      <div className="card-meta">
        {/* Due Date */}
        {dueDateInfo && (
          <div className={`card-due-date ${dueDateInfo.className}`}>
            <FiClock />
            <span>{dueDateInfo.text}</span>
          </div>
        )}

        {/* Comment Count */}
        {card.commentCount > 0 && (
          <div className="card-stat">
            <FiMessageCircle />
            <span>{card.commentCount}</span>
          </div>
        )}

        {/* Attachment Count */}
        {card.attachmentCount > 0 && (
          <div className="card-stat">
            <FiPaperclip />
            <span>{card.attachmentCount}</span>
          </div>
        )}

        {/* Assigned User */}
        {card.assignedUser && (
          <div className="card-assignee">
            <FiUser />
            <span>{card.assignedUser.username}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardItem;
