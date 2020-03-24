let dynamicLayers = {};
// between tiles and overlays
//TODO: Add map ordering using map panes

function clickFeature(e) {
    let c = config.mapMarkers;
    systemState.comID = e.target.feature.properties[c.comIDName];
    tracePlot(systemState.yr, systemState.comID);
    div_plot.style.setProperty('display', 'block');
    if (c.hasOwnProperty('additionalShapes')) {
        let _temp = c.additionalShapes.template.format;
        let fn = _temp.format(systemState.comID);
        addbasinKML(fn)
    }
}

function highlightFeature(e) {
    let layer = e.target;
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
        let comID = layer.feature.properties.comID;
        let colorVal = layer.feature.properties.ifis_id;

        layer.setStyle({fillColor: randomColor()})

    });
}

function tooltipStrGen(el) {
    let comID = [config.mapMarkers.comIDName];
    let p = el.properties;
    if (!config.mapMarkers.hasOwnProperty('tooltip')) return false;
    let c = config.mapMarkers.tooltip.template;
    let metricDecimalP;
    c.hasOwnProperty('metricDecimalP') ? c.metricDecimalP :  2;
    let vals = [];
    c.var.forEach(
        v => {
            if (v === 'metric') {
                vals.push(
                    $.isNumeric(p[systemState.markerAttrs]) ? parseFloat(p[systemState.markerAttrs]).toFixed(metricDecimalP) : p.hasOwnProperty(systemState.markerAttrs)? p[systemState.markerAttrs] : 'N/A'
                )
            } else if (v === 'metricName') {
                vals.push(
                    config.controls.markerAttrs[systemState.markerAttrs].var_name
                )
            } else {
                vals.push(
                    $.isNumeric(p[v]) ? Math.round(p[v], 1) : p[v]
                )
            }
        }
    );
    return formatArray(c.format, vals);
}

function draw_markers(pointList, pointListID) {
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
                            pane: 'topPane'
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
            if (tooltipStr) layer.bindTooltip(tooltipStr, {permanent: false, direction: 'right', pane: 'topPane'})
        })

        // leaflet_layers['mapMarkers'].bringToFront()
    }
    map.getPane('topPane').style.zIndex = 1010;
    updateLayerZIndex()
}

function getStyle() {
    if (plist.hasOwnProperty("markerAttrs")) {
        defaultStyle.fillColor = vColor('KGE', markerAttrs['KGE'])
    } else {
        return (!plist.hasOwnProperty("style")) ? defaultStyle : plist.style
    }
}


function colorCodeMapMarkers(attrName) {
    let _config = config.controls.markerAttrs[attrName];
    if (_config.hasOwnProperty('classes')) _classes = _config.classes;
    let _colorPalette = _config.hasOwnProperty('colorPalette') ? _config.colorPalette : defaultChromaSettings.colorPalette;
    let _nBins = _config.hasOwnProperty('classes') ? _classes.length : _config.nBins;
    let _range = _config.hasOwnProperty('range') ? _config.range : [Math.min(_classes), Math.max(_classes)]
    let _scale = chroma.scale(_colorPalette).domain(_range).classes(_classes);
    //todo: change the headernames to dynamic names in the config file
    leaflet_layers['mapMarkers'].eachLayer(layer => {
        _comID = layer.feature.properties[comIDName];
        filtered = markerAttrs.filter(f => f[comIDName] == _comID &&
        (f.hasOwnProperty('year') ? f['year'] === systemState.yr : true) &&
            (f.hasOwnProperty('prod') ? f['prod'] === systemState.prod: true));
        attr = systemState.markerAttrs;
        if (filtered.length > 0) {
            Object.keys(config.controls.markerAttrs).forEach(k => {
                attrName = config.controls.markerAttrs[k].var_id;
                layer.feature.properties[attrName] = filtered[0][attrName];
            });
            layer.options.fillColor = _scale(filtered[0][systemState.markerAttrs]);
            layer.options.fillOpacity = 1;
            layer._tooltip._content = tooltipStrGen(layer.feature);
        }
    });
    leaflet_layers['mapMarkers'].remove();
    leaflet_layers['mapMarkers'].addTo(map);
    generateColorBar1(attr)
}

function generateColorBar1(selected) {


    let defaultChromaSettings = {
        colorPalette: ['#fafa6e', '#2A4858'],
        nBins: 5,
        method: 'quantiles'
    };
    let _classes,_labels;
    let _config = config.controls.markerAttrs[selected];
    let colorbarTitle = _config.hasOwnProperty('var_name') ? _config.var_name : selected;
    // let _dynStyle = _config[styleObjName];
    if (_config.hasOwnProperty('classes')) _classes = _config.classes;
    let _colorPalette = _config.hasOwnProperty('colorPalette') ? _config.colorPalette : defaultChromaSettings.colorPalette;
    let _nBins = _config.hasOwnProperty('classes') ? _classes.length : _config.nBins;
    if (_config.hasOwnProperty('labels')) _labels = _config.labels;
    // let _colorMethod = _config.hasOwnProperty('method') ? _config.method : defaultChromaSettings.method;
    let _range = _config.hasOwnProperty('range') ? _config.range : [Math.min(_classes), Math.max(_classes)]
    let _scale = chroma.scale(_colorPalette).domain(_range).classes(_classes);
    decimalP = _config.hasOwnProperty('decimals') ? parseInt(_config.decimals) : 2;

    delta = Math.round((_range[1] - _range[0]) / _nBins * 10 ** decimalP) / 10 ** decimalP;
    if (_labels == undefined){
        _labels = _classes ? _classes.map(v => parseFloat(v.toFixed(decimalP))) :
            Array.from(Array(_nBins).keys()).map(v => parseFloat((parseFloat(v) * parseFloat(delta) +
                parseFloat(_range[0])).toFixed(decimalP)))
    }
    colors = _classes.map(l => String(_scale(l)))
    zipped = d3.zip(colors, _labels).reverse();

    var str_div_bars = '<div id="colorbar">' +
        '<p style="font-size:20px;font-weight: 400;color: #111111">' + colorbarTitle + '</p>';
    zipped.forEach(element => {
            str_div_bars += ('<div class="bar-row" style="height: {2}px">' +
                '<div class="bar bar-label">{0}</div>' +
                '<div class="bar" style="background-color:{1}")></div></div>')
                .format(element[1], String(element[0]), String(30));
        }
    );
    $("#colorbar").replaceWith(str_div_bars + '</div>');
}


function colorCodeMapMarkersSubYear(attrName,markerAttrs) {
    let _config = config.controls.markerAttrs[attrName];
    let _colorPalette = _config.hasOwnProperty('colorPalette') ? _config.colorPalette : defaultChromaSettings.colorPalette;
    let _nBins = _config.hasOwnProperty('nBins') ? _config.nBins : defaultChromaSettings.nBins;
    let _colorMethod = _config.hasOwnProperty('method') ? _config.method : defaultChromaSettings.method;
    let _range = _config.range;
    getColor = function (val) {
        return chroma.scale(_colorPalette).domain(_range, _nBins, _colorMethod)(val).hex()
    };
    //todo: change the headernames to dynamic names in the config file
    leaflet_layers['mapMarkers'].eachLayer(layer => {
        _comID = layer.feature.properties[comIDName];
        filtered = markerAttrs.filter(f => f[comIDName] == _comID &
            f['year'] == systemState.yr & f['prod'] == systemState.prod)
        attr = systemState.markerAttrs;
        if (filtered.length > 0) {
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
    leaflet_layers['mapMarkers'].addTo(map);
    generateColorBar1(attr)
}