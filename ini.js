// Papa.parsePromise = function (file, config) {
//     return new Promise(function (complete, error) {
//         Papa.parse(file, config);
//     });
// };


function ini() {
    $(function () {
        if (!config.hasOwnProperty('timeSlider')) {
            $("#sliderMainDIV").remove();
            return;
        }

        function dynamicRange(v) {
            return v
        };

        if (config.timeSlider.hasOwnProperty('dynamicRange')) {
            is_dynamic = true;
            dynamicRange = new Function(config.timeSlider.dynamicRange.arguments, config.timeSlider.dynamicRange.body)
        }

        $("#slider").slider(
            {
                min: dynamicRange(config.timeSlider.min),
                max: dynamicRange(config.timeSlider.max),
                step: config.timeSlider.step,
                value: config.timeSlider.value,
                slide: function (ev, ui) {
                    let label = document.getElementById('sliderLabelDIV');
                    let f = new Function(config.timeSlider.label.arguments, config.timeSlider.label.body)
                    label.innerText = f(ui.value)
                },
                stop: function (evt, ui) {
                    systemState.sliderState = ui.value;
                    clearTraces('temporary');
                    addTraces('temporary');
                }
            }
        );
        document.getElementById("sliderMainDIV").style.display = 'block';
    });

    $("#sortable").sortable();
    $("#sortable").disableSelection();
    $("#sortable").on(
        "sortstop",
        function (event, ui) {
            updateLayerZIndex()
        }
    );

    function useCtrlContainer(cont_cond, cont_name) {
        if (cont_cond) {
            controlList.push(cont_name);
        } else {
            $("#" + cont_name).parent().remove()
        }
    }

    let controlList = []; //['markerAttrs', 'prod', 'baseMapType'];
    let attr_ctrl = config.hasOwnProperty('mapMarkers') && config.mapMarkers.hasOwnProperty('markerAttrs');
    let ensemble_ctrl = Object.keys(config.traces).find(
        v => {
            return config.traces[v].ensemble;
        }
    ) !== undefined;
    useCtrlContainer(attr_ctrl, 'markerAttrs');
    useCtrlContainer(ensemble_ctrl || attr_ctrl, 'prod');
    useCtrlContainer(true, 'baseMapType');

    for (let i = 0; i < controlList.length; i++) {
        let controlElem = controlList[i];
        let container = $("#{0}Options".format(controlElem));
        let lst_item = "<div class='baseMapTypeItem {4} {3}' data-value='{0}' onclick=\"{2}(this)\">{1}</div>";
        let use_config = config.controls[controlElem];
        Object.keys(use_config).forEach(
            key => {
                _selected = '';
                if (use_config[key].selected) {

                    systemState[controlElem] = use_config[key].var_id;
                    _selected = 'selected';
                }
                container.append(
                    lst_item.format(
                        use_config[key].var_id,
                        use_config[key].var_name,
                        use_config[key].onEvent,
                        _selected,
                        controlElem
                    )
                )

            }
        )
    }


    // create control map-inventory
    let container = $("#sortable");
    let lst_item = "<li id='li_{4}' class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span>" +
        "<input id='check_lid_{4}' type='checkbox' class='' onclick=\"{2}(this)\" value='{4}' data-type='static'><p class='key'>{1}</p></li>"
    let use_config = config.mapLayers;
    Object.keys(config.mapLayers).forEach(key => {
        container.append(
            lst_item.format(
                use_config[key].var_id,
                use_config[key].var_name,
                use_config[key].onEvent,
                use_config[key].selected ? "selected" : '',
                use_config[key].fn
            )
        );
        if (use_config[key].selected) {
            contextLayerLoader(use_config[key].fnPath,key);
            document
                .getElementById('check_lid_' + use_config[key].fn)
                .classList = 'checked';
            // console.log(checkbox)
            // checkbox.context.;
        } else {
            document
                .getElementById('check_lid_' + use_config[key].fn)
                .classList = 'unchecked';
        }
    });


    map = L.map(
        'map',
        {
            center: config.map.center,
            zoom: config.map.defaultZoom,
            maxZoom: config.map.maxZoom,
            minZoom: 4
            // renderer: L.svg()
        }
    );
    addCustBaseMap(config.customBaseMap);
    group = L.featureGroup().addTo(map);
    basemap = L.tileLayer(
        config.map.basemapList.default.url, {
            attribution: config.map.basemapList.default.attribution,
            subdomains: config.map.basemapList.default.subdomains
        }
    );

    basemap.addTo(map);
    map.getRenderer(map).options.padding = 0;

    var printer = L.easyPrint(
        {
            tileLayer: basemap,
            sizeModes: ['Current', 'A4Landscape', 'A4Portrait', 'A3Size'],
            filename: 'myMap',
            exportOnly: true,
            hideControlContainer: true
        }
    ).addTo(map);

    function manualPrint() {
        printer.printMap('CurrentSize', 'MyManualPrint')
    }

    var A3Size = {
        width: 8000,
        height: 5000,
        className: 'a3CssClass',
        tooltip: 'A custom A3 size'
    };


    if (config.map.hasOwnProperty('geoSearch')) {
        config.map.geoSearch ? addGeoSearch() : false
    }
    if (config.hasOwnProperty('mapMarkers')) {
        $.ajax({
            url: config.mapMarkers.fnPath,
            dataType: 'json',
            async: false,
            success: function (data) {
                mapMarkers = data;
                draw_markers(mapMarkers, config.mapMarkers.comIDName);
                if (config.mapMarkers.hasOwnProperty('markerAttrs')) {
                    Papa.parse(config.mapMarkers.markerAttrs.template.path_format, {
                        download: true,
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            markerAttrs = results['data'];

                            colorCodeMapMarkers(systemState.markerAttrs)
                        }
                    });
                }
            }
        });
    }


    var dropArea = document.getElementById('drop');
    dropArea.ondrop = fileUpload;
    dropArea.ondragover = function () {
        return false;
    };
    dropArea.ondragend = function () {
        return false;
    };

    document.getElementById('drop').addEventListener('change', fileUpload, false);

    if (config.hasOwnProperty('spatialData')) {
        var twodsliderDIV = document.createElement('div');
        twodsliderDIV.id = 'twoDSelector';
        twodsliderDIV.className = 'tab';
        twodsliderDIV.style = 'display:block;z-index: 3;';
        document.body.appendChild(twodsliderDIV);
        initSpatialData();
    }
    dragElement("mini_con0");
    dragElement("title_con0", "con0");


    if (config.hasOwnProperty('calcMetrics')) {
        metricDIV = document.getElementById('claculatemetricsButton');
        metricDIV.style.display = 'block';
    }

}