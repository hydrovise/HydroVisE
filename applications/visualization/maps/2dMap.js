function twoDMapPlotter(twoDDataName, unix_time) {
    let _config = config.spatialData[twoDDataName];
    let _style = _config.style;
    let _range = _style.range;
    let _colorPalette = _style.colorPalette;

    let scale = chroma.scale(_colorPalette).domain(_range);
    let _ts = moment.unix(unix_time).format(_style.dtFormat); //timestamp
    let _title = _config.name + moment.unix(unix_time).format('yyyy-MM-DD HH:mm');
    function addsmap_colorscale() {
        if (bar !== undefined) {
            bar.remove()
        }
        bar = L.control.colorBar(scale, _range, {
            title: _title,
            units: _config.units,
            steps: _style.nBins,
            decimals: _style.decimals,
            width: _style.width,
            height: _style.height,
            position: _style.position,
            background: _style.background,
            textColor: _style.textColor,
            labels: _style.labels,
            labelFontSize: _style.labelFontSize,
        }).addTo(map);
        return bar
    }

    function addRaster(){
        return d3.request(fn).responseType('arraybuffer').get(
            function (error, tiffData) {
                let geo = L.ScalarField.fromGeoTIFF(tiffData.response);
                var defaultBounds = map.getBounds();
                if (leaflet_layers[twoDDataName] !== undefined) {
                    leaflet_layers[twoDDataName].remove()
                }
                let geomLayers = L.canvasLayer.scalarField(geo, {
                    inFilter: (v) => v !== _style.invalid,
                    color: chroma.scale(_colorPalette).domain(_range, _style.nbins, _style.method ),
                    opacity: 1,
                    maxBounds: defaultBounds,
                    zoom: defaultBounds,
                    pane:twoDDataName
                });
                leaflet_layers[twoDDataName] = geomLayers;
                leaflet_layers[twoDDataName].addTo(map);
                layerGeo.on('click', function (e) {
                    if (e.value !== null) {
                        let v = e.value;
                        let html = (`<span class="popupText">` + _colorPalette + ` ${Math.round(v * 1000) / 1000}</span>`);
                        let popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent(html)
                            .openOn(map);
                    }
                });
                map.fitBounds(defaultBounds);
            })
    }

    if (!_config.hasOwnProperty('geom')){
        map.createPane(twoDDataName);
        addRaster()
    }
    else{
        if (leaflet_layers[twoDDataName]===undefined){
            initializeGeom(twoDDataName)
        }

    }
    addsmap_colorscale()
}