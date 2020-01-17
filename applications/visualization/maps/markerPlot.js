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
    leaflet_layers['mapMarkers'].resetStyle(e.target);
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
            mouseover: highlightFeature,
            mouseout: resetHighlight,
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
                        fillOpacity: 0.3
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
                        return f.properties[comIDName];
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
function tooltipStrGen(el) {
    let comID = [config.mapMarkers.comIDName];
    let p = el.properties;
    if (!config.mapMarkers.hasOwnProperty('tooltip')) return false;
    let c = config.mapMarkers.tooltip.template;

    let vals = [];
    c.var.forEach(
        v => {
            if (v==='metric'){
                vals.push(
                    $.isNumeric(p[systemState.markerAttrs]) ? parseFloat(p[systemState.markerAttrs]).toFixed(2) : p[systemState.markerAttrs]
                )
            }else if (v==='metricName'){
                vals.push(
                    config.controls.markerAttrs[systemState.markerAttrs].var_name
                )
            }else {
                vals.push(
                    $.isNumeric(p[v]) ? Math.round(p[v], 1) : p[v]
                )
            }}

    );
    return formatArray(c.format, vals);
}

function draw_markers(pointList, pointListID) {
    function tooltipStrGen(el) {
        let comID = [config.mapMarkers.comIDName];
        let p = el.properties;
        if (!config.mapMarkers.hasOwnProperty('tooltip')) return false;
        let c = config.mapMarkers.tooltip.template;

        let vals = [];
        c.var.forEach(
            v => {
                if (v==='metric'){
                    vals.push(
                        $.isNumeric(p[systemState.markerAttrs]) ? parseFloat(p[systemState.markerAttrs]).toFixed(2) : p[systemState.markerAttrs]
                    )
                }else if (v==='metricName'){
                    vals.push(
                        config.controls.markerAttrs[systemState.markerAttrs].var_name
                    )
                } else
                    {
                    vals.push(
                        $.isNumeric(p[v]) ? Math.round(p[v], 1) : p[v]
                    )
                }

            });
        console.log(c,vals)
        return formatArray(c.format, vals);
    }

    jsonFeatures = [];
    markerArray = [];
    marker = [];

    if (map.hasLayer(group)) {
        group.eachLayer(
            function (l) {
                group.removeLayer(l);
            }
        );

    }
    plist = config.mapMarkers;
    comIDName = plist.comIDName;
    typeList = plist.types;

    let defaultStyle = function () {
        return {
            radius: 8,
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

    if (plist.geomType === 'point') {
        map.createPane('topPane')
        leaflet_layers['mapMarkers'] = L.geoJSON(
            pointList,
            {
                style: plist.hasOwnProperty('style') ? plist.style : defaultStyle,
                onEachFeature: onEachFeature,
                getFeatureId: function (f) {
                    return f.properties[comIDName];
                },
                pointToLayer: function (feature, latlng) { //TODO: add custom ICON for style
                    let tooltipStr = tooltipStrGen(feature);

                    let cMarker = L.circleMarker(latlng);
                    if (tooltipStr) cMarker.bindTooltip(
                        tooltipStr,
                        {
                            permanent: false,
                            direction: 'right',
                            pane:'topPane'
                        }
                    );
                    return cMarker;
                }
            }
        );

        leaflet_layers['mapMarkers'].addTo(map);
        leaflet_layers['mapMarkers'].bringToFront()
    } else {
        map.createPane('topPane')
        leaflet_layers['mapMarkers'] = L.geoJSON(pointList, {
            style: plist.hasOwnProperty('style') ? plist.style : defaultStyle,
            onEachFeature: onEachFeature
        });
        map.addLayer(leaflet_layers['mapMarkers']);
        leaflet_layers['mapMarkers'].eachLayer(layer => {
            let tooltipStr = tooltipStrGen(layer.feature);
            if (tooltipStr) layer.bindTooltip(tooltipStr, {permanent: false, direction: 'right',pane:'topPane'})
        })

        // leaflet_layers['mapMarkers'].bringToFront()
    }
    map.getPane('topPane').style.zIndex=1010;
    updateLayerZIndex()
}

function getStyle() {
    if (plist.hasOwnProperty("markerAttrs")) {
        defaultStyle.fillColor = vColor('KGE', markerAttrs['KGE'])
    } else {
        return (!plist.hasOwnProperty("style")) ? defaultStyle : plist.style
    }
}




function colorCodeMapMarkers(attrName){
    console.log(attrName)
    let _config = config.controls.markerAttrs[attrName];
    console.log(_config)
    let _colorPalette = _config.hasOwnProperty('colorPalette') ? _config.colorPalette : defaultChromaSettings.colorPalette;
    let _nBins = _config.hasOwnProperty('nBins') ? _config.nBins : defaultChromaSettings.nBins;
    let _colorMethod = _config.hasOwnProperty('method') ? _config.method : defaultChromaSettings.method;
    let _range = _config.range;
    getColor = function (val){
        return chroma.scale(_colorPalette).domain(_range, _nBins, _colorMethod)(val).hex()
    };
    //todo: change the headernames to dynamic names in the config file
    leaflet_layers['mapMarkers'].eachLayer( layer=> {
        _comID = layer.feature.properties[comIDName];
        filtered = markerAttrs.filter(f => f[comIDName]== _comID &
            f['year'] == systemState.yr & f['prod'] == systemState.prod)
        // console.log(filtered)
        // console.log(layer)
        attr = systemState.markerAttrs;
        if (filtered.length>0){
            Object.keys(config.controls.markerAttrs).forEach(k => {
                attrName = config.controls.markerAttrs[k].var_id;
                layer.feature.properties[attrName] = filtered[0][attrName];
            });
            layer.options.fillColor = getColor(filtered[0][systemState.markerAttrs]);
            layer.options.fillOpacity = 1;
            layer._tooltip._content = tooltipStrGen(layer.feature);
        }
    });
    leaflet_layers['mapMarkers'].remove();
    leaflet_layers['mapMarkers'].addTo(map)
    generateColorBar1(attr)
}
function generateColorBar1(selected) {
    let defaultColorBar = {
        title: 'generic title',
        units: '(cm^3/cm^3)',
        steps: 4,
        decimals: 2,
        width: 300,
        height: 20,
        position: 'bottomright',
        background: '#888888',
        textColor: '#ffffff',
        labels: [],
        labelFontSize: 15,
        invalid: -9999
    };
    let defaultChromaSettings = {
        colorPalette: ['#fafa6e', '#2A4858'],
        nBins: 5,
        method: 'quantiles'
    };
    let _config = config.controls.markerAttrs[selected];
    let colorbarTitle = _config.hasOwnProperty('var_name') ? _config.var_name : selected;
    let _colorPalette = _config.hasOwnProperty('colorPalette') ? _config.colorPalette : defaultChromaSettings.colorPalette;
    let _nBins = _config.hasOwnProperty('nBins') ? _config.nBins : defaultChromaSettings.nBins;
    let _colorMethod = _config.hasOwnProperty('method') ? _config.method : defaultChromaSettings.method;
    let _range = _config.range;
    getColor = function (val){
        return chroma.scale(_colorPalette).domain(_range, _nBins, _colorMethod)(val).hex()
    };
    colorBar = {};
    delta = parseFloat((_range[1]-_range[0]) / _nBins);

    decimalP = _config.hasOwnProperty('decimals') ? parseInt(_config.decimals) : 2;
    _labels = Array.from(Array(_nBins).keys()).map(v => parseFloat((parseFloat(v) * parseFloat(delta) + parseFloat(_range[0])).toFixed(decimalP)))
    colors = _labels.map(l => String(getColor(l)))
    zipped = d3.zip(colors,_labels).reverse()

    // }

    var str_div_bars = '<div id="colorbar">' +
        '<p style="font-size:20px;font-weight: 400;color: #111111">' + colorbarTitle + '</p>';
    zipped.forEach( element => {
            console.log(element)
            str_div_bars += ('<div class="bar-row" style="height: {2}px">'+
                '<div class="bar bar-label">{0}</div>' +
                '<div class="bar" style="background-color:{1}")></div></div>')
                .format(element[1], String(element[0]), String(30));
        }
    );
    $("#colorbar").replaceWith(str_div_bars + '</div>');
}
