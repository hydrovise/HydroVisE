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

    // create control elements
    let controlList = ['markerAttrs', 'prod', 'baseMapType'];
    for (let i = 0; i < controlList.length; i++) {
        let controlElem = controlList[i];
        let container = $("#{0}Options".format(controlElem));
        let lst_item = "<div class='baseMapTypeItem {4} {3}' data-value='{0}' onclick=\"{2}(this)\">{1}</div>";
        let use_config = config.controls[controlElem];
        Object.keys(use_config).forEach(
            key => {
                _selected = '';
                if (use_config[key].selected){
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
    if (config.hasOwnProperty('mapMarkers')){
        $.ajax({
            url: config.mapMarkers.fnPath,
            dataType: 'json',
            async: false,
            success: function (data) {
                mapMarkers = data;
                // if (config.mapMarker.hasOwnProperty('markerAttrs')) {
                //     Papa.parse(
                //         config.mapMarker.markerAttrs,
                //         {
                //             download: true,
                //             header: true,
                //             dynamicTyping: false,
                //             complete: function (results) {
                //                 markerAttrs = results.data;
                //             }
                //         }
                //     );
                // }
                draw_markers(mapMarkers, config.mapMarkers.comIDName)
            }
        });

    }

    let kml_src = 'http://s-iihr50.iihr.uiowa.edu/smap/retro/data/';


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

    // let TwoDTimestamps = {};
    // twoDConfig = config.spatialData;
    //
    // function addTab(key) {
    //     var name = twoDConfig[key].name;
    //     let template = "<button class=\"tablinks\" onclick=\"open2DTab(event,\'" + key + "\')\">" + name + "</button>";
    //     let parentDIV = document.getElementById("twoDSelector");
    //     parentDIV.innerHTML += template
    // }
    //
    //
    // Object.keys(twoDConfig).forEach(key => {
    //     let subset = twoDConfig[key];
    //     console.log(subset)
    //     $.ajax({
    //         url: subset.timestamps.fnPath,
    //         dataType: subset.timestamps.extension,
    //         async: false,
    //         success: function (data) {
    //             TwoDTimestamps[key] = data.map(dt => moment.unix(dt).format('YYYY-MM-DD HH:mm'))
    //             addTab(key);
    //         }
    //     });
    // });
    //
    // var TwoDTimeSliderTraces = [];
    // var timeSynchedDivs = [];
    // gd1 = document.getElementById('div_plot');
    // timeSynchedDivs.push(gd1);
    // Object.keys(TwoDTimestamps).forEach(key => {
    //     let tsVec = TwoDTimestamps[key];
    //     let tsVec_y = tsVec.map(v => v = 1);
    //     var traceTemp = {
    //         name: key,
    //         x: tsVec,
    //         y: tsVec_y,
    //         type: 'bar',
    //         hoverinfo: 'x'
    //     };
    //     TwoDTimeSliderTraces.push(traceTemp);
    //     let divname = 'div_' + key;
    //     twodslider = Plotly.newPlot(divname, traceTemp, config.timeSelectorLayout, {
    //         displayModeBar: false,
    //         responsive: true
    //     });
    //
    //     gd = document.getElementById(divname);
    //     timeSynchedDivs.push(gd);
    // });
    // dragLayer = document.getElementsByClassName('nsewdrag')[0];
    //
    // function relayout(ed, divs) {
    //     ed1 = {'xaxis.range[0]': ed["xaxis.range[0]"], 'xaxis.range[1]': ed["xaxis.range[1]"]};
    //     divs.forEach((div, i) => {
    //         if (div.layout != undefined) {
    //             let x = div.layout.xaxis;
    //             if (ed["xaxis.autorange"] && x.autorange) return;
    //             if (
    //                 x.range[0] != ed["xaxis.range[0]"] ||
    //                 x.range[1] != ed["xaxis.range[1]"]
    //             ) {
    //                 Plotly.relayout(div, ed1);
    //             }
    //         }
    //     });
    // }
    //
    // timeSynchedDivs.forEach(div => {
    //     if (div.layout !== undefined) {
    //         div.on("plotly_relayout", function (ed) {
    //             zoom_state = true;
    //             selectedRange = [ed["xaxis.range[0]"], ed["xaxis.range[1]"]];
    //             relayout(ed, timeSynchedDivs);
    //         });
    //     }
    // });
    //
    // gd.on('plotly_hover', function (data) {
    //     dragLayer.style.cursor = 'pointer'
    // });
    //
    // gd.on('plotly_unhover', function (data) {
    //     dragLayer.style.cursor = '';
    // });
    //
    // gd.on('plotly_click', function (data) {
    //     datasetName = data.points[0].data.name;
    //     dt = data.points[0].x;
    //     dt_unix = moment(dt).format('X');
    //     twoDMapPlotter(datasetName, dt_unix)
    // });

}