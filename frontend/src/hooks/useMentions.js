import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { mentionAPI, handleAPIError } from '../services/api';
import { queryKeys } from './queryKeys';

// Get unread mentions for current user
export const useUnreadMentions = () => {
  return useQuery({
    queryKey: queryKeys.unreadMentions,
    queryFn: async () => {
      const response = await mentionAPI.getUnreadMentions();
      return response.data?.mentions || response.data?.data || [];
    },
    onError: (error) => {
      console.error('Failed to fetch unread mentions:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Get mention count for a specific card
export const useCardMentionCount = (cardId) => {
  return useQuery({
    queryKey: queryKeys.cardMentionCount(cardId),
    queryFn: async () => {
      const response = await mentionAPI.getCardMentionCount(cardId);
      return response.data?.unreadCount || 0;
    },
    enabled: !!cardId,
    onError: (error) => {
      console.error('Failed to fetch card mention count:', error);
      // Don't show toast for mention count errors as they're not critical
    }
  });
};

// Mark card mentions as read
export const useMarkMentionsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId) => {
      const response = await mentionAPI.markCardMentionsAsRead(cardId);
      return response.data;
    },
    onSuccess: (data, cardId) => {
      // Update card mention count to 0
      queryClient.setQueryData(queryKeys.cardMentionCount(cardId), 0);
      
      // Invalidate unread mentions to refresh the overall count
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadMentions });
    },
    onError: (error) => {
      console.error('Failed to mark mentions as read:', error);
      // Don't show toast for read status errors as they're not critical
    }
  });
};
