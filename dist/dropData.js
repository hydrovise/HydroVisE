var dropArea = document.getElementById('drop');

dropArea.ondragover = function () {
    return false;
};
dropArea.ondragend = function () {
    return false;
};


function loadTileLayer(layer, map, fn) {

    let tileLayer = L.vectorGrid.slicer(layer, {
        rendererFactory: L.canvas.tile,
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
    }).addTo(map);
    // console.log(tileLayer)
    leaflet_layers[fn] = tileLayer;
    tileLayer.bringToFront()

}

dropArea.ondrop = function (e) {
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

                layerGeo.addTo(map);
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

                layerGeo.addTo(map);
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
                    "<p class='key'>" + String(fn) + "</p>"
    } catch (err) {
        dropArea.innerHTML += "<br/>&nbsp;Error: " + err;
        console.log(err)
    }

//     evt.preventDefault();
    return false;
    }   
}
document.getElementById('drop').addEventListener('change', handleFileSelect, false);