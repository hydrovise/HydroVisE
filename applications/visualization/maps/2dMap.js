async function initializeGeom(dynamicGeomID) {
    let useConfig = config.spatialData[dynamicGeomID];
    let srcData;
    let grp = L.featureGroup();
    let fnPath = useConfig.geom.fnPath;
    let geomLayers;
    let fn = fnPath.replace(/^.*[\\\/]/, '');
    let geomType = useConfig.geom.geomType;
    let webGL_option = useConfig.hasOwnProperty('webGLRenderer') ?
        useConfig.webGLRenderer : false;

    async function mapDomainDataloader(fnPath) {
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
                        let parentLayer = toGeoJSON.kml(kml);
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
            case 'pbf':

            async function loadPBF() {
                var myRequest = new Request(fnPath);
                fetch(myRequest).then(function (response) {
                    return response.arrayBuffer();
                }).then(function (buffer) {
                    srcData = geobuf.decode(new Pbf(buffer));
                    return srcData
                });
            }

                srcData = await loadPBF()
                break;
        }
        return new Promise(function (resolve, reject) {
            resolve(srcData)
        })
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
    async function createGeom(srcData) {
        if (webGL_option) {
            if (geomType === 'Point') {
                geomLayers = L.glify.points({
                    map: map,
                    latitudeKey: 1,
                    longitudeKey: 0,
                    color: useConfig.style.color,
                    opacity: useConfig.style.opacity,
                    data: srcData,
                });
                leaflet_layers[dynamicGeomID] = geomLayers;
                leaflet_layers[dynamicGeomID].addTo(map);
            } else if (geomType === 'Polygon') {
                geomLayers1 = L.glify.shapes({
                    map: map,
                    data: srcData,
                    color: {r: 1, g: 1, b: 1, a: 0}
                });
                leaflet_layers[dynamicGeomID] = geomLayers1;
                leaflet_layers[dynamicGeomID].addTo(map);
            } else if (geomType === 'Line') {
                clickGLFeature = function (e, feature) {
                    let clkProp = feature.properties;

                    systemState.comID = comID = clkProp[useConfig.comIDName];
                    if (!zoom_state) XRange = CheckXRange(systemState.yr);

                    tracePlot(systemState.yr, comID);
                    div_plot.style.setProperty('display', 'block');
                };
                geomLayers = L.glify.lines({
                    map: map,
                    latitudeKey: 1,
                    longitudeKey: 0,
                    color: useConfig.style.color,
                    opacity: useConfig.style.opacity,
                    weight: function (i, feature) {
                        return feature.properties.h_order / 6
                    },
                    click: clickGLFeature,
                    data: srcData,
                });
                leaflet_layers[dynamicGeomID] = geomLayers;
                leaflet_layers[dynamicGeomID].addTo(map);
                // leaflet_layers[dynamicGeomID].bringToBack()

            }
        } else {
            if (geomType === 'Point') {
                geomLayers = L.geoJSON(srcData, {
                    style: style,
                    onEachFeature: onEachFeature,
                    pointToLayer: function (feature, latlng) { //TODO: add custom ICON for style
                        return L.circleMarker(latlng);
                    },
                    pane: dynamicGeomID
                }).addTo(grp);
                leaflet_layers[dynamicGeomID] = geomLayers;
                leaflet_layers[dynamicGeomID].addTo(map);
                leaflet_layers[dynamicGeomID].bringToBack()
            } else if (geomType === 'Polygon') {
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
                });

                leaflet_layers[dynamicGeomID] = geomLayers;
                leaflet_layers[dynamicGeomID].addTo(map);
                leaflet_layers[dynamicGeomID].bringToBack()

            } else if (geomType === 'Line') {
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
                });

                leaflet_layers[dynamicGeomID] = geomLayers;
                leaflet_layers[dynamicGeomID].addTo(map);
                leaflet_layers[dynamicGeomID].bringToBack()

            }
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

    function clickFeature(e) {
        // console.log(e.target.feature.properties)
        var clkProp = e.target.feature.properties;

        systemState.comID = comID = clkProp.grid_xy;
        if (!zoom_state) XRange = CheckXRange(systemState.yr);

        tracePlot(systemState.yr, comID);
        div_plot.style.setProperty('display', 'block');
    }

    // mapDomainDataloader(fnPath);
    map.createPane(dynamicGeomID);
    // mapDomainDataloader(fnPath).then(function(srcData){createGeom(srcData)});
    srcData = await mapDomainDataloader(fnPath)
    createGeom(srcData);
    let use_config = config.spatialData[dynamicGeomID];
    let lst_item = "<li id='li_" + dynamicGeomID + "' class='ui-state-default'> " +
        "<span class='ui-icon ui-icon-arrowthick-2-n-s'></span> " +
        "<input type='checkbox' onclick=\"toggLyrStd(this)\" value=" + dynamicGeomID +
        " data-type='dynamic' class='checked'><p class='key'> "
        + use_config.geom.alias + " </p></li>";

    var ctxLayerLegend = document.getElementById("sortable")
    ctxLayerLegend.innerHTML += lst_item;
    updateLayerZIndex()
    //TODO: requirements:
}

