var flow;
Papa.parse('SpatialData/flow/1459468800.csv',
    {
        download: true,
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: function (results) {
            flow = results.data;
        flow.forEach(f=> leaflet_layers['flow'].setFeatureStyle(f['lid'], {
                fillColor: 'red',
                fillOpacity: 0.5,
                fillOpacity: 1,
                stroke: true,
                fill: true,
                color: 'red',
                opacity: 1,
                width: flow['flow']*100,
            }))
        }
    }
);
function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEDA0';
}
flow.forEach(f =>{leaflet_layers['flow'].setFeatureStyle(parseInt(f['lid']), {
    fillColor: 'red',
    fillOpacity: 0.5,
    //fillOpacity: 1,
    stroke: true,
    fill: true,
    color: 'black',
    //opacity: 0.2,
    weight: parseFloat(['flow']),
})})

"smap": {
    "geom": {
        "fnPath": "configs/project3/smap_grid_5f.geojson",
            "fn": "smap_grid_5f.geojson",
            "alias": "SMAP Grid",
            "extension": "geojson",
            "defaultStyle": {
            "weight": 2,
                "opacity": 1,
                "color": "white",
                "dashArray": "3",
                "fillOpacity": 0.7,
                "fillColor": "black"
        }
    },
    "fnPath": "data/2dData/SMAPL3v2",
        "extension": "geotiff",
        "name": "SMAP",
        "timestamps": {
        "fnPath": "SpatialData/timestamps/SMAPL3v2.json",
            "extension": "json"
    }
},

,
,
"flow": {
    "geom": {
        "fnPath": "configs/project4/simp_rvr.geojson",
            "fn": "simp_rvr.geojson",
            "alias": "River Network",
            "extension": "geojson",
            "defaultStyle": {
            "weight": 2,
                "opacity": 1,
                "color": "black",
                "dashArray": "3",
                "fillOpacity": 0.7,
                "fillColor": "black"
        }
    },
    "name": "FLow",
        "fnPath": "SpatialData/flow",
        "extension": ".csv",
        "timestamps": {
        "fnPath": "SpatialData/timestamps/flow.json",
            "extension": "json"
    }
}


// geomLayers.on('click', function (e) {
//     if (e.value !== null) {
//         let v = e.value;
//         let html = (`<span class="popupText">` + _colorPalette + ` ${Math.round(v * 1000) / 1000}</span>`);
//         let popup = L.popup()
//             .setLatLng(e.latlng)
//             .setContent(html)
//             .openOn(map);
//     }
// });