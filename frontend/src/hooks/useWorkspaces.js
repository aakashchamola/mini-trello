import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { workspaceAPI, handleAPIError } from '../services/api';
import { queryKeys } from './queryKeys';
import { handleMutationError, debugMutation } from '../utils/debugUtils';

// Fetch user's workspaces
export const useUserWorkspaces = () => {
  return useQuery({
    queryKey: queryKeys.userWorkspaces,
    queryFn: async () => {
      const response = await workspaceAPI.getUserWorkspaces();
      return response.data?.workspaces || response.data?.data || [];
    },
    onError: (error) => {
      console.error('Failed to fetch user workspaces:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch single workspace
export const useWorkspace = (workspaceId) => {
  return useQuery({
    queryKey: queryKeys.workspace(workspaceId),
    queryFn: async () => {
      const response = await workspaceAPI.getWorkspace(workspaceId);
      return response.data?.workspace || response.data;
    },
    enabled: !!workspaceId,
    onError: (error) => {
      console.error('Failed to fetch workspace:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch workspace members
export const useWorkspaceMembers = (workspaceId) => {
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceId),
    queryFn: async () => {
      const response = await workspaceAPI.getWorkspaceMembers(workspaceId);
      return response.data?.members || response.data || [];
    },
    enabled: !!workspaceId,
    onError: (error) => {
      console.error('Failed to fetch workspace members:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Create workspace mutation
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workspaceData) => {
      const response = await workspaceAPI.createWorkspace(workspaceData);
      return response.data?.workspace || response.data;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userWorkspaces });
      toast.success('Workspace created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create workspace:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Update workspace mutation
export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workspaceId, updates }) => {
      const response = await workspaceAPI.updateWorkspace(workspaceId, updates);
      return response.data?.workspace || response.data;
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(
        queryKeys.workspace(updatedWorkspace.id), 
        updatedWorkspace
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.userWorkspaces });
      toast.success('Workspace updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update workspace:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Delete workspace mutation
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workspaceId) => {
      await workspaceAPI.deleteWorkspace(workspaceId);
      return workspaceId;
    },
    onSuccess: (workspaceId) => {
      queryClient.removeQueries({ queryKey: queryKeys.workspace(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userWorkspaces });
      toast.success('Workspace deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete workspace:', error);
      toast.error(handleAPIError(error));
    }
  });
};
