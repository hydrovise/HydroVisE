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
    map.removeLayer(basemap);
    basemap = L.tileLayer(url, {
        attribution: attri,
        subdomains: 'abcd'
    });

    basemap.addTo(map);
    cur_basemap = BasemapName;
}

function select_sim_type(_selected) { //sim_type) {
    let controls = $(".simTypeItem");
    controls.each(i => {
        $(controls[i]).removeClass('selected')
    });
    _sel = $(_selected);
    _sel.addClass('selected');
    init.sim_type = _sel.data('value');
    console.log(init.sim_type)
    if (zoom_metric_state) {
        draw_markers_sub_year(metrics_subyear, init.metric, init.sim_type)
    } else {
        draw_markers(metrics, init.metric, init);
    }

    generateColorBar();
}

function selectMetric(_selected) {
    // init.metric = _metric;
    let controls = $(".metricTypeItem");
    controls.each(i => {
        $(controls[i]).removeClass('selected')
    });
    _sel = $(_selected);
    _sel.addClass('selected');
    init.metric = _sel.data('value');

    if (zoom_metric_state) {
        draw_markers_sub_year(metrics_subyear, init.metric, init.sim_type)
    } else {
        draw_markers(metrics, init.metric, init);
    }

    generateColorBar();
}

function changeYear(val) {
    zoom_state = false;
    zoom_metric_state = false;
    _yr = init.yr + parseInt(val);
    _min = init.min_yr;
    _max = init.max_yr;
    var XRange;
    if (_min <= _yr && _yr <= _max) {
        init.yr = _yr;
        $('#year-selected').text(_yr);

        draw_markers(metrics, init.metric, init);

        if (lid){
            tracePlot(init.yr, lid)
        }

        // // generateColorBar();
        XRange = CheckXRange(_yr);
        let update = {
            'xaxis.range': XRange
        };
        if (myplot !== undefined) {
            Plotly.relayout('canvasDIV', update)
            // Plotly.relayout('twoDtimeslider', update)
        }
        if (twodslider !== undefined) {
            Plotly.relayout(systemState.timeSelector.activeTab, update)
            // Plotly.relayout('twoDtimeslider', update)
        }
    }

}



function dragElement(elmnt,elmnt1) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        elmnt1.style.top = (elmnt1.offsetTop - pos2) + "px";
        elmnt1.style.left = (elmnt1.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


function toggDiv(a) {
    _switch = {'block': 'none', 'none': 'block'};
    _elm = $('#con' + a);
    _elm_mini = $('#mini_con' + a);
    _elm.css('display', _switch[_elm.css('display')]);
    // _elm_mini.css('display', _switch[_elm_mini.css('display')]);
    _elm.css('top',_elm_mini.css('top'));
    _elm.css('left',_elm_mini.css('left'));
}


function toggLyrStd(e) {
    let is_checked = e.checked;
    // let lyr_id = e.value;
    let sel = $(e);
    let fn = standard[e.value].var_id;
//         let icon = standard[lyr_id].icon ? standard[lyr_id].icon : undefined;

    if (!(is_checked)) {
        sel.css("background-color", "");
        console.log(fn);
        leaflet_layers[fn].remove()

    } else {
        sel.css("background-color", '#2d4e45'); //"#359AFF");
        $.each(
            $('#con0').find("input[type='checkbox']:checked"),
            function (ix, ele) {
                if (ele.value != sel[0].value) $(ele).css("background-color", 'rgb(175, 193, 126)');
            }
        );
        if (leaflet_layers[fn] === undefined) {
            contextLayerLoader(fn)
        } else {
            leaflet_layers[fn].addTo(map)
        }

    }

}

function hideShowCanvas() {
    const x = document.getElementById("canvasDIV");
    if (x.style.display === "none") {
        x.style.display = "block";
        // map.setView([44, -93.5], 7);
    } else {
        x.style.display = "none";
        // map.setView([41.9472, -93.5403], 8);
    }
}


function removeCTXLayer(e){
    let lyr_id = e.value;
    let elem = document.getElementById('li_'+ lyr_id);
    let fn = standard[lyr_id].var_id;
    
    elem.parentNode.removeChild(elem);
//     $(elem).remove();
//     document.getElementById(elem)
    if (leaflet_layers[fn]) {
        leaflet_layers[fn].remove();
        delete leaflet_layers[fn]
    }
    console.log(e)
}