// // Deinition of interactive for leaflet layer
L.Layer.prototype.setInteractive = function (interactive) {
    if (this.getLayers) {
        this.getLayers().forEach(layer => {
            layer.setInteractive(interactive);
        });
        return;
    }
    if (!this._path) return;

    this.options.interactive = interactive;

    if (interactive) {
        L.DomUtil.addClass(this._path, 'leaflet-interactive');
    } else {
        L.DomUtil.removeClass(this._path, 'leaflet-interactive');
    }
};


function addbasinKML(kml_fn) {
    if (basin_shape !== undefined) map.removeLayer(basin_shape);
    basin_shape = new L.KML(
        kml_fn, {
            async: true
        }
    );
    basin_shape.on(
        "loaded",
        function (e) {
            basin_shape.setStyle({
                color: '#555555',
                fillColor: '#bcbcbc',
                'fillOpacity': 0.4
            });
            basin_shape.addTo(map);
            basin_shape.bringToBack();
            return basin_shape
        }
    );
}


function basemap_changer(_selected) {
    let controls = $(".baseMapTypeItem");
    controls.each(i => {
        $(controls[i]).removeClass('selected')
    });
    _sel = $(_selected);
    _sel.addClass('selected');
    BasemapName = _sel.data('value');
    // let attri, url = [];
    switch (BasemapName) {
        case 'light_all':
            url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
            attri = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>';
            break;
        case 'Toner':
            url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png';
            attri = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
            break;
        case 'Esri Imagery':
            url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            attri = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
            break;
        case 'Dark':
            url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            attri = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
            break;
        case 'Terrain':
            url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';
            attri = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }

    if (basemap != undefined) {
        map.removeLayer(basemap);
    }
    basemap = L.tileLayer(url, {
        attribution: attri,
        subdomains: 'abcd'
    });

    basemap.addTo(map);
    cur_basemap = BasemapName;
}


//TODO: Layer ordering
// $("#sortable").on("sortupdate", function(event, ui) {
//     group.setZIndex(listLength-$('#li1').index()+2);
//     riverLayer.setZIndex(listLength-$('#li2').index()+2);
// });

function addCustBaseMap(src) {
    if (!config.hasOwnProperty("customBaseMap")) return;
    var tempColor;
    $.getJSON(src.url, function (data) {
        map.createPane('customBaseMap');
        leaflet_layers['customBaseMap'] = L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    let p = properties[src.propoertyName];
                    tempColor = src.colors.hasOwnProperty(p) ? src.colors[p] : src.colors.default;
                    return {
                        color: tempColor,
                        fillOpacity: 0.5,
                        //fillOpacity: 1,
                        stroke: true,
                        fill: true,
                        fillColor: 'black',
                        //opacity: 0.2,
                        weight: p / 3,
                    }
                }

            },
            pane: 'customBaseMap'
        }).addTo(map);
        let lst_item = "<li id='li_customBaseMap' class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input type='checkbox' onclick=\"toggLyrStd(this)\" value='customBaseMap'" +
            " data-type='static' class='input checked'><p class='key'>" + src.name + "</p></li>";
        var ctxLayerLegend = document.getElementById("sortable");
        ctxLayerLegend.innerHTML += lst_item;
        config.mapLayers['customBaseMap'] = {fn: 'customBaseMap'};
        updateLayerZIndex()
    });
}


function toggDiv(a) {
    _switch = {'block': 'none', 'none': 'block'};
    _elm = $('#con' + a);
    _elm_mini = $('#mini_con' + a);
    _elm.css('display', _switch[_elm.css('display')]);
    _elm_mini.css('display', _switch[_elm_mini.css('display')]);
}

let kmzload = function (fn_path, fn) {
//         var layerID;
    let kmzParser = new L.KMZParser({
        async: false,
        onKMZLoaded: function (layer, name) {
            layer.addTo(map);
            layer.setStyle({'fillOpacity': 0.1});
            layer.setInteractive(false);
            layer.pane = fn;
            leaflet_layers[fn] = [];
            leaflet_layers[fn] = layer;
        }
    });
    kmzParser.load(fn_path);
};