function initSpatialData() {
    function addTab(key, i) {
        let name = twoDConfig[key].name;
        let tabBtn = document.createElement('button');
        tabBtn.className = i === 0 ? "tablinks active" : "tablinks";
        tabBtn.setAttribute('data-keyname', key);
        tabBtn.setAttribute('onclick', 'open2DTab(event,$(this).data(\'keyname\'))');
        tabBtn.innerText = name;
        let twodSelector = document.getElementById('twoDSelector');

        twodSelector.append(tabBtn)
    }

    function addAnimControls(key, i) {
        let name = twoDConfig[key].name;
        let TabDivName = "div_" + key;
        let TabDiv = document.getElementById(TabDivName);
        let animBtn = document.createElement('div');
        animBtn.className = i === 0 ? "animbutton active" : "animbutton";
        animBtn.setAttribute('data-keyname', key);
        animBtn.setAttribute('align', 'right');
        let buttons = "<i class='fa fa-step-backward animationIcons' onclick='prevFrame()'></i>" +
            "<i class='fa fa-play animationIcons' onclick='animateData()'></i>" +
            "<i class='fa fa-pause animationIcons' onclick='stopAnim()'></i>" +
            "<i class='fa fa-step-forward animationIcons' onclick='nextFrame()'></i>";
        let dtPlaceHolder = "<div id='" + TabDivName + "\_dt' class='fa animationIcons'></div>";
        animBtn.innerHTML = dtPlaceHolder + buttons;
        TabDiv.append(animBtn)
    }

    let twoDTimestamps = {};
    let twoDConfig = config.spatialData;
    Object.keys(twoDConfig).forEach((key, i) => {
        let subset = twoDConfig[key];
        let tsExt = subset.timestamps.extension;
        $.ajax({
            url: subset.timestamps.fnPath,
            dataType: tsExt,
            async: false,
            success: function (data) {
                twoDTimestamps[key] = data.map(dt => moment.unix(dt).format('YYYY-MM-DD HH:mm'))
                addTab(key, i);
                if (i === 0) systemState.timeSelector.activeTab = 'div_' + key;
                if (subset.hasOwnProperty('geom')) initializeGeom(key);
            }
        });


    });
    //

    let plotlyIterator = 0;
    Object.keys(config.spatialData).forEach((key, i) => {
        let twoDimDIV = document.createElement("div");
        twoDimDIV.id = "div_" + key;
        twoDimDIV.className = 'tabcontent';
        let divSlider = document.getElementById('twoDSelector');
        divSlider.append(twoDimDIV);
        if (twoDConfig[key].hasOwnProperty('animation') && twoDConfig[key].animation) addAnimControls(key, i);
        let tsVec = twoDTimestamps[key];
        let tsVec_y = tsVec.map(v => v = 1);
        let traceTemp = {
            name: key,
            x: tsVec,
            y: tsVec_y,
            type: 'bar',
            hoverinfo: 'x',
            showlegend: false
        };

        function copy(obj) {
            var a = {};
            for (var x in obj) a[x] = obj[x];
            return a;
        }

        let _layout = JSON.parse(
            JSON.stringify(
                config.timeSelectorLayout
            )
        );
        _layout.xaxis.range = systemState.xRange;

        let newObj = JSON.parse(
            JSON.stringify(
                _layout
            )
        );

        _layout.xaxis.range = systemState.xRange;
        Plotly.newPlot(twoDimDIV, [traceTemp], newObj, {displayModeBar: false, responsive: true});

        let dragLayer = document.getElementsByClassName('nsewdrag')[plotlyIterator];
        twoDimDIV.on('plotly_hover', function (data) {
            dragLayer.style.cursor = 'pointer'
        });

        twoDimDIV.on('plotly_unhover', function (data) {
            dragLayer.style.cursor = '';
        });

        twoDimDIV.on('plotly_click', function (data) {
            datasetName = data.points[0].data.name;
            dt = data.points[0].x;
            dt_unix = moment(dt).format('X');
            twoDMapPlotter(datasetName, dt_unix)

        });
        twoDimDIV.on("plotly_relayout", function (ed) {
            if (div_plot.data) {
                syncPlots(ed, 'div_plot');
            }
        });
        timeSyncDivs.push(twoDimDIV);
        plotlyIterator += 1;
    });
}


