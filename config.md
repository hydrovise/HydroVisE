```json

{
"page":{
"title": "Model performance evaluationswith estimated ET"
},
  "data_part": {
    "min_val": 2016,
    "max_val": 2018,
    "step": 1,
    "initial": 2016
  },
  "traces": {
    "t1": {
      "prod": "Q",
      "x_name": "Time",
      "y_name": "Observed",
      "modEnabled": true,
      "dynamic": 0,
      "ensemble": 0,
      "template": {
        "var": [
          "yr",
          "comID"
        ],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/mydata/{0}/{1}.csv"
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
      "prod": "Monthly",
      "x_name": "Time",
      "y_name": "Monthly",
      "dynamic": 0,
      "ensemble": 0,
      "modEnabled": true,
      "template": {
        "var": [
          "yr",
          "comID"
        ],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/mydata/{0}/{1}.csv"
      },
      "style": {
        "type": "scattergl",
        "mode": "lines",
        "name": "Monthly",
        "line": {
          "color": "#ff0000"
        }
      }
    },
    "t3": {
      "prod": "No_ET",
      "x_name": "Time",
      "y_name": "No_ET",
      "dynamic": 0,
      "ensemble": 0,
      "modEnabled": true,
      "template": {
        "var": [
          "yr",
          "comID"
        ],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/mydata/{0}/{1}.csv"
      },
      "style": {
        "type": "scattergl",
        "mode": "lines",
        "name": "No ET",
        "line": {
          "color": "#00ff00"
        }
      }
    },
    "t4": {
      "prod": "Hourly",
      "x_name": "Time",
      "y_name": "Bareini_1",
      "dynamic": 0,
      "ensemble": 0,
      "modEnabled": true,
      "template": {
        "var": [
          "yr",
          "comID"
        ],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/mydata/{0}/{1}.csv"
      },
      "style": {
        "type": "scattergl",
        "mode": "lines",
        "name": "Hourly",
        "line": {
          "color": "#0000ff"
        }
      }
    },
    "t5": {
      "prod": "Hourly",
      "dynamic": 0,
      "ensemble": 0,
      "modEnabled": true,
      "x_name": "Time",
      "y_name": "No_Cap",
      "template": {
        "var": [
          "yr",
          "usgs_id"
        ],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/mydata/{0}/{1}.csv",
        "argConv": {
          "var": "sliderState",
          "arguments": "v",
          "body": "return ('000' + String(v)).slice(-3);"
        }
      },
      "style": {
        "type": "scattergl",
        "mode": "lines",
        "name": "Hourly",
        "line": {
          "color": "#ff0000"
        }
      }
    }
  },
  "modTrace": {
    "modJS": "./applications/plugin/modQ2S.js",
    "modMethod": "Q2Stage",
    "modEvnt": "evntQ2Stage",
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
  "disable_timeSlider": {
    "min": 0,
    "max": 119,
    "step": 1,
    "value": 0,
    "label": {
      "arguments": "v",
      "body": "return 'Lead time:' + String(v) + 'hrs'"
    }
  },
  "disable_horizontalGrid": {
    "filename": "./data/sig_stage_flow_usgs.csv",
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
    "fnPath": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/lindsay_sites.geojson",
    "comIDName": "usgs_id",
    "geomType": "point",
    "markerAttrs": {
      "template": {
        "var": [],
        "path_format": "http://s-iihr50.iihr.uiowa.edu/ray/mb/maps/lindsay/hygisdata/metrics.csv"
      },
      "comID": "usgs_id"
    },
    "onEachFeature":{
      "click": "clickFeature"
    },
    "plotTitle": {
      "template": {
        "var": ["usgs_name","area"],
        "format": "{0}<br>Area: {1} km<sup>2</sup>"
      }
    },
    "tooltip": {
      "template": {
        "var": [
          "usgs_id",
          "area"
        ],
        "format": "USGS id: {0}<br>Area:{1} km<sup>2</sup>"
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
      "KGE": {
        "var_id": "KGE",
        "var_name": "KGE",
        "onEvent": "selectMetric",
        "selected": true,
        "colorPalette": ["#fafa6e", "#ff1700"],
        "nBins": 9,
        "method": "quantiles",
        "range": [-0.1, 1]
      },
      "Correlation": {
        "var_id": "Correlation",
        "var_name": "Correlation",
        "onEvent": "selectMetric",
        "selected": false,
        "colorPalette": ["#fafa6e", "#2A4858"],
        "nBins": 10,
        "method": "equidistant",
        "range" :[-1, 1]
      },
      "RMSE": {
        "var_id": "RMSE",
        "var_name": "nRMSE",
        "onEvent": "selectMetric",
        "selected": false,
        "colorPalette": ["#fafa6e", "#2A4858"],
        "nBins": 8,
        "method": "equidistant",
        "range" :[-2, 2]
      },
      "MAE": {
        "var_id": "MAE",
        "var_name": "nMAE",
        "onEvent": "selectMetric",
        "selected": false,
        "colorPalette": ["#fafa6e", "#2A4858"],
        "nBins": 8,
        "method": "equidistant",
        "range" :[-2, 2]
      }
    },
    "prod": {
      "t2": {
        "var_id": "Monthly",
        "var_name": "Monthly",
        "onEvent": "select_sim_type",
        "selected": 0
      },
      "t3": {
        "var_id": "No_ET",
        "var_name": "No ET",
        "onEvent": "select_sim_type",
        "selected": 1
      },
      "t4": {
        "var_id": "Hourly",
        "var_name": "Hourly",
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
  "mapLayers": {
    "v1": {
      "var_id": "ifc_rvr.geojson",
      "var_name": "IFC Bridge Sensor",
      "onEvent": "toggLyrStd",
      "selected": false
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
    ],
	"initMD": "-04-01 00:00",
	"finalMD": "-12-01 00:00"
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
    "url": "http://s-iihr50.iihr.uiowa.edu/hydro-analytics.net/data/staticLayers/kmls/ifc_net3_simp.geojson",
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