//TODO: KML file name should not start with numbers / check what is going on in KML file because mostly it takes long time
function contextLayerLoader(fnPath,key) {

    let style = config.mapLayers[key].hasOwnProperty('style')? config.mapLayers[key].style : {
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        fill: true,
        fillColor: 'white',
        weight: 1,
        radius:4
    };

    let fn = fnPath.replace(/^.*[\\\/]/, '')
        .replace('.gz', '');
    let ext = fn.split('.').pop();

    switch (ext) {
        case 'kmz':
            kmzload(fnPath, fn);
            break;
        case 'kml':
            let layer = new L.KML(fnPath, {async: true});
            geojson = toGeoJSON.kml(kml);
            layer.on("loaded", function (e) {
                map.addLayer(layer);
                layer.setStyle({color: '#555555', fillColor: '#bcbcbc', 'fillOpacity': 0.1});
                layer.setInteractive(false);
                layer.setZIndex(0);
                layer.pane = fn;
                leaflet_layers[fn] = [];
                leaflet_layers[fn] = layer;
            });
            break;
        case 'geojson':
            $.ajax({
                dataType: "json",
                url: fnPath,
                success: function (data) {
                    map.createPane(fn);
                    var tileLayer = L.vectorGrid.slicer(data, {
                        rendererFactory: L.svg.tile,
                        vectorTileLayerStyles: {
                            sliced: function (properties, zoom) {
                                let p = properties.h_order;
                                return style
                            }
                        },
                        pane: fn
                    }).addTo(map);
                    leaflet_layers[fn] = tileLayer;
                    tileLayer.bringToFront();
                    updateLayerZIndex()
                }
            });
            break;
    }

}


function loadTileLayer(layer, map, fn) {

    let tileLayer = L.vectorGrid.slicer(layer, {
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            sliced: {
                color: randomColor(),
                fillOpacity: 0.1,
                //fillOpacity: 1,
                stroke: true,
                fill: false,
                weight: 2,
            }
        },
        maxZoom: 22,
        indexMaxZoom: 5,       // max zoom in the initial tile index
        interactive: false
    });
    map.addLayer(tileLayer);
    tileLayer.bringToFront();
    leaflet_layers[fn] = tileLayer;
}

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color
}


function GetElementInsideContainer(containerID, childID) {
    let elm = {};
    let elms = document.getElementById(containerID).getElementsByTagName("*");
    for (let i = 0; i < elms.length; i++) {
        if (elms[i].id === childID) {
            elm = elms[i];
            break;
        }
    }
    return elm;
}