function twoDMapPlotter(twoDDataName, unix_time) {
    let bar = L.control.colorBar();
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

    async function readRaster(fn) {
        return fetch(fn).then((resp) => resp.arrayBuffer()).then(function (data) {
            // console.log(data)

            return L.ScalarField.fromGeoTIFF(data)
        })
    }

    let _config = config.spatialData[twoDDataName];
    let fn = pathGeneratorGeneral(_config, unix_time);
    let _style = _config.hasOwnProperty('dynStyle') ? _config.dynStyle : '';
    let _colorPalette = _style.hasOwnProperty('colorPalette') ? _style.colorPalette : defaultChromaSettings.colorPalette;
    let _dtFormat = _style.hasOwnProperty('dtFormat') ? _style.dtFormat : 'YYYY-MM-DD HH:mm';
    let _nBins = _style.hasOwnProperty('nBins') ? _style.nBins : defaultChromaSettings.nBins;
    let _colorMethod = _style.hasOwnProperty('method') ? _style.method : defaultChromaSettings.method;
    let _ts = moment.unix(unix_time).format(_dtFormat); //timestamp
    let _title = _config.name + _ts;

    function getColorbar(_range) {
        let colorBar = {};
        delta = parseFloat((_range[1] - _range[0]) / _nBins);
        if (_style.hasOwnProperty('labels')) {
            return _style.labels.length === _nBins ? _style.labels : _labels
        } else {
            decimalP = _style.hasOwnProperty('decimals') ? _style.decimals : defaultColorBar.decimals;
            _labels = Array.from(Array(_nBins).keys()).map(v => parseFloat((v * delta + _range[0]).toFixed(decimalP)))
        }
        Object.keys(defaultColorBar).forEach(key => {
            if (key == 'labels') {

                colorBar[key] = _labels;

            } else {
                colorBar[key] = _style.hasOwnProperty(key) ? _style[key] : defaultColorBar[key];
            }
        });
        return colorBar
    }

    function addColorscale(_range) {
        if (twoDLegend !== undefined) {
            twoDLegend.remove()
        }

        let _scale = chroma.scale(_colorPalette).domain(_range, _nBins, _colorMethod);
        twoDLegend = L.control.colorBar(_scale, _range, getColorbar(_range));
        twoDLegend.addTo(map);
        return bar
    }


    function getDynamicRange(data) {
        if (_style.hasOwnProperty('range')) {
            return _style.range;
        } else {
            let filtered = [];
            data.forEach(arr => filtered.push(arr.filter(v => v > -9999)));
            return [math.min(filtered), math.max(filtered)]

        }
    }

    function addRaster(geo) {

        let defaultBounds = map.getBounds();
        if (leaflet_layers[twoDDataName] !== undefined) {
            let elem = document.getElementById('li_' + twoDDataName);
            // let fn = standard[lyr_id].fn
            elem.remove();
            leaflet_layers[twoDDataName].remove();
            delete leaflet_layers[twoDDataName]

        }
        // console.log(_range)
        map.createPane(twoDDataName);
        let geomLayers = L.canvasLayer.scalarField(geo, {
            inFilter: (v) => v < _style.hasOwnProperty('invalid') ? _style.invalid : defaultColorBar.invalid,
            // inFilter: (v) => v !== -9999,
            color: chroma.scale(_colorPalette).domain(getDynamicRange(geo.grid), _nBins, _colorMethod),
            opacity: 1,
            maxBounds: defaultBounds,
            zoom: defaultBounds,
            pane: twoDDataName
        });
        leaflet_layers[twoDDataName] = geomLayers;
        leaflet_layers[twoDDataName].addTo(map);

        map.fitBounds(defaultBounds);
    }

    if (!_config.hasOwnProperty('geom')) {
        readRaster(fn).then(geo => {
                addRaster(geo);
                _range1 = getDynamicRange(geo.grid);
                addColorscale(_range1);
                let lst_item = "<li id='li_" + twoDDataName + "' class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input type='checkbox' onclick=\"toggLyrStd(this)\" value=" + twoDDataName +
                    " data-type='dynamic' class='input checked'><p class='key'> " + _config.name + ' : ' + _ts + " </p></li>";
                var ctxLayerLegend = document.getElementById("sortable");
                ctxLayerLegend.innerHTML += lst_item;
                updateLayerZIndex()
            }
        );

    } else {
        if (leaflet_layers[twoDDataName] === undefined) {
            initializeGeom(twoDDataName)
        }
        colorcodeGeometry(fn, twoDDataName)

    }
    updatedtPlaceholder(unix_time, twoDDataName)
}

