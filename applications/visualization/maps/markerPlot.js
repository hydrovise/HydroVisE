let dynamicLayers = {};
// between tiles and overlays
//TODO: Add map ordering using map panes
function pathGeneratorGeneral(subConfig) {
    let c = subConfig.template;
    let f = new Function('v', 'return v');

    return formatArray(c.path_format, use_values)
}

function clickFeature(e) {
    let c = config.mapMarkers;
    systemState.comID = e.target.feature.properties[c.comIDName];
    tracePlot(systemState.yr, systemState.comID);
    div_plot.style.setProperty('display', 'block');
    if (c.hasOwnProperty('additionalShapes')) {
        let _temp = c.additionalShapes.template.format;
        let fn = _temp.format(systemState.comID)
        addbasinKML(fn)
    }
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        dashArray: ''
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geomLayers.resetStyle(e.target);
}


function initializeGeom(dynamicGeomID) {
    let useConfig = config.spatialData[dynamicGeomID];
    let srcData;
    let grp = L.featureGroup();
    let fnPath = useConfig.geom.fnPath;
    let geomLayers;
    // fn_path = 'configs/project3/smap_grid_5f.geojson';
    let fn = fnPath.replace(/^.*[\\\/]/, '');
    let geomType = useConfig.geomType;

    function mapDomainDataloader(fnPath) {
        let ext = fn.split('.').pop();
        switch (ext) {
            case 'kmz':
                parentLayer = kmzload(fnPath, fn);
                break;
            case 'kml':
                // srcData = toGeoJSON.kml(fnPath);
                fetch(fnPath)
                    .then(res => res.text())
                    .then(kmltext => {
                        // Create new kml overlay
                        const parser = new DOMParser();
                        const kml = parser.parseFromString(kmltext, 'text/xml');
                        parentLayer = toGeoJSON.kml(kml);
                        // parentLayer = new L.KML(kml);
                    });
                break;
            case 'geojson': // for now only geojson is supported fully
                $.ajax({
                    dataType: "json",
                    url: fnPath,
                    async: false,
                    success: function (data) {
                        srcData = data;
                    }
                });
                break;
        }
    }

    function onEachFeature(feature, layer) {
        layer.on({
            // mouseover: highlightFeature,
            // mouseout: resetHighlight,
            click: clickFeature
        });

    }

    function style(feature) {
        if (useConfig.geom.defaultStyle) {
            return useConfig.geom.defaultStyle
        }
        return {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    }


    // console.log(loadSrc(fn));
    function createGeom() {
        if (geomType === 'Point') {
            geomLayers = L.geoJSON(srcData, {
                style: style,
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) { //TODO: add custom ICON for style
                    return L.circleMarker(latlng);
                },
                pane: dynamicGeomID
            }).addTo(grp);
        } else {
            if (dynamicGeomID === 'smap') {
                geomLayers = L.geoJSON(srcData, {
                    style: {
                        radius: 8,
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    },
                    onEachFeature: onEachFeature,
                    pane: dynamicGeomID
                })
            } else {
                var geomLayers = L.vectorGrid.slicer(srcData, {
                    rendererFactory: L.svg.tile,
                    vectorTileLayerStyles: {
                        sliced: function (properties, zoom) {
                            // var p = properties.mapcolor7 % 5;
                            return {
                                fillColor: 'black',
                                fillOpacity: 0.5,
                                //fillOpacity: 1,
                                stroke: true,
                                fill: true,
                                color: 'black',
                                //opacity: 0.2,
                                weight: 1,
                            }
                        }
                    },
                    getFeatureId: function (f) {
                        return f.properties.link_id;
                    },
                    interactive: true,
                    pane: dynamicGeomID
                })
            }

        }
        leaflet_layers[dynamicGeomID] = geomLayers;
        leaflet_layers[dynamicGeomID].addTo(map);
        leaflet_layers[dynamicGeomID].bringToBack()
    }


    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            dashArray: ''
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        geomLayers.resetStyle(e.target);
    }

    function clickFeature(e) {
        console.log(e.target.feature.properties)
        var clkProp = e.target.feature.properties;

        systemState.comID = comID = clkProp.grid_xy;
        if (!zoom_state) XRange = CheckXRange(systemState.yr);

        tracePlot(systemState.yr, comID);
        div_plot.style.setProperty('display', 'block');
    }

    mapDomainDataloader(fnPath);
    map.createPane(dynamicGeomID);

    createGeom();
    let use_config = config.spatialData[dynamicGeomID];

    let lst_item = "<li id='li_" + dynamicGeomID + "' class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input type='checkbox' onclick=\"toggLyrStd(this)\" value=" + dynamicGeomID +
        " data-type='dynamic' class='checked'><p class='key'> " + use_config.geom.alias + " </p></li>";

    var ctxLayerLegend = document.getElementById("sortable")
    ctxLayerLegend.innerHTML += lst_item;
    updateLayerZIndex()
    //TODO: requirements:
}

