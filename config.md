```json
{
   "data_part": {
     "min_val": 2012,
     "max_val": 2018,
     "step": 1,
     "initial": 2018
   },  
   "traces": {
     "t1": {
       "prod": "USGS",
       "x_name": "date",
       "y_name": "val",
       "modEnabled": true,
       "dynamic": 0,
       "group": 0,
       "template": {
         "var": [
           "yr",
           "comID"
         ],
         "path_format": "http://s-iihr51.iihr.uiowa.edu/hydro-analytics.net/USGS/{0}/{1}.csv"
       },
       "style": {
         "type": "scattergl",
         "mode": "lines",
         "name": "USGS",
         "line": {
           "width": 2,
           "color": "black"
         }
       }
     },
     "t2": {
       "prod": "HLM_RF",
       "x_name": "date",
       "y_name": "0",
       "dynamic": 0,
       "group": 0,
       "modEnabled": true,
       "template": {
         "var": [
           "yr",
           "comID"
         ],
         "path_format": "http://s-iihr51.iihr.uiowa.edu/hydro-analytics.net/HLM_RF/{0}/{1}.csv"
       },
       "style": {
         "type": "scattergl",
         "mode": "lines",
         "name": "HLM_RF",
         "line": {
           "color": "#0fccff"
         }
       }
     },
     "t3": {
       "prod": "HLM_openLoop",
       "x_name": "date",
       "y_name": "0",
       "dynamic": 0,
       "group": 0,
       "modEnabled": true,
       "template": {
         "var": [
           "yr",
           "comID"
         ],
         "path_format": "http://s-iihr51.iihr.uiowa.edu/hydro-analytics.net/HLM_openLoop/{0}/{1}.csv"
       },
       "style": {
         "type": "scattergl",
         "mode": "lines",
         "name": "HLM_openLoop",
         "line": {
           "color": "#0700ff"
         }
       }
     }
   },
   "modTrace": {
     "modJS": "http://s-iihr50.iihr.uiowa.edu/hydro-analytics.net/applications/plugin/modQ2S.js",
     "modMethod": "Q2Stage",
     "modEvnt": "evntQ2Stage",
     "customEval": "translate_id=false",
     "default": "flw",
     "mod": {
       "default": {
         "button": "Discharge",
         "pltPath": "yaxis.title",
         "val": "Q (m3/s)"
       },
       "derived": {
         "button": "Stage",
         "pltPath": "yaxis.title",
         "val": "Stage (ft)"
       }
     }
   },
   "disabled_timeSlider": {
     "min": 0,
     "max": 119,
     "step": 1,
     "value": 0,
     "label": {
       "arguments": "v",
       "body": "return 'Lead time:' + String(v) + 'hrs'"
     }
   },
   "disabled_horizontalGrid": {
     "filename": "http://s-iihr50.iihr.uiowa.edu/hydro-analytics.net/data/sig_stage_flow_usgs.csv",
     "comID": "usgs_id",
     "unit_convert": 0.0283168,
     "style": {
       "type": "line",
       "xref": "paper",
       "x0": 0,
       "x1": 1,
       "yref": "y",
       "y0": 0,
       "y1": 0,
       "line": {
         "color": "gray",
         "width": 0.75
       }
     },
     "lines": {
       "flw_action": {
         "color": "#ffff00"
       },
       "flw_flood": {
         "color": "#f89500"
       },
       "flw_moderate": {
         "color": "#ff0000"
       },
       "flw_major": {
         "color": "#d836ff"
       }
     }
   },
   "mapMarkers": {
     "fnPath": "http://s-iihr51.iihr.uiowa.edu/hydro-analytics.net/stationsV1.geojson",
     "comIDName": "link_id",
     "markerAttrs": {
       "template": {
         "var": [],
         "path_format": "http://s-iihr51.iihr.uiowa.edu/hydro-analytics.net/metricsV1.csv"
       },
       "comID": "link"
     },
     "onEachFeature":{
       "click": "clickFeature"
     },
     "plotTitle": {
       "template": {
         "var": ["foreign_id"],
         "format": "USGS: {0}"
       }
     },
     "tooltip": {
       "template": {
         "var": [
           "foreign_id"
         ],
         "format": "USGS: {0}"
       },
       "format": "",
       "propertires": [
         "usgs_id",
         "area",
         "metric"
       ]
     },
     "additionalShapes":{
       "template": {
         "var": [
           "comID"
         ],
         "format": "http://s-iihr50.iihr.uiowa.edu/hydro-analytics.net/services/get_boundary.php?id={0}"
       }
     }
   },
   "controls": {
     "markerAttrs": {
       "v1": {
         "var_id": "kgeO",
         "var_name": "KGE",
         "onEvent": "selectMetric",
         "selected": true
       },
       "v3": {
         "var_id": "cc",
         "var_name": "Correlation",
         "onEvent": "selectMetric",
         "selected": false
       },
       "v4": {
         "var_id": "nrmse",
         "var_name": "nRMSE",
         "onEvent": "selectMetric",
         "selected": false
       },
       "v5": {
         "var_id": "mae",
         "var_name": "nMAE",
         "onEvent": "selectMetric",
         "selected": false
       }
     },
     "prod": {
       "t2": {
         "var_id": "Q_ifc_nwm",
         "var_name": "IFC (NWM)",
         "onEvent": "select_sim_type",
         "selected": 0
       },
       "t3": {
         "var_id": "Q_mrms_hlm_QPF",
         "var_name": "MRMS (HLM)",
         "onEvent": "select_sim_type",
         "selected": 1
       },
       "t4": {
         "var_id": "Q_mrms_nwm",
         "var_name": "MRMS (NWM)",
         "onEvent": "select_sim_type",
         "selected": false
       }
     },
     "baseMapType": {
       "v1": {
         "var_id": "light_all",
         "var_name": "Light",
         "onEvent": "basemap_changer",
         "selected": true
       },
       "v2": {
         "var_id": "Dark",
         "var_name": "Dark",
         "onEvent": "basemap_changer",
         "selected": false
       },
       "v3": {
         "var_id": "Esri Imagery",
         "var_name": "Esri Imagery",
         "onEvent": "basemap_changer",
         "selected": false
       },
       "v4": {
         "var_id": "Toner",
         "var_name": "Toner",
         "onEvent": "basemap_changer",
         "selected": false
       }
     }
   },
   "plotlyLayout": {
     "margin": {
       "l": 100,
       "r": 80,
       "b": 70,
       "t": 50,
       "pad": 1
     },
     "titlefont": {
       "size": 16,
       "color": "black"
     },
     "legend": {
       "x": 0,
       "y": 1,
       "traceorder": "normal",
       "font": {
         "size": 14,
         "color": "#000"
       },
       "bgcolor": "rgba(255,255,255,0.90)",
       "bordercolor": "#000000",
       "borderwidth": 1,
       "orientation": "h"
     },
     "xaxis": {
       "titlefont": {
         "size": 18,
         "color": "#1c1c1c"
       },
       "tickfont": {
         "size": 18,
         "color": "black"
       },
       "type": "date"
     },
     "yaxis": {
       "title": "Q (m3/s)",
       "titlefont": {
         "size": 18,
         "color": "#1c1c1c"
       },
       "tickfont": {
         "size": 18,
         "color": "black"
       },
       "autorange": true,
       "rangemode": "tozero",
       "hoverformat": ".1f"
     },
     "plot_bgcolor": "#fff",
     "paper_bgcolor": "#eee",
     "hovermode": "closest",
     "updatemenus": [
       {
         "buttons": [],
         "direction": "left",
         "pad": {
           "r": 10,
           "t": 10
         },
         "showactive": true,
         "type": "buttons",
         "x": 0,
         "xanchor": "left",
         "y": 1.15,
         "yanchor": "top"
       }
     ]
   },
   "mapLayers": {
     "smGages.geojson": {
       "fnPath": "data/staticLayers/kmls/smGages.geojson",
       "fn": "smGages.geojson",
       "var_name": "Soil Moisture Gage",
       "onEvent": "toggLyrStd",
       "selected": false
     },
     "IACounties.geojson": {
       "fnPath": "data/staticLayers/kmls/IACounties.geojson",
       "fn": "IACounties.geojson",
       "var_name": "IA Counties",
       "onEvent": "toggLyrStd",
       "selected": false
     }
   },
   "map": {
     "center": [
       41.9472,
       -93.5403
     ],
     "defaultZoom": 8,
     "maxZoom": 15,
     "basemapList": {
       "default": {
         "id": "light_all",
         "url": "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
         "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
         "subdomains": "abcd"
       }
     }
   },
   "customBaseMap": {
     "url": "data/staticLayers/kmls/ifc_net3_simp.geojson",
     "colors": {
       "3": "#00e4ff",
       "4": "#00c5ff",
       "5": "#00acff",
       "6": "#018eff",
       "7": "#007dff",
       "8": "#007bff",
       "9": "#0055ff",
       "10": "#000000",
       "11": "#321321"
     },
     "propoertyName": "h_order"
   }
 }
```