function colorcodeGeomBin(_data, twoDDataName) {
    let _subConfig = config.spatialData[twoDDataName];
    let _dynStyle = _subConfig.dynStyle;
    if (!_dynStyle.hasOwnProperty('classes')) alert('Ptrovide the color classes for dynamic styling');
    let _range = _dynStyle.hasOwnProperty('range') ? _dynStyle.range : [Math.min(_dynStyle.classes), Math.max(_dynStyle.classes)];
    let _scale = chroma.scale(_dynStyle.colorPalette).domain(_range).classes(_dynStyle.classes);
    function getFloodPotential(i, feature){
        let up_area = feature.properties.up_area;
        let Q_233 = 3.12*(up_area/1000000)**0.57;
        featData = _data[i]/Q_233;
        cl = _scale(featData).rgb();
        if (_subConfig.geom.geomType === 'Polygon') {
            return {
                r: cl[0] / 255,
                g: cl[1] / 255,
                b: cl[2] / 255,
                a: featData > 0 ? 1 : 0
            }
        } else {
            return {
                r: cl[0] / 255,
                g: cl[1] / 255,
                b: cl[2] / 255
            }
        }
    }
    function getColor(i, feature) {
        featData = _data[i];
        // console.log(func())
        cl = _scale(featData).rgb();
        if (_subConfig.geom.geomType === 'Polygon') {
            return {
                r: cl[0] / 255,
                g: cl[1] / 255,
                b: cl[2] / 255,
                a: featData > 0 ? 1 : 0
            }
        } else {
            return {
                r: cl[0] / 255,
                g: cl[1] / 255,
                b: cl[2] / 255
            }
        }
    }

    if (_dynStyle.hasOwnProperty('spatialColFunc')) {
            leaflet_layers[twoDDataName].settings.color =  getFloodPotential
    } else {
        leaflet_layers[twoDDataName].settings.color = getColor
    }
    // leaflet_layers[twoDDataName].settings.color = _dynStyle.hasOwnProperty('spatialColFunc') ? getFloodPotential
    // leaflet_layers[twoDDataName].settings.color =


    // leaflet_layers[twoDDataName].settings.color = function getColor1(i, feature){
    //         function test(){
    //                 let up_area = feature.properties.up_area;
    //                 let Q_233 = 3.12*(up_area/1000000)**0.57;
    //                 return _data[i]/Q_233;
    //             }
    //         let featData = _dynStyle.hasOwnProperty('customFunction') ? test() : _data[i];
    //         cl = _scale().rgb();
    //         if (_subConfig.geom.geomType === 'Polygon') {
    //             return {
    //                 r: cl[0] / 255,
    //                 g: cl[1] / 255,
    //                 b: cl[2] / 255,
    //                 a: featData > 0 ? 1 : 0
    //             }
    //         } else {
    //             return {
    //                 r: cl[0] / 255,
    //                 g: cl[1] / 255,
    //                 b: cl[2] / 255
    //             }
    //         }
    //
    //     };
    // TODO add Custom Function defined from Config file:

    leaflet_layers[twoDDataName].settings.color =

        // function getColor(i, feature) {
        // featData = _data[i];
        // cl = _scale(featData).rgb();
        // if (_subConfig.geom.geomType === 'Polygon') {
        //     return {
        //         r: cl[0] / 255,
        //         g: cl[1] / 255,
        //         b: cl[2] / 255,
        //         a: featData > 0 ? 1 : 0
        //     }
        // } else {
        //     return {
        //         r: cl[0] / 255,
        //         g: cl[1] / 255,
        //         b: cl[2] / 255
        //     }
        // }
    //
    //
    // };
    leaflet_layers[twoDDataName].render();

}