// function dynamicGeomStyler (){
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

// }

function restyle(allLayers) {
    allLayers.eachLayer(function (layer) {
        comID = layer.feature.properties.comID;
        colorVal = layer.feature.properties.ifis_id;

        layer.setStyle({fillColor: randomColor()})

    });
}


function draw_markers(pointList, pointListID) {
    function tooltipStrGen(el) {
        let comID = [config.mapMarkers.comIDName];
        let p = el.properties;
        if (!config.mapMarkers.hasOwnProperty('tooltip')) return false;
        let c = config.mapMarkers.tooltip.template;

        let vals = [];
        c.var.forEach(
            v => vals.push(
                $.isNumeric(p[v]) ? Math.round(p[v], 1) : p[v]
            )
        )
        //console.log(formatArray(c.format, vals));
        return formatArray(c.format, vals);
    }

    jsonFeatures = [];
    markerArray = [];
    marker = [];

    if (map.hasLayer(group)) {
        group.eachLayer(
            function (l) {
                //console.log(l)
                group.removeLayer(l);
            }
        );

    }
    plist = config.mapMarkers;
    comIDName = plist.comIDName;

    typeList = plist.types;
    // if (!plist.hasOwnProperty("style")) {
    //
    // }
    let defaultStyle = function () {
        return {
            radius: 5,
            color: "black",
            weight: 2,
            opacity: 1
        }
    };
    // (String)"Function Name" -> registered Function;
    Object.keys(
        plist.onEachFeature
    ).forEach(
        (k) => plist.onEachFeature[k] = eval(plist.onEachFeature[k])
    );

    function onEachFeature(feature, layer) {
        layer.on(
            plist.onEachFeature
        );
    }

    geomLayers = L.geoJSON(
        pointList,
        {
            style: (!plist.hasOwnProperty("style")) ? defaultStyle : plist.style,
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) { //TODO: add custom ICON for style
                let tooltipStr = tooltipStrGen(feature);
                
                let cMarker = L.circleMarker(latlng);
                if (tooltipStr) cMarker.bindTooltip(
                    tooltipStr,
                    {
                        permanent: false,
                        direction: 'right'
                    }
                );
                return L.circleMarker(latlng);
            },
        }
    );
    geomLayers.addTo(map)


}

function draw_markers_sub_year(metrics_subyear, useAttribute, _sim_type) {
    if (map.hasLayer(group)) {
        // map.removeLayer(drawnFeatures); <-- this the wrong way
        group.eachLayer(
            function (l) {
                group.removeLayer(l);
            });
    }
    jsonFeatures = [];

//     _sim_type = 'Q_ol';
    markerArray = [];
    for (var i = 0; i < Object.size(metrics_subyear[useAttribute]); i++) {
        if (metrics_subyear['sim_type'][i] === _sim_type) {

            marker = L.circleMarker(L.latLng(metrics_subyear['lat'][i], metrics_subyear['lon'][i]), {
                radius: 7,
                fillOpacity: 1,
                color: 'black',
                fillColor: vColor(useAttribute, metrics_subyear[useAttribute][i]),//getColor(feature.properties.stype)
                weight: 1
            }).addTo(group);
            marker.feature = {};
            marker.feature.properties = {};
            // marker.properties.someprop = "Test"
            marker.feature.properties.lid = metrics_subyear['lid'][i];
            marker.feature.properties.USGS_name = metrics_subyear['USGS_name'][i];
            marker.feature.properties.USGS_id = metrics_subyear['USGS_id'][i];
            marker.feature.properties.ifis_id = metrics_subyear['ifis_id'][i];
            markerArray.push(marker);
        }

    }
    map.addLayer(group);
    group.bringToFront();
    generateColorBar(systemState.metric);
}

