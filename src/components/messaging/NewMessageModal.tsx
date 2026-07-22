// src/components/messaging/NewMessageModal.tsx
import type { Profile } from '../../lib/types';
import { useStartConversation } from '../../hooks/messaging/useStartConversation';
import MemberPickerModal from './MemberPickerModal';

type NewMessageModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewMessageModal({
  open,
  onClose,
}: NewMessageModalProps) {
  const { startConversation } = useStartConversation();

  async function handleSelect(member: Profile) {
    await startConversation(member.id);
    onClose();
  }

  return (
    <MemberPickerModal
      open={open}
      onClose={onClose}
      onSelect={handleSelect}
    />
  );
}