


function select_sim_type(_selected) {
    let _sel = $(_selected)
    let class_arr = (_sel.attr('class').split(/\s+/)).slice(0,2)
    let un_sel = class_arr.map(v=> '.'+v).join("") + '.selected';
    $(un_sel).removeClass('selected');
    $(_sel).addClass('selected');
    systemState.prod = _sel.data('value');

    if (zoom_metric_state) {
        draw_markers_sub_year(metrics_subyear, systemState.metric, systemState.sim_type)
    } else {
        draw_markers(metrics, systemState.metric, systemState.yr, systemState.sim_type);
    }
    generateColorBar(systemState.metric);
}

function selectMetric(_selected) {
    let _sel = $(_selected)
    let class_arr = (_sel.attr('class').split(/\s+/)).slice(0,2)
    let un_sel = class_arr.map(v=> '.'+v).join("") + '.selected';
    $(un_sel).removeClass('selected');
    $(_sel).addClass('selected');
    systemState.markerAttrs = _sel.data('value');

    if (zoom_metric_state) {
        draw_markers_sub_year(metrics_subyear, systemState.metric, systemState.sim_type)
    } else {
        draw_markers(metrics, systemState.metric, systemState.yr, systemState.sim_type);
    }
    generateColorBar(systemState.metric);
}

function changeYear(val) {
    console.log(val)
    zoom_state = false;
    zoom_metric_state = false;
    use_yr = parseInt(systemState.yr) + (parseInt(val) * parseInt(config.data_part.step));
    if (config.data_part.min_val <= use_yr && use_yr <= config.data_part.max_val) {
        systemState.yr = use_yr;
        $('#year-selected').text(use_yr);
        draw_markers(metrics, 'pList1', 'kge','kge', systemState.yr,systemState.sim_type);
        if (plot !== undefined) {
            tracePlot(use_yr, lid, usgs_id)
            var update = {
                'xaxis.range': CheckXRange(use_yr) //XRange
            };
            Plotly.relayout(div_plot, update)
        }
    }
}


function dragElement(elmnt, elmnt1) {
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
    _elm.css('top', _elm_mini.css('top'))
    _elm.css('left', _elm_mini.css('left'))
}


function toggLyrStd(e) {
    let is_checked = e.checked;
    let lyr_id = e.value;
    console.log(lyr_id)
    let dynamic = e.getAttribute('data-type');
    let fn, fnPath;
    if (dynamic=='dynamic'){
        fn = lyr_id;
        fnPath = config.spatialData[lyr_id].geom.fnPath;
        console.log(dynamic)
    }
    else {
        fn = config.mapLayers[lyr_id].fn;
        fnPath = config.mapLayers[lyr_id].fnPath;
        console.log(dynamic)
    }
    console.log(dynamic)

    let sel = $(e);

    if (!(is_checked)) {
        sel.css("background-color", 'rgba(45,78,69,0)');
        sel.css("class", '');
        console.log(fn)
        leaflet_layers[fn].remove()
    } else {
        sel.css("background-color", '#2d4e45'); //"#359AFF");
        $.each(
            $('#con0').find("input[type='checkbox']:checked"),
            function (ix, ele) {
                if (ele.value != sel[0].value) $(ele).css("background-color", 'rgb(175, 193, 126)');
            }
        )
        if (leaflet_layers[fn] === undefined) {
            if (dynamic=='dynamic'){
                initializeGeom(lyr_id)
            }else{
                contextLayerLoader(fnPath)
            }

        } else {
            leaflet_layers[fn].addTo(map)
        }

    }
    updateLayerZIndex()
}

function hideShowCanvas() {
    let p = $("#div_plot");
    let s = $("#sliderMainDIV");
    if (p.css('display') == "none") {
        p.show()
        s.show();
    } else {
        p.hide();
        s.hide();
    }
}

function removeCTXLayer(e) {
    let lyr_id = e.value;
    let elem = document.getElementById('li_' + lyr_id)
    // let fn = standard[lyr_id].fn

    elem.parentNode.removeChild(elem)
//     $(elem).remove();
//     document.getElementById(elem)
    if (leaflet_layers[lyr_id]) {
        leaflet_layers[lyr_id].remove()
        delete leaflet_layers[lyr_id]
    }
    console.log(e)
}


function updateLayerZIndex(){
    $('#sortable li').each( function()
    {
        var layer_idx = $(this).index();
        el = $(this)[0].children[1];
        console.log(el);
        var tr_id = el.value;
        console.log(tr_id)
        if (leaflet_layers[tr_id]!==undefined) {

            map.getPane(tr_id).style.zIndex = 1000 - layer_idx;
        }


    });
}


