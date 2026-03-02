export { NarrifyProvider, type NarrifyProviderProps } from './NarrifyProvider';
export { useNarrify } from './useNarrify';
export { useNarrifyConversation } from './useNarrifyConversation';
export { NarrifyTour, type NarrifyTourProps } from './NarrifyTour';
export { NarrifyContext, type NarrifyContextValue } from './context';

// Re-export key types from shared
export type {
  NarrifyConfig,
  ThemeConfig,
  TourDefinition,
  TourStep,
  ConversationConfig,
} from '@narrify/shared';
