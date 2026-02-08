import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { HydroVisEConfig, SystemState } from '../types/config';

interface AppState {
  config: HydroVisEConfig | null;
  systemState: SystemState;
  loading: boolean;
  error: string | null;
  eventMetrics: {
    observedData: number[] | null;
    simulatedData: number[] | null;
    results: Record<string, number> | null;
  };
  animationState: {
    isPlaying: boolean;
    currentFrame: number;
    totalFrames: number;
    playbackSpeed: number;
  };
  webglState: {
    enabled: boolean;
    layers: string[];
    performance: {
      fps: number;
      renderTime: number;
    };
  };
  mapMarkers?: any; // Add mapMarkers to AppState
}

type AppAction =
  | { type: 'SET_CONFIG'; payload: HydroVisEConfig }
  | { type: 'UPDATE_SYSTEM_STATE'; payload: Partial<SystemState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_EVENT_METRICS'; payload: Partial<AppState['eventMetrics']> }
  | { type: 'UPDATE_ANIMATION_STATE'; payload: Partial<AppState['animationState']> }
  | { type: 'UPDATE_WEBGL_STATE'; payload: Partial<AppState['webglState']> };

const initialState: AppState = {
  config: null,
  systemState: {
    yr: '',
    prod: '',
    sliderState: '',
    xRange: null,
    mode: '',
    timeSelector: {
      activeTab: ''
    },
    zoom_state: false
  },
  loading: true,
  error: null,
  eventMetrics: {
    observedData: null,
    simulatedData: null,
    results: null
  },
  animationState: {
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 0,
    playbackSpeed: 1
  },
  webglState: {
    enabled: false,
    layers: [],
    performance: {
      fps: 0,
      renderTime: 0
    }
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        systemState: {
          ...state.systemState,
          yr: action.payload.data_part.initial,
          timeSelector: {
            activeTab: action.payload.spatialData
              ? 'div_' + Object.keys(action.payload.spatialData)[0]
              : ''
          }
        }
      };
    case 'UPDATE_SYSTEM_STATE':
      return {
        ...state,
        systemState: { ...state.systemState, ...action.payload }
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_EVENT_METRICS':
      return {
        ...state,
        eventMetrics: { ...state.eventMetrics, ...action.payload }
      };
    case 'UPDATE_ANIMATION_STATE':
      return {
        ...state,
        animationState: { ...state.animationState, ...action.payload }
      };
    case 'UPDATE_WEBGL_STATE':
      return {
        ...state,
        webglState: { ...state.webglState, ...action.payload }
      };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
