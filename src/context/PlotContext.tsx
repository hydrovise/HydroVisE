import React, { createContext, useContext, useRef, MutableRefObject } from 'react';

interface PlotOperations {
  addTraces: (lifespan?: string) => Promise<void>;
  clearTraces: (lifespan?: string) => void;
  updateSliderState: (value: number) => void;
}

interface PlotContextType {
  plotOperations: MutableRefObject<PlotOperations | null>;
}

const PlotContext = createContext<PlotContextType | null>(null);

export function PlotProvider({ children }: { children: React.ReactNode }) {
  const plotOperations = useRef<PlotOperations | null>(null);

  return (
    <PlotContext.Provider value={{ plotOperations }}>
      {children}
    </PlotContext.Provider>
  );
}

export function usePlot() {
  const context = useContext(PlotContext);
  if (!context) {
    throw new Error('usePlot must be used within a PlotProvider');
  }
  return context;
}
