import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Narrify, NarrifyEngine, type TourState } from '@narrify/sdk';
import type { NarrifyConfig } from '@narrify/shared';
import { NarrifyContext, type NarrifyContextValue } from './context';

export interface NarrifyProviderProps {
  config: Partial<NarrifyConfig> & { apiKey: string };
  children: React.ReactNode;
}

export function NarrifyProvider({ config, children }: NarrifyProviderProps) {
  const engineRef = useRef<NarrifyEngine | null>(null);
  const [state, setState] = useState<TourState>('idle');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = Narrify.init(config);
    engineRef.current = engine;
    setIsReady(true);

    return () => {
      Narrify.destroy();
      engineRef.current = null;
      setIsReady(false);
      setState('idle');
    };
  }, [config.apiKey]);

  const startTour = useCallback((tourId?: string) => {
    engineRef.current?.start(tourId);
    setState('playing');
  }, []);

  const stopTour = useCallback(() => {
    engineRef.current?.stop();
    setState('idle');
  }, []);

  const nextStep = useCallback(() => {
    engineRef.current?.nextStep();
  }, []);

  const previousStep = useCallback(() => {
    engineRef.current?.previousStep();
  }, []);

  const togglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
    setState(engineRef.current?.getState() ?? 'idle');
  }, []);

  const openConversation = useCallback(() => {
    engineRef.current?.openConversation();
  }, []);

  const closeConversation = useCallback(() => {
    engineRef.current?.closeConversation();
  }, []);

  const value: NarrifyContextValue = {
    engine: engineRef.current,
    state,
    isReady,
    startTour,
    stopTour,
    nextStep,
    previousStep,
    togglePlayPause,
    openConversation,
    closeConversation,
  };

  return (
    <NarrifyContext.Provider value={value}>
      {children}
    </NarrifyContext.Provider>
  );
}
