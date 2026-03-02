import { useContext } from 'react';
import { NarrifyContext, type NarrifyContextValue } from './context';

export function useNarrify(): NarrifyContextValue {
  const context = useContext(NarrifyContext);
  if (!context) {
    throw new Error('useNarrify must be used within a <NarrifyProvider>');
  }
  return context;
}