function colorcodeGeometry(fn, twoDDataName) {

    let _data;
    let _subConfig = config.spatialData[twoDDataName];
    let dataType = _subConfig.dataType;
    function generateColorBar1(selected) {
        let defaultChromaSettings = {
            colorPalette: ['#fafa6e', '#2A4858'],
            nBins: 5,
            method: 'quantiles'
        };
        let _classes,_labels;
        let _config = config.spatialData[twoDDataName];
        let dataType = _subConfig.dataType;
        let _dynStyle = _subConfig.dynStyle;
        if (_dynStyle.hasOwnProperty('classes')) _classes = _dynStyle.classes;
        selected = twoDDataName;
        let colorbarTitle = _dynStyle.hasOwnProperty('var_name') ? _dynStyle.var_name : selected;
        let _colorPalette = _dynStyle.hasOwnProperty('colorPalette') ? _dynStyle.colorPalette : defaultChromaSettings.colorPalette;
        let _nBins = _dynStyle.hasOwnProperty('classes') ? _classes.length : defaultChromaSettings.nBins;
        if (_dynStyle.hasOwnProperty('labels')) _labels = _dynStyle.labels;
        let _colorMethod = _dynStyle.hasOwnProperty('method') ? _dynStyle.method : defaultChromaSettings.method;
        let _range = _dynStyle.hasOwnProperty('range') ? _dynStyle.range : [Math.min(_classes), Math.max(_classes)]
        let _scale = chroma.scale(_colorPalette).domain(_range).classes(_classes);
        decimalP = _config.hasOwnProperty('decimals') ? parseInt(_config.decimals) : 2;

        delta = Math.round((_range[1] - _range[0]) / _nBins * 10 ** decimalP) / 10 ** decimalP;
        if (_labels == undefined){
            _labels = _classes ? _classes.map(v => parseFloat(v.toFixed(decimalP))) :
                Array.from(Array(_nBins).keys()).map(v => parseFloat((parseFloat(v) * parseFloat(delta) +
                    parseFloat(_range[0])).toFixed(decimalP)))
        }
        colors = (_colorPalette.length == _nBins) ? _colorPalette : _classes.map(l => String(_scale(l)))
        zipped = d3.zip(colors, _labels);

        // }
        let colorBarID = "colorbar_" + twoDDataName;

        var _colorbar = document.createElement('div');
        _colorbar.setAttribute("id",colorBarID );
        _colorbar.setAttribute("class",'div2dColorTab');
        _colorbar.innerText = _dynStyle.hasOwnProperty('title') ? _dynStyle.title : _config.name;
        // hideShowbutton = "<i id='hide2dLegend' class='fa fa-angle-right' style='size: 2em; left: -12px; position: inherit;'></i>";
        // _colorbar.appendChild(hideShowbutton);
        document.body.appendChild(_colorbar);

        var _colorbarTab = document.createElement('table');
        _colorbarTab.setAttribute("id",colorBarID );
        _colorbarTab.setAttribute("class",'parentTableColor');
        _colorbar.appendChild(_colorbarTab);

        var trColors = document.createElement("tr");
        trColors.setAttribute("id", "cols");
        trColors.setAttribute('class','legendColorStyle')
        _colorbarTab.appendChild(trColors);

        var trLabels = document.createElement("tr");
        trLabels.setAttribute("id", "labels");
        trLabels.setAttribute('class','legendColorLabels')
        _colorbarTab.appendChild(trLabels);

        zipped.forEach(element => {
            let td_color = document.createElement("td");
            td_color.style.background = String(element[0]);

            let td_label = document.createElement("td");
            let labelText = document.createTextNode(element[1]);
            td_label.appendChild(labelText);

            trColors.appendChild(td_color);
            trLabels.appendChild(td_label)


        });

        colorbar = document.getElementById('twodcolorbar');
        colorbar.style.display = 'inline-table';
        colorbar.append(_colorbar);
        twoDLegend[twoDDataName] = colorbar;
        // twoDLegend[twoDDataName].addTo(map);
    }
    function getColorbar() {

        let _data;
        let _subConfig = config.spatialData[twoDDataName];
        let dataType = _subConfig.dataType;
        let _dynStyle = _subConfig.dynStyle;
        let _colorPalette = _dynStyle.colorPalette;
        let _range = _dynStyle.range;
        let _classes = _dynStyle.classes;
        let _nBins = _classes.length;
        let _scale = chroma.scale(_colorPalette).domain(_range).classes(_classes);
        let colorBar = {};
        let defaultColorBar = {
            title: 'generic title',
            units: '(cm^3/cm^3)',
            steps: _classes ? _nBins : 4,
            decimals: _dynStyle.hasOwnProperty('decimalP') ? _dynStyle.decimalP : 0,
            width: 300,
            height: 20,
            position: 'bottomright',
            background: '#888888',
            textColor: '#ffffff',
            labels: _dynStyle.hasOwnProperty('classes') ? _dynStyle.classes : [],
            labelFontSize: 15,
            invalid: -9999
        };
        let defaultChromaSettings = {
            colorPalette: ['#fafa6e', '#2A4858'],
            nBins: 5,
            method: 'quantiles'
        };

        delta = parseFloat((_range[1] - _range[0]) / _nBins);
        if (_dynStyle.hasOwnProperty('labels')) {
            return _dynStyle.labels.length === _nBins ? _style.labels : _labels
        } else {
            decimalP = _dynStyle.hasOwnProperty('decimals') ? _dynStyle.decimals : defaultColorBar.decimals;
            _labels = _dynStyle.hasOwnProperty('classes') ? _classes.map(v => parseFloat(v.toFixed(decimalP))) :
                Array.from(_classes.keys()).map(v => parseFloat((v * delta + _range[0]).toFixed(decimalP)))
        }
        Object.keys(defaultColorBar).forEach(key => {
            if (key === 'labels') {

                colorBar[key] = _labels;

            } else {
                colorBar[key] = _dynStyle.hasOwnProperty(key) ? _dynStyle[key] : defaultColorBar[key];
            }
        });

        twoDLegend[twoDDataName] = L.control.colorBar(_scale, _range, colorBar);
        twoDLegend[twoDDataName].addTo(map);
    }

    // if (!twoDLegend.hasOwnProperty(twoDDataName)) getColorbar();
    if (!twoDLegend.hasOwnProperty(twoDDataName)) generateColorBar1();
    switch (dataType) {
        case 'binary':
            var myRequest = new Request(fn);
            fetch(myRequest).then(function (response) {
                return response.arrayBuffer();
            }).then(function (buffer) {
                let _data = new Float32Array(buffer);

                colorcodeGeomBin(_data, twoDDataName)
            });
            break;
        case 'csv':
            Papa.parse(fn,
                {
                    download: true,
                    header: false,
                    delimiter: ',',
                    skipEmptyLines: true,
                    complete: function (results) {
                        _data = results.data;
                        colorcodeGeomBin(_data, twoDDataName)
                    }
                }
            );
            break;
        default:
            break;
    }


}


