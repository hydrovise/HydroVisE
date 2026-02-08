export interface PageConfig {
  title: string;
}

export interface DataPartConfig {
  min_val: number;
  max_val: number;
  step: number;
  initial: number;
}

export interface TimeSliderConfig {
  min: number;
  max: number;
  step: number;
  value: number;
  dynamicRange?: {
    arguments: string;
    body: string;
  };
  label: {
    arguments: string;
    body: string;
  };
}

export interface TraceStyle {
  type: string;
  mode?: string;
  name: string;
  line?: {
    width: number;
    color: string;
  };
}

export interface TraceTemplate {
  var: string[];
  path_format: string;
}

export interface TraceConfig {
  prod: string;
  x_name: string;
  y_name: string;
  modEnabled: number;
  dynamic: number;
  ensemble: number;
  template: TraceTemplate;
  style: TraceStyle;
}

export interface TracesConfig {
  [key: string]: TraceConfig;
}

export interface MapMarkersConfig {
  fnPath: string;
  comIDName: string;
  geomType: string;
  markerAttrs?: {
    template?: {
      var: string[];
      path_format: string;
    };
    comID: string;
  };
  style?: {
    fillColor?: string;
    color?: string;
    fillOpacity?: number;
    radius?: number;
    weight?: number;
    [key: string]: any;
  };
  onEachFeature?: {
    [key: string]: string;
  };
  tooltip?: {
    template: {
      var: string[];
      format: string;
      metricDecimalP?: number;
    };
  };
  plotTitle?: {
    template: {
      var: string[];
      format: string;
    };
  };
  additionalShapes?: {
    template: {
      format: string;
    };
  };
}

export interface SpatialDataConfig {
  name: string;
  geom?: {
    fnPath: string;
    geomType: string;
    defaultStyle?: any;
  };
  style?: any;
  dynStyle?: {
    colorPalette: string[];
    classes?: number[];
    range?: number[];
    spatialColFunc?: string;
    dtFormat?: string;
    nBins?: number;
  };
  timestamps?: {
    fnPath: string;
    extension: string;
  };
  animation?: boolean;
  template?: {
    var: string[];
    path_format: string;
  };
  webGLRenderer?: boolean;
  clickFeature?: boolean;
  comIDName?: string;
}

export interface ContextLayerConfig {
  fnPath: string;
  name: string;
  style?: any;
}

export interface MarkerAttributeConfig {
  var_name: string;
  var_id: string;
  colorPalette?: string[];
  classes?: number[];
  range?: number[];
  nBins?: number;
  decimals?: number;
  labels?: string[];
}

export interface PlotlyLayoutConfig {
  updatemenus?: any[];
  [key: string]: any;
}

export interface MapLayerConfig {
  fnPath: string;
  fn: string;
  var_name: string;
  onEvent: string;
  selected: boolean;
  style?: {
    fillOpacity?: number;
    stroke?: boolean;
    color?: string;
    fill?: boolean;
    fillColor?: string;
    weight?: number;
    radius?: number;
  };
}

export interface MapLayersConfig {
  [key: string]: MapLayerConfig;
}

export interface HydroVisEConfig {
  page?: PageConfig;
  data_part: DataPartConfig;
  timeSlider?: TimeSliderConfig;
  traces: TracesConfig;
  mapMarkers?: MapMarkersConfig;
  mapLayers?: MapLayersConfig;
  spatialData?: {
    [key: string]: SpatialDataConfig;
  };
  contextLayers?: {
    [key: string]: ContextLayerConfig;
  };
  controls?: {
    markerAttrs?: {
      [key: string]: MarkerAttributeConfig;
    };
    prod?: {
      [key: string]: any;
    };
  };
  plotlyLayout?: PlotlyLayoutConfig;
  timeSelectorLayout?: any;
  calcMetrics?: boolean;
  modTrace?: {
    modJS: string;
    modMethod: string;
    modEvnt: string;
    customEval?: string;
    mod?: Record<string, any>;
  };
}

export interface SystemState {
  yr: number | string;
  prod: string;
  sliderState: number | string;
  xRange: any;
  mode: string;
  timeSelector: {
    activeTab: string;
  };
  zoom_state: boolean;
  comID?: string | number;
  markerAttrs?: string;
  mod?: string;
}