// TODO : File Upload data types
function fileUpload(evt) {
    function humanFileSize(size) {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return Math.round(100 * (size / Math.pow(1024, i))) / 100 + ' ' + ['B', 'kB', 'MB', 'GB'][i];
    }

    var files = evt.target.files; // FileList object e.dataTransfer.files[0];
    for (var i = 0, fObject; fObject = files[i]; i++) {
        let fn = fObject.name;
        try {
            let ext = fn.split('.').pop();
            if (ext === 'kml' || ext === 'geojson' || ext === 'kmz') {
                let reader = new FileReader();
                let layer;
                reader.readAsText(fObject);
                reader.onload = function (event) {
                    dropArea.innerHTML += " " + elapsed + "ms";
                    switch (ext) {
                        case 'geojson':
                            layer_GeoJSON = JSON.parse(event.target.result);
                            loadTileLayer(layer_GeoJSON, map, fn);
                            break;
                        case 'kml':
                            var kml = new DOMParser().parseFromString(event.target.result, 'text/xml');
                            layer_kml = toGeoJSON.kml(kml);
                            loadTileLayer(layer_kml, map, fn);
                            break;
                        case 'kmz':
                            var kmzParser1 = new L.KMZParser({
                                onKMZLoaded: function (layerKMZ, name) {
                                    layerKMZ.addTo(map);
                                }
                            });
                            kmzParser1.load(event.target.result);
                            break;
                    }
                }
            } else if (ext === 'tif') {
                let reader = new FileReader();
                let fObject = evt.target.files[0];
                let fn = fObject.name;
                reader.readAsArrayBuffer(fObject)
                reader.onload = function (event) {
                    let geo = L.ScalarField.fromGeoTIFF(event.srcElement.result)
                    let defaultBounds = map.getBounds();
                    let bar = L.control.colorBar();
                    let defaultColorBar = {
                        title: '',
                        units: '',
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

                    if (layerGeo !== undefined) {
                        map.removeLayer(layerGeo);
                    }

                    function getDynamicRange(data) {
                            let filtered = [];
                            data.forEach(arr => filtered.push(arr.filter(v => v > -9999)));
                            return [math.min(filtered), math.max(filtered)]
                    }
                    function getColorbar(_range) {
                        let colorBar = {};
                        let delta = parseFloat((_range[1] - _range[0]) / 5);
                        let decimalP = defaultColorBar.decimals;
                        let _labels = Array.from(Array(defaultChromaSettings.nBins).keys()).map(v => parseFloat((v * delta + _range[0]).toFixed(decimalP)))
                        Object.keys(defaultColorBar).forEach(key => {
                            if (key === 'labels') {

                                colorBar[key] = _labels;

                            } else {
                                colorBar[key] = defaultColorBar[key];
                            }
                        });
                        return colorBar
                    }
                    let _range = getDynamicRange(geo.grid);
                    let _scale = chroma.scale(defaultChromaSettings.colorPalette).domain(_range, defaultChromaSettings.nBins, defaultChromaSettings.method);
                    function addColorscale(_range) {
                        if (twoDLegend !== undefined) {
                            twoDLegend.remove()
                        }


                        twoDLegend = L.control.colorBar(_scale, _range, getColorbar(_range));
                        twoDLegend.addTo(map);
                        return bar
                    }

                    var layerGeo = L.canvasLayer.scalarField(geo, {
                        inFilter: (v) => v !== -9999,
                        color: _scale,
                        opacity: 1,
                        maxBounds: defaultBounds,
                        zoom: defaultBounds
                    });
                    layerGeo.addTo(map);
                    map.addLayer(layerGeo)
                    addColorscale(_range);

                    layerGeo.on('click', function (e) {
                        if (e.value !== null) {
                            let v = e.value;
                            let html = (`<span class="popupText">value : ${Math.round(v * 1000) / 1000}</span>`);
                            let popup = L.popup()
                                .setLatLng(e.latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });
                    leaflet_layers[fn] = [];
                    leaflet_layers[fn] = layerGeo;
                    map.fitBounds(defaultBounds);
                }
            }
            var ctxLayerLegend = document.getElementById("sortable");
            ctxLayerLegend.innerHTML +=
                "<li id='li_" + String(fn) + "' class='ui-state-default ui-sortable-handle'>" +
                "<input type='checkbox' checked='true' style='background-color: rgb(175, 193, 126);' data-type='fileUpload' onClick='toggLyrStd(this);' value='" + String(fn) + "'>" +
                "<p class='key'>" + String(fn) + "</p>" + "</li>";
            idxStandard = Math.round(Math.random() * 10000);
            standard[fn] = {"var_id": fn};
        } catch (err) {
            console.log(err)
        }
        return false;
    }
}


function addGeoSearch() {
    let options = {
        collapsed: true, /* Whether its collapsed or not */
        position: 'bottomleft', /* The position of the control */
    };
    let osmGeocoder = new L.Control.OSMGeocoder(options);
    map.addControl(osmGeocoder);
}