function convertDTStr2Unix(vec) {
    if (vec.length === 1) {
        return moment(vec).unix()
    } else {
        return vec.map(str => moment(str).unix())
    }
}

let i;

function animateData() {
    let twoDDataName = systemState.timeSelector.activeTab.slice(4,);
    let _timeslider = document.getElementById('div_' + twoDDataName);
    let xRange = _timeslider.layout.xaxis.range;
    let ts_vec = _timeslider.data[0].x;

    function rangeSelect(ts) {
        return ts > xRange[0] && ts < xRange[1];
    }

    let str_vec = ts_vec.filter(rangeSelect);
    let time_vec = convertDTStr2Unix(str_vec);
    let _config = config.spatialData[twoDDataName];
    i = 0;
    playAnimation = true

    function animate() {
        if (i < time_vec.length) {
            i = i + 1;
            let fn = pathGeneratorGeneral(_config, time_vec[i]);
            colorcodeGeometry(fn, twoDDataName);
            updatedtPlaceholder(time_vec[i], twoDDataName)
            if (playAnimation) setTimeout(animate, 10);
            // Plotly.deleteTraces('div_Flow', [1])
        }
    }

    animate()


}

function startAnimation() {
    playAnimation = true;
    animateData()
}

function stopAnim() {
    playAnimation = false;
}

