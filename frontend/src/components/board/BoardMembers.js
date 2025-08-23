import React, { useState } from "react";
import { FiUsers, FiPlus, FiMail, FiCheck, FiX } from "react-icons/fi";
import { boardAPI } from "../../services/api";
import { toast } from "react-toastify";
import "./BoardMembers.css";

const BoardMembers = ({ boardId, members = [], onMembersUpdate }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await boardAPI.invite(boardId, {
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setShowInviteForm(false);

      // Refresh members list
      if (onMembersUpdate) {
        onMembersUpdate();
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#e74c3c";
      case "editor":
        return "#3498db";
      case "viewer":
        return "#95a5a6";
      default:
        return "#3498db";
    }
  };

  // Map members to expected structure for rendering
  const mappedMembers = Array.isArray(members)
    ? members.map((m) => {
        // If already has user object, use as is
        if (m.user && m.role) return m;
        // If flat, map to expected
        return {
          ...m,
          user: {
            name: m.name || m.username || m.email || "Unknown User",
            avatar: m.avatar || m.avatar_url || undefined,
          },
          role: m.role || m.type || "member",
        };
      })
    : [];

  return (
    <div className="board-members">
      <div className="members-header">
        <h3>
          <FiUsers />
          Board Members ({mappedMembers.length})
        </h3>
        <button
          className="invite-btn"
          onClick={() => setShowInviteForm(!showInviteForm)}
          title="Invite member"
        >
          <FiPlus />
        </button>
      </div>

      {showInviteForm && (
        <div className="invite-modal-backdrop">
          <div className="invite-modal">
            <div className="invite-modal-header">
              <h3 className="invite-modal-title">Invite Member</h3>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                }}
                className="invite-cancel-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="invite-inputs">
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="invite-email-input"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="invite-role-select"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="invite-actions">
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="invite-send-btn"
              >
                <FiMail />
                {inviting ? "Sending..." : "Send Invite"}
              </button>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                }}
                className="invite-cancel-btn"
              >
                <FiX />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="members-list">
        {mappedMembers.map((member) => (
          <div key={member.id || member.userId} className="member-item">
            <div
              className="member-avatar"
              style={{ backgroundColor: getRoleColor(member.role) }}
            >
              {member.user?.avatar ? (
                <img src={member.user.avatar} alt={member.user.name} />
              ) : (
                <span className="member-initials">
                  {getInitials(member.user?.name)}
                </span>
              )}
            </div>
            <div className="member-info">
              <div className="member-name">
                {member.user?.name}
              </div>
              <div className="member-role">{member.role || "member"}</div>
            </div>
          </div>
        ))}

        {mappedMembers.length === 0 && (
          <div className="no-members">
            <p>No members yet</p>
            <p>Invite people to collaborate on this board</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardMembers;
