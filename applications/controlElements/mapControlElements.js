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

    // map.addLayer(basin_shape);


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
    // console.log(attri)
    if (basemap!=undefined){
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

function addCustBaseMap(src){

    if (!config.hasOwnProperty("customBaseMap")) return;
    var tempColor;
    $.getJSON(src.url, function (data) {
        map.createPane('customBaseMap');
        leaflet_layers['customBaseMap'] = L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    // console.log(properties)
                    let p = properties[src.propoertyName];
                    tempColor =  src.colors.hasOwnProperty(p) ?  src.colors[p] : src.colors.default;
                    // console.log(tempColor,p)
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
            " data-type='static' class='input checked'><p class='key'>" + src.name +"</p></li>";
        var ctxLayerLegend = document.getElementById("sortable");
        ctxLayerLegend.innerHTML += lst_item;

        config.mapLayers['customBaseMap'] = {fn:'customBaseMap'};
        updateLayerZIndex()
        // tileLayer.bringToFront()
    });
}


function toggDiv(a) {
    _switch = {'block': 'none', 'none': 'block'};
    _elm = $('#con' + a);
    _elm_mini = $('#mini_con' + a);
    _elm.css('display', _switch[_elm.css('display')]);
    _elm_mini.css('display', _switch[_elm_mini.css('display')]);
}

// function toggLyrStd(e) {
//     let is_checked = e.checked;
//     let lyr_id = e.value;
//     let sel = $(e);
//     let fn = lyr_id;
//
//     if (!(is_checked)) {
//         sel.css("background-color", "");
//         leaflet_layers[fn].remove()
//
//     } else {
//         sel.css("background-color", '#2d4e45'); //"#359AFF");
//         $.each(
//             $('#con0').find("input[type='checkbox']:checked"),
//             function (ix, ele) {
//                 if (ele.value != sel[0].value) $(ele).css("background-color", 'rgb(175, 193, 126)');
//             }
//         );
//         if (leaflet_layers[fn] === undefined) {
//             contextLayerLoader(fn)
//         } else {
//             leaflet_layers[fn].addTo(map)
//         }
//     }
// }



let kmzload = function (fn_path, fn) {
//         var layerID;
    let kmzParser = new L.KMZParser({
        async: false,
        onKMZLoaded: function (layer, name) {
//             control.addOverlay(layer, name);
            layer.addTo(map);
            layer.setStyle({'fillOpacity': 0.1});
            layer.setInteractive(false);
            layer.pane = fn;
            leaflet_layers[fn] = [];
            leaflet_layers[fn] = layer;

            // layer.setZIndex(2);
        }
    });
    kmzParser.load(fn_path);
};

//TODO: KML file name should not start with numbers / check what is going on in KML file because mostly it takes long time
function contextLayerLoader(fnPath) {
    //function style() {
    //    return {
    //        fillOpacity: 1,
    //        stroke: true,
    //        color:'black',
    //        fill: true,
    //        fillColor: 'white',
    //        weight: 1,
    //    }
    //}
    
    let style = {
        fillOpacity: 1,
        stroke: true,
        color:'black',
        fill: true,
        fillColor: 'white',
        weight: 1,
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
                    // add GeoJSON layer to the map once the file is loaded
                    // rvr_net = L.geoJson(data);
                    // console.log(data);
                    //TODO: check why tile for points cut some of the points
                    map.createPane(fn);
                    var tileLayer = L.vectorGrid.slicer(data, {
                        rendererFactory: L.svg.tile,
                        vectorTileLayerStyles: {
                            sliced: function (properties, zoom) {
                                let p = properties.h_order;
                                return style
                                //return style()
                            }
                        },
                        pane:fn
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
    // console.log(tileLayer)
    leaflet_layers[fn] = tileLayer;
}

function evnt_onDrop (e) {
    // -- helper from viz.js test of geojson-vt
    function humanFileSize(size) {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return Math.round(100 * (size / Math.pow(1024, i))) / 100 + ' ' + ['B', 'kB', 'MB', 'GB'][i];
    }
    console.log(e)
    let fObject = e.dataTransfer.files[0];
    let fn = fObject.name;
    try {
        let ext = fn.split('.').pop();
        if (ext === 'kml' || ext === 'geojson' || ext === 'kmz') {
            let reader = new FileReader();
            let layer;
            reader.readAsText(fObject);
            // reader.readAsArrayBuffer(e.dataTransfer.files[0])
            dropArea.innerHTML = "<br/>";
            dropArea.innerHTML += "<br/><p>Loading... " + e.dataTransfer.files[0].name.toString() + "</p>";
            let start = new Date().getTime();
            reader.onload = function (event) {
                dropArea.innerHTML += "<br/>&nbsp;Parsing... " + humanFileSize(event.target.result.length);
                start = new Date().getTime();
                var elapsed = new Date().setTime(new Date().getTime() - start);
                dropArea.innerHTML += " " + elapsed + "ms";
                switch (ext) {
                    case 'geojson':
                        console.log(event.target.result);
                        layer_GeoJSON = JSON.parse(event.target.result);
//                     console.log(kmz)
                        loadTileLayer(layer_GeoJSON, map, fn);
                        document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
                        break;
                    case 'kml':
                        var kml = new DOMParser().parseFromString(event.target.result, 'text/xml');
//                     layer  = L.KML.parseKML(kml)[0]
//                         console.log(kml)
                        layer_kml = toGeoJSON.kml(kml);
                        // L.KML(kml)
                        loadTileLayer(layer_kml, map, fn);
//                     layer.addTo(map)
                        document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
                        break;
                    case 'kmz':
//                             var kmzParser1 = new L.KMZParser({
//                                 onKMZLoaded: function (layerKMZ, name) {
//                                     // control.addOverlay(layer, name);
//                                     layerKMZ.addTo(map);
//                                 }
//                             });
// //                         console.log(event.srcElement.result)
//                             kmzParser1.load(event.target.result);
                        alert('KMZ drag & drop functionality is under development')
                        break;
                }
            }
        } else if (ext === 'tif') {
            let reader = new FileReader();
            let fObject = e.dataTransfer.files[0];
            let fn = fObject.name;
            reader.readAsArrayBuffer(fObject)
            dropArea.innerHTML += "<br/>";
            dropArea.innerHTML += "<br/>Loading... " + fn.toString();
            let start = new Date().getTime();
            reader.onload = function (event) {
                dropArea.innerHTML += "<br/>&nbsp;Parsing... " + humanFileSize(event.target.result.length);
                start = new Date().getTime();

                let elapsed = new Date().setTime(new Date().getTime() - start);
                dropArea.innerHTML += " " + elapsed + "ms";
                let geo = L.ScalarField.fromGeoTIFF(event.srcElement.result)
                let defaultBounds = map.getBounds();

                if (layerGeo !== undefined) {
                    map.removeLayer(layerGeo);
                }
//                 map.removeLayer(layerGeo);
                var layerGeo = L.canvasLayer.scalarField(geo, {
                    inFilter: (v) => v !== -9999,
                    color: chroma.scale('YlGnBu').domain([0, 0.5], 5, 'quantiles'),
                    opacity: 1,
                    maxBounds: defaultBounds,
                    zoom: defaultBounds
                });

                map.addLayer(layerGeo)
                layerGeo.on('click', function (e) {
                    if (e.value !== null) {
                        let v = e.value;
                        let html = (`<span class="popupText">Soil Moisture ${Math.round(v * 1000) / 1000}</span>`);
                        let popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent(html)
                            .openOn(map);
                    }
                });
                leaflet_layers[fn] = [];
                leaflet_layers[fn] = layerGeo;
                map.fitBounds(defaultBounds);
                // loader.hide();
                addsmap_colorscale(fn.split('.')[0]);

                document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
//                 console.log(GeoTIFF.parse(e.dataTransfer.files[0]))
            }
        }
        var ctxLayerLegend = document.getElementById("con0").getElementsByClassName("legend")[0];
        ctxLayerLegend.innerHTML +=
            "<input type='checkbox' onClick='toggLyrStd(this);' value='" + fn + "'>" +
            "<p class='key'>" + String(fn) + "</p><br>"
    } catch (err) {
        dropArea.innerHTML += "<br/>&nbsp;Error: " + err;
        console.log(err)
    }

    e.preventDefault();
    return false;

};


function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color
}


function GetElementInsideContainer(containerID, childID) {
    var elm = {};
    var elms = document.getElementById(containerID).getElementsByTagName("*");
    for (var i = 0; i < elms.length; i++) {
        if (elms[i].id === childID) {
            elm = elms[i];
            break;
        }
    }
    return elm;
}

function handleFileSelect(evt) {
    function humanFileSize(size) {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return Math.round(100 * (size / Math.pow(1024, i))) / 100 + ' ' + ['B', 'kB', 'MB', 'GB'][i];
    }
    var files = evt.target.files; // FileList object e.dataTransfer.files[0];
    console.log(files);
    for (var i = 0, fObject; fObject = files[i]; i++) {

        console.log(fObject, fObject.name)
//         console.log(e)
//     let fObject = f
        let fn = fObject.name;
        try {
            let ext = fn.split('.').pop();
            if (ext === 'kml' || ext === 'geojson' || ext === 'kmz') {
                let reader = new FileReader();
                let layer;
                reader.readAsText(fObject);
                // reader.readAsArrayBuffer(e.dataTransfer.files[0])
                dropArea.innerHTML = "<br/>";
                dropArea.innerHTML += "<br/><p>Loading... " + fn.toString() + "</p>";
                let start = new Date().getTime();
                reader.onload = function (event) {
                    dropArea.innerHTML += "<br/>&nbsp;Parsing... " + humanFileSize(event.target.result.length);
                    start = new Date().getTime();
                    var elapsed = new Date().setTime(new Date().getTime() - start);
                    dropArea.innerHTML += " " + elapsed + "ms";
                    switch (ext) {
                        case 'geojson':
                            console.log(event.target.result);
                            layer_GeoJSON = JSON.parse(event.target.result);
//                     console.log(kmz)
                            loadTileLayer(layer_GeoJSON, map, fn);
                            document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
                            break;
                        case 'kml':
                            var kml = new DOMParser().parseFromString(event.target.result, 'text/xml');
//                     layer  = L.KML.parseKML(kml)[0]
//                         console.log(kml)
                            layer_kml = toGeoJSON.kml(kml);
                            loadTileLayer(layer_kml, map, fn);
//                     layer.addTo(map)
                            document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
                            break;
                        case 'kmz':
//                             var kmzParser1 = new L.KMZParser({
//                                 onKMZLoaded: function (layerKMZ, name) {
//                                     // control.addOverlay(layer, name);
//                                     layerKMZ.addTo(map);
//                                 }
//                             });
// //                         console.log(event.srcElement.result)
//                             kmzParser1.load(event.target.result);
                            alert('KMZ drag & drop functionality is under development')
                            break;
                    }
                }
            } else if (ext === 'tif') {


                let reader = new FileReader();
                let fObject = evt.target.files[0];
                let fn = fObject.name;
                reader.readAsArrayBuffer(fObject)
                dropArea.innerHTML += "<br/>";
                dropArea.innerHTML += "<br/>Loading... " + fn.toString();
                let start = new Date().getTime();
                reader.onload = function (event) {
                    dropArea.innerHTML += "<br/>&nbsp;Parsing... " + humanFileSize(event.target.result.length);
                    start = new Date().getTime();

                    let elapsed = new Date().setTime(new Date().getTime() - start);
                    dropArea.innerHTML += " " + elapsed + "ms";
                    let geo = L.ScalarField.fromGeoTIFF(event.srcElement.result)
                    let defaultBounds = map.getBounds();

                    if (layerGeo !== undefined) {
                        map.removeLayer(layerGeo);
                    }
//                 map.removeLayer(layerGeo);
                    var layerGeo = L.canvasLayer.scalarField(geo, {
                        inFilter: (v) => v !== -9999,
                        color: chroma.scale('YlGnBu').domain([0, 0.5], 5, 'quantiles'),
                        opacity: 1,
                        maxBounds: defaultBounds,
                        zoom: defaultBounds
                    });
                    // console.log(layerGeo)
                    layerGeo.addTo(map);
                    map.addLayer(layerGeo)
                    layerGeo.on('click', function (e) {
                        if (e.value !== null) {
                            let v = e.value;
                            let html = (`<span class="popupText">Soil Moisture ${Math.round(v * 1000) / 1000}</span>`);
                            let popup = L.popup()
                                .setLatLng(e.latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });
                    leaflet_layers[fn] = [];
                    leaflet_layers[fn] = layerGeo;
                    map.fitBounds(defaultBounds);
                    // loader.hide();
                    addsmap_colorscale(fn.split('.')[0]);

                    document.getElementById("drop").innerHTML = "<b>Drop WGS84 Vector GeoJSON, KML or Raster GeoTIFF here</b>";
//                 console.log(GeoTIFF.parse(e.dataTransfer.files[0]))
                }
            }
            var ctxLayerLegend = document.getElementById("sortable");
            // var ctxLayerLegend = document.getElementById("con0").getElementsByClassName("legend")[0];
            ctxLayerLegend.innerHTML +=
                "<li class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span>" +
                "<input type='checkbox' onClick='toggLyrStd(this);' value='" + fn + "'>" +
                "<p class='key'>" + String(fn) + "</p>"  + "</li>";
            idxStandard = Math.round(Math.random()*10000);
            standard[fn] = {"fname": fn};
            // standard[idxStandard]["fname"] = fn;


        } catch (err) {
            dropArea.innerHTML += "<br/>&nbsp;Error: " + err;
            console.log(err)
        }

//     evt.preventDefault();
        return false;
    }
}


function addGeoSearch(){

    let options = {
        collapsed: true, /* Whether its collapsed or not */
        position: 'bottomleft', /* The position of the control */
    };
    let osmGeocoder = new L.Control.OSMGeocoder(options);
    map.addControl(osmGeocoder);
}