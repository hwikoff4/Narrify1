import { useCallback } from 'react';
import { useNarrify } from './useNarrify';

export function useNarrifyConversation() {
  const { openConversation, closeConversation, state } = useNarrify();

  const toggle = useCallback(() => {
    if (state === 'conversation') {
      closeConversation();
    } else {
      openConversation();
    }
  }, [state, openConversation, closeConversation]);

  return {
    open: openConversation,
    close: closeConversation,
    toggle,
    isOpen: state === 'conversation',
  };
}
