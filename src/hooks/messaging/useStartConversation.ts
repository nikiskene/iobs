// src/hooks/messaging/useStartConversation.ts
import { useNavigate } from 'react-router-dom';
import { getOrCreateMemberDm } from '../../lib/messaging/messagingApi';

export function useStartConversation() {
  const navigate = useNavigate();

  async function startConversation(memberId: string) {
    const conversationId = await getOrCreateMemberDm(memberId);

    navigate(`/dashboard/inbox?conversation=${conversationId}`);
  }

  return {
    startConversation,
  };
}