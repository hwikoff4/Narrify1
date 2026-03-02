import { createContext } from 'react';
import type { NarrifyEngine, TourState } from '@narrify/sdk';

export interface NarrifyContextValue {
  engine: NarrifyEngine | null;
  state: TourState;
  isReady: boolean;
  startTour: (tourId?: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  togglePlayPause: () => void;
  openConversation: () => void;
  closeConversation: () => void;
}

export const NarrifyContext = createContext<NarrifyContextValue | null>(null);