function nextFrame() {
    let twoDDataName = systemState.timeSelector.activeTab.slice(4,);
    let _timeslider = document.getElementById('div_' + twoDDataName);
    let xRange = _timeslider.layout.xaxis.range;
    let ts_vec = _timeslider.data[0].x;

    function rangeSelect(ts) {
        return ts > xRange[0] && ts < xRange[1];
    }

    let str_vec = ts_vec.filter(rangeSelect);
    let time_vec = convertDTStr2Unix(str_vec);
    let _config = config.spatialData[twoDDataName];
    playAnimation = false;
    i = i + 1;
    let fn = pathGeneratorGeneral(_config, time_vec[i]);
    colorcodeGeometry(fn, twoDDataName);
    updatedtPlaceholder(time_vec[i], twoDDataName)
}


function prevFrame() {
    let twoDDataName = systemState.timeSelector.activeTab.slice(4,);
    let _timeslider = document.getElementById('div_' + twoDDataName);
    let xRange = _timeslider.layout.xaxis.range;
    let ts_vec = _timeslider.data[0].x;

    function rangeSelect(ts) {
        return ts > xRange[0] && ts < xRange[1];
    }

    let str_vec = ts_vec.filter(rangeSelect);
    let time_vec = convertDTStr2Unix(str_vec);
    let _config = config.spatialData[twoDDataName];
    playAnimation = false;
    i = i - 1;
    let fn = pathGeneratorGeneral(_config, time_vec[i]);
    colorcodeGeometry(fn, twoDDataName);
    updatedtPlaceholder(time_vec[i], twoDDataName)
}


function updatedtPlaceholder(dt, twoDDataName) {
    let tab_dt_div = document.getElementById('div_' + twoDDataName + '_dt');
    tab_dt_div.innerHTML = "<p style='font-family: inherit'>" + moment.unix(dt).format('MMM DD YYYY HH:mm')+ "</p>";

}



    // Set effect from select menu value
$("#hide2dLegend").on("click", function () {
    var selectedEffect = 'slide';

// Most effect types need no options passed by default
    var options = {direction: "right"};

// Run the effect
    $("#twodcolorbar").hide(selectedEffect, options, 1000);
    this.hide()
    $("#show2dLegend").show()
});

$("#show2dLegend").on("click", function () {
    var selectedEffect = 'slide';

// Most effect types need no options passed by default
    var options = {direction: "right"};

// Run the effect
    $("#twodcolorbar").show('slide', {direction: "right"}, 1000);
    this.hide()
});