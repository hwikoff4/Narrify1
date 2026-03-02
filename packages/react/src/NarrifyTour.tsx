import { useEffect } from 'react';
import { useNarrify } from './useNarrify';

export interface NarrifyTourProps {
  tourId?: string;
  autoStart?: boolean;
}

/**
 * Renderless component that controls a tour.
 * When autoStart is true, begins the tour on mount and stops on unmount.
 */
export function NarrifyTour({ tourId, autoStart = false }: NarrifyTourProps) {
  const { startTour, stopTour, isReady } = useNarrify();

  useEffect(() => {
    if (autoStart && isReady) {
      startTour(tourId);
      return () => {
        stopTour();
      };
    }
  }, [autoStart, isReady, tourId, startTour, stopTour]);

  return null;
}
