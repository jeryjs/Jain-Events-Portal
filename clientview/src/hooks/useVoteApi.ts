import config from "../config";

interface PollResults {
  votes: Record<string, number>;
  userVote: string | null;
}

/**
 * Hook for interacting with the voting API
 */
const useVoteApi = () => {
  const getAuthToken = () => localStorage.getItem('auth_token');
  
  /**
   * Fetch poll results for an activity
   */
  const getPollResults = async (eventId: string, activityId: string): Promise<PollResults> => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/activities/${eventId}/${activityId}/poll`, 
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch poll results');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching poll results:', error);
      return { votes: {}, userVote: null };
    }
  };
  
  /**
   * Cast a vote for a participant in a poll
   */
  const castVote = async (eventId: string, activityId: string, participantId: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(
      `${config.API_BASE_URL}/activities/${eventId}/${activityId}/vote/${participantId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cast vote');
    }
    
    return;
  };
  
  return {
    getPollResults,
    castVote
  };
};

export default useVoteApi;
