import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch workspace data
    setIsLoading(false);
  }, [workspaceId]);

  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading workspace..." />;
  }

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <h1>Workspace</h1>
        <p>Coming soon - workspace management functionality</p>
      </div>
    </div>
  );
};

export default WorkspacePage;
