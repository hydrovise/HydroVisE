function initSpatialData() {
    function addTab(key) {
        var name = twoDConfig[key].name;
        let template = "<button class=\"tablinks\" onclick=\"open2DTab(event,\'" + key + "\')\">" + name + "</button>";
        let parentDIV = document.getElementById("twoDSelector");
        parentDIV.innerHTML += template
    }

    function addDIV(name) {
        div = document.getElementById("twoDSelector");

        div.innerHTML += template;
    }


    let twoDTimestamps = {};
    twoDConfig = config.spatialData;
    var TwoDTimeSliderTraces = {};
    var timeSynchedDivs = [];
    let twodslider = {};
    let divname;
    Object.keys(twoDConfig).forEach(key => {
        let subset = twoDConfig[key];
        // console.log(subset)
        $.ajax({
            url: subset.timestamps.fnPath,
            dataType: subset.timestamps.extension,
            async: false,
            success: function (data) {
                twoDTimestamps[key] = data.map(dt => moment.unix(dt).format('YYYY-MM-DD HH:mm'))
                addTab(key);

                // twoDTimestamps[key] = traceTemp;
                console.log(TwoDTimeSliderTraces)
                divname = 'div_' + key;


            }
        });
    });

// gd1 = document.getElementById('div_plot');
// timeSynchedDivs.push(gd1);
    var plotlyIterator = 0;
    Object.keys(config.spatialData).forEach(key => {
        var twoDimDIV = document.createElement("div");
        twoDimDIV.id = "div_" + key;
        twoDimDIV.className = 'tabcontent';
        let divSlider = document.getElementById('twoDSelector');
        divSlider.append(twoDimDIV);
        let tsVec = twoDTimestamps[key];
        let tsVec_y = tsVec.map(v => v = 1);
        var traceTemp = {
            name: key,
            x: tsVec,
            y: tsVec_y,
            type: 'bar',
            hoverinfo: 'x'
        };
        Plotly.newPlot(twoDimDIV, [traceTemp], config.timeSelectorLayout, {interactive: true, displayModeBar: false});
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
        plotlyIterator += 1;
    });
//


// console.log(twodslider)

// gd = document.getElementById(divname);
// timeSynchedDivs.push(gd);

// // CheckXRange(systemState.yr)
// // function relayout(ed, divs) {
// //     ed1 = {'xaxis.range[0]': ed["xaxis.range[0]"], 'xaxis.range[1]': ed["xaxis.range[1]"]};
// //     divs.forEach((div, i) => {
// //         if (div.layout != undefined) {
// //             let x = div.layout.xaxis;
// //             if (ed["xaxis.autorange"] && x.autorange) return;
// //             if (
// //                 x.range[0] != ed["xaxis.range[0]"] ||
// //                 x.range[1] != ed["xaxis.range[1]"]
// //             ) {
// //                 Plotly.relayout(div, ed1);
// //             }
// //         }
// //     });
// // }
// //
// // timeSynchedDivs.forEach(div => {
// //     if (div.layout !== undefined) {
// //         div.on("plotly_relayout", function (ed) {
// //             zoom_state = true;
// //             selectedRange = [ed["xaxis.range[0]"], ed["xaxis.range[1]"]];
// //             relayout(ed, timeSynchedDivs);
// //         });
// //     }
// // });
// //
// let div2D = document.getElementById(divname)
}


function colorcodeNetwork(fn) {
    var flow;
    Papa.parse(fn,
        {
            download: true,
            header: true,
            delimiter: ',',
            skipEmptyLines: true,
            complete: function (results) {
                flow = results.data;
                flow.forEach(f => leaflet_layers['flow'].setFeatureStyle(f['lid'], {
                    fillColor: 'red',
                    fillOpacity: 1,
                    stroke: true,
                    fill: true,
                    color: getColor(parseFloat(f['flow']) * 100),
                    opacity: 1,
                    width: parseFloat(f['flow']) * 100,
                }))
            }
        }
    );
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
    let _fnPath = _config.fnPath;
    let _ext = _config.extension;
    fn = _fnPath + '/' + String(unix_time) + _ext;
    let _style = _config.hasOwnProperty('style') ? _config.style : '';
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

        let _scale = chroma.scale(_colorPalette).domain(_range);
        twoDLegend = L.control.colorBar(_scale, _range, getColorbar(_range));
        twoDLegend.addTo(map);
        return bar
    }


    function getDynamicRange(data) {
        if (_style.hasOwnProperty('range')) {
            return _style.range;
        } else {
            let filtered = [];
            data.forEach(arr => filtered.push(arr.filter(v => v !== -9999)));
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
            // inFilter: (v) => v !== _style.hasOwnProperty('invalid') ? _style.invalid :defaultColorBar.invalid,
            inFilter: (v) => v !== -9999,
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
        colorcodeNetwork(fn)
    }

}