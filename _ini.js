Papa.parsePromise = function (file, config) {
    return new Promise(function (complete, error) {
        Papa.parse(file, config);
    });
};


function ini() {
    $(function () {
        if (!config.hasOwnProperty('timeSlider')) {
            $("#sliderMainDIV").remove();
            return;
        }

        $("#slider").slider(
            {
                min: config.timeSlider.min,
                max: config.timeSlider.max,
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

    function useCtrlContainer(cont_cond, cont_name){
        if (cont_cond){
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
    ) == undefined ? false : true;
    useCtrlContainer(attr_ctrl,'markerAttrs');
    useCtrlContainer(ensemble_ctrl || attr_ctrl,'prod')
    useCtrlContainer(true,'baseMapType')

    for (let i = 0; i < controlList.length; i++) {
        let controlElem = controlList[i];
        let container = $("#{0}Options".format(controlElem));
        let lst_item = "<div class='baseMapTypeItem {4} {3}' data-value='{0}' onclick=\"{2}(this)\">{1}</div>";
        let use_config = config.controls[controlElem];
        Object.keys(use_config).forEach(
            key => {
                _selected = '';
                if (use_config[key].selected) {
                    console.log(controlElem, key, use_config[key].selected, systemState[controlElem])
                    systemState[controlElem] = use_config[key].var_id;
                    _selected = 'selected';
                };
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
        "<input type='checkbox' onclick=\"{2}(this)\" value='{4}' data-type='static'><p class='key'>{1}</p></li>"
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
        )
    });


    map = L.map(
        'map',
        {
            center: config.map.center,
            zoom: config.map.defaultZoom,
            maxZoom: config.map.maxZoom
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

    /*
            load_pts = config.point_data_config.pList1.root + "/" +
            config.point_data_config.pList1.subfolder + "/" +
            config.point_data_config.pList1.fn +
            config.point_data_config.pList1.extension
    */
    if (config.hasOwnProperty('mapMarkers')) {
        $.ajax({
            url: config.mapMarkers.fnPath,
            dataType: 'json',
            async: false,
            success: function (data) {
                mapMarkers = data;
                draw_markers(mapMarkers, config.mapMarkers.comIDName)
                if (config.mapMarkers.hasOwnProperty('markerAttrs')) {
                    Papa.parse(config.mapMarkers.markerAttrs.template.path_format, {
                        download: true,
                        header: true,
                        skipEmptyLines:true,
                        complete: function (results) {
                            markerAttrs = results['data'];
                            leaflet_layers['mapMarkers'].eachLayer( layer=> {
                                _comID = layer.feature.properties[comIDName]
                                filtered = markerAttrs.filter(f => f[comIDName]== _comID &
                                    f['Year'] == systemState.yr & f['ET'] == systemState.prod)
                                console.log(filtered)
                                console.log(layer)
                                attr = systemState.markerAttrs.toLocaleLowerCase();
                                Object.keys(config.controls.markerAttrs).forEach(k => {
                                    attrName = config.controls.markerAttrs[k].var_id;
                                    layer.feature.properties[attrName] = filtered[0][attrName];
                                    }
                                );
                                layer.options.fillColor = vColor(attr, filtered[0][systemState.markerAttrs]);
                                layer.options.fillOpacity = 1;
                            });
                            leaflet_layers['mapMarkers'].remove();
                            leaflet_layers['mapMarkers'].addTo(map)
                            generateColorBar(attr)
                        }
                    });
                }
            }
        });
    }


    var dropArea = document.getElementById('drop');
    dropArea.ondrop = evnt_onDrop;
    dropArea.ondragover = function () {
        return false;
    };
    dropArea.ondragend = function () {
        return false;
    };

    document.getElementById('drop').addEventListener('change', handleFileSelect, false);


    //TODO: setup and finalize system state initialization based on the user-defined configurations
    // Dicuss this matter with Radek

    if (config.hasOwnProperty('spatialData')) {
        var twodsliderDIV = document.createElement('div');
        twodsliderDIV.id = 'twoDSelector';
        twodsliderDIV.className = 'tab';
        twodsliderDIV.style = 'display:block;z-index: 3;';
        document.body.appendChild(twodsliderDIV);
        initSpatialData();
        repeting_releyout = false;
        document.getElementById(systemState.timeSelector.activeTab).on("plotly_relayout", function (ed) {
            syncPlots(ed, "div_plot");
        });
    }
    dragElement("mini_con0");
    dragElement("title_con0", "con0");
    //dragElement("con0");
}