function select_sim_type(_selected) {
    let _sel = $(_selected)
    let class_arr = (_sel.attr('class').split(/\s+/)).slice(0,2)
    let un_sel = class_arr.map(v=> '.'+v).join("") + '.selected';
    $(un_sel).removeClass('selected');
    $(_sel).addClass('selected');
    systemState.prod = _sel.data('value');
    if (div_plot.hasOwnProperty('data')){
        clearTraces('temporary');
        addTraces('temporary');
    }

    if (zoom_metric_state) {
        draw_markers_sub_year(metrics_subyear, systemState.metric, systemState.sim_type)
    } else {
        // draw_markers(metrics, systemState.metric, systemState.yr, systemState.sim_type);
        if (systemState.markerAttrs) colorCodeMapMarkers(systemState.markerAttrs)
    }

    // generateColorBar1(systemState.metric);
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
        // draw_markers(markerAttrs, systemState.metricType, systemState.yr, systemState.prod);
        // generateColorBar1(systemState.metricType,val)
        colorCodeMapMarkers(systemState.markerAttrs)
    }
}

function changeYear(val) {
    // console.log(val)
    zoom_state = false;
    zoom_metric_state = false;
    use_yr = parseInt(systemState.yr) + (parseInt(val) * parseInt(config.data_part.step));

    if (config.data_part.min_val <= use_yr && use_yr <= config.data_part.max_val) {
        systemState.yr = use_yr;
        systemState.xRange = CheckXRange(use_yr);
        $('#year-selected').text(use_yr);
        var update = {
            'xaxis.range': CheckXRange(use_yr) //XRange
        };
        if (mapMarkers){
            leaflet_layers['mapMarkers'].remove()
            draw_markers(mapMarkers, config.mapMarkers.comIDName)
            if(markerAttrs)  colorCodeMapMarkers(systemState.markerAttrs)
        }
        // draw_markers(metrics, 'pList1', 'kge','kge', systemState.yr,systemState.sim_type);
        if (div_plot.hasOwnProperty('data')) {
            tracePlot(use_yr, systemState.comID)
            Plotly.relayout(div_plot, update)
        }
        if (systemState.timeSelector.activeTab !=""){
            repeting_releyout = true;
            Plotly.relayout(systemState.timeSelector.activeTab, update)
        }
        if (systemState.hasOwnProperty('sliderState') & systemState.sliderState > 0){
            function dynamicRange (v) {return v};
            if (config.timeSlider.hasOwnProperty('dynamicRange')){
                is_dynamic = true;
                dynamicRange = new Function(config.timeSlider.dynamicRange.arguments, config.timeSlider.dynamicRange.body)
            }
            $("#slider").slider(
                {
                    min: dynamicRange(config.timeSlider.min),
                    max: dynamicRange(config.timeSlider.max)
                }
            );
        }
    }
}


function dragElement(el_id, ctrl_id) {
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        init_y = ctrl.style.top;
        init_x = ctrl.style.left;
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        ctrl.style.top = (ctrl.offsetTop - pos2) + "px";
        ctrl.style.left = (ctrl.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
        let final_x = ctrl.style.left;
        let final_y = ctrl.style.top;
        if (final_x == init_x &&
            final_y == init_y) {
            minMaxInventory(ctrl_id);
        }
        document.onmouseup = null;
        document.onmousemove = null;
    }

    if (ctrl_id == undefined) ctrl_id = el_id;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var init_y;
    var init_x;
    var elmnt = document.getElementById(el_id);
    var ctrl = document.getElementById(ctrl_id);
    console.log (el_id, document.getElementById(el_id));
    elmnt.onmousedown = dragMouseDown;
}

function minMaxInventory(a) {
    let vis = new Map (
        [
            ['block', 'none'],
            ['none', 'block']
        ]
    );
    let pref = 'mini_';
    b = a.includes(pref) ? a.replace(pref, '') : pref + a;
    el_a = document.getElementById(a);
    el_b = document.getElementById(b);
    el_a.style.display = vis.get(el_a.style.display);
    el_b.style.display = vis.get(el_a.style.display);
    el_b.style.top = el_a.style.top;
    el_b.style.left = el_a.style.left;
}

//user has to click twice on the raster layers
function toggLyrStd(e) {
    let is_checked = e.checked;
    let lyr_id = e.value;
    // console.log(lyr_id)
    let dynamic = e.getAttribute('data-type')=='dynamic' ? true :false;
    let fn, fnPath;
    if (dynamic){
        fn = lyr_id;
        fnPath = config.spatialData[lyr_id].hasOwnProperty('geom')?  config.spatialData[lyr_id].geom.fnPath :'';
        // console.log(dynamic)
    }
    else {
        fn = config.mapLayers[lyr_id].fn;
        fnPath = config.mapLayers[lyr_id].fnPath;
        // console.log(dynamic)
    }
    // console.log(dynamic)

    let sel = $(e);

    if (!(is_checked)) {
        sel.css("background-color", 'rgba(45,78,69,0)');
        sel.css("class", 'checked');
        // console.log(fn);
        // dynamic ? leaflet_layers[fn].hide() : leaflet_layers[fn].remove()
        dynamic && !leaflet_layers[fn].options.hasOwnProperty('vectorTileLayerStyles')?  leaflet_layers[fn].hide() : leaflet_layers[fn].remove();
    } else {
        // sel.css("background-color", '#2d4e45'); //"#359AFF");
        sel.css("background-color", 'rgb(175, 193, 126)');
        sel.css("class", '');
        // sel.css("background-color", 'rgb(175, 193, 126)');
        if (leaflet_layers[fn] === undefined) {
            if (dynamic=='dynamic'){
                initializeGeom(lyr_id)
            }else{
                contextLayerLoader(fnPath);
                // updateLayerZIndex()
            }

        } else {
            dynamic && !leaflet_layers[fn].options.hasOwnProperty('vectorTileLayerStyles')? leaflet_layers[fn].show() : leaflet_layers[fn].addTo(map);
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
    // console.log(e)
}


function updateLayerZIndex(){
    $('#sortable li').each( function()
    {
        var layer_idx = $(this).index();
        // console.log($(this))
        // [""0""].style.zIndex
        el = $(this)[0].children[1];
        // console.log(el);
        var tr_id = el.value;
        // console.log(tr_id)
        // console.log(layer_idx);
        if (leaflet_layers[tr_id]!==undefined) {

            map.getPane(tr_id).style.zIndex = 1000 - layer_idx;
        }
        // map.getPane(tr_id).style.zIndex = 1000 - layer_idx;
        map.getPane('overlayPane').style.zIndex = 1000;
    });
}

function open2DTab(evt, tabName) {
    let i, tabcontent, tablinks, tabID;
    tabID = 'div_' + tabName;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabID).style.display = "block";
    evt.currentTarget.className += " active";
    systemState.timeSelector.activeTab = tabID;
    dragLayer = document.getElementsByClassName('nsewdrag')[0];
    ed = {"xaxis.range[0]": systemState.xRange[0], "xaxis.range[1]": systemState.xRange[1]};
    repeting_releyout = true;
    syncPlots(ed, systemState.timeSelector.activeTab)

}
