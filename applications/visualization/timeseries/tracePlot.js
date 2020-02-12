//let flowMode = 'Discharge';
//let gridData =[];
//let shapes;
let modTrace;
modChecked = false;         /// MOVE IT TO INI()
let modMethod;
let modEvnt;
let hGrid = {
    default: false,
    derived: false
};

Papa.parsePromise = function(fn) {
    return new Promise(function(resolve) {
        let ret;
        Papa.parse(fn,
            {
                download: true,
                header: true,
                delimiter: ',',
                newline: '\n',
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (r) => resolve(r.data)
            }
        );
    });
};

function modInstall(){
    if (!config.hasOwnProperty('modTrace') || modChecked) return;
    let c = config.modTrace;
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = c.modJS;
    $("head").append(s);
    modChecked = true;
    modMethod = window[c.modMethod];
    modEvnt = window[c.modEvnt];
    if (c.hasOwnProperty('customEval')) eval(c.customEval);
    config.plotlyLayout.updatemenus[0].buttons = [
        {
            "label": "Discharge",
            "method": "skip"
        },{
            "label": "Stage",
            "method": "skip"
        }
    ]
}


function unpack(_data, key) {
    return _data.map(
        (row) => {
            return row[key];
        }
    );
}

function CheckXRange(_yr) {
    let XRange;
    if (!systemState.zoom_state) {
        if (config.plotlyLayout.hasOwnProperty('initMD') &&
                config.plotlyLayout.hasOwnProperty('finalMD')){
            XRange = [_yr + config.plotlyLayout.initMD, config.plotlyLayout.finalMD === 'now' ?
                moment(new Date().getTime() + 240*3600*1000).format('YYYY-MM-DD HH:mm') :
                _yr + config.plotlyLayout.finalMD];
        } else{
                XRange = [_yr + "-01-01 00:00:00", _yr + "-12-30 00:00:00"];
            }
        return XRange
    } else {
        return selectedRange
    }
}

function pathGenerator(key) {
    let c = config.traces[key].template;
    let f = new Function('v', 'return v');
    if (c.hasOwnProperty('argConv')){
        f = new Function(c.argConv.arguments, c.argConv.body);
    }
    let use_values = c.var.map(
        varKey => (c.hasOwnProperty('argConv') && varKey == c.argConv.var) ? f(systemState[varKey]) : systemState[varKey]
    );
    //console.log(c.path_format, use_values)
    return formatArray(c.path_format, use_values)
}

function getTrace(data, traceID, fn_src) {
    let trace = config.traces[traceID];
    let use_trace = JSON.parse(
        JSON.stringify(
            trace.style
        )
    );
    use_trace.data_src = fn_src;
    use_trace.mod = 'default';
    use_trace.x = unpack(data, trace.x_name);
    use_trace.y = unpack(data, trace.y_name);
    use_trace.visible = 'default' == systemState.mod;
    console.log("trace:", trace);
    return use_trace
}

function getModTrace(trace){
    _modTrace = JSON.parse(JSON.stringify(trace));      // <-- clone original trace
    _modTrace.mod = 'derived';
    _modTrace.visible = !_modTrace.visible;
    _modTrace.y = modMethod(_modTrace.y);               // <-- Apply mod method Q2Stage from plugin
    return _modTrace;
}

function getGridLines () {
    let c = config.horizontalGrid;
    let unit_convert = c.hasOwnProperty('unit_convert') ? parseFloat(c.unit_convert) : 1;
    let vals;
    let lines = [];

    function ajax_callback (data) {
        data = d3.csvParse(data);
        id = c.comID
        vals = data.filter(e => e[id] == String(systemState.comID));
        if (vals[0] == undefined) return;
        Object.keys(c.lines).forEach(
            (_key) => {
                lines.push(createShape(_key, vals[0][_key], unit_convert))
            }
        )
    }
    $.ajax(
        {
            url: c.filename,
            dataType: 'text',
            async: false,
            success: ajax_callback
        }
    );
    return lines;
}

function getModGridLines(gridLines){
    let derived = JSON.parse(JSON.stringify(gridLines));
    _success = true;
    derived.forEach(
        function (r) {
            let _y = r.y0
            my = modMethod([_y]);
            if (!$.isNumeric(my[0])){
                _success = false
                return;
            }
            r.y0 = r.y1 = parseFloat(
                modMethod([_y])[0].toPrecision(2)
            )
        }
    )
    console.log("_rc", _success)
    return _success ? derived : [];
}

function createShape(key, val, unit_conv){
    let c = config.horizontalGrid;
    let _line = JSON.parse(JSON.stringify(c.style));
    let v = val * unit_conv;
    _line.y0 = _line.y1 = v;
    _line.line.color = c.lines[key].color
    return _line
}

function traceInstalled(src, update_lifespan){
    if (div_plot.data == undefined) return false;
    let success = 0;
    let d = div_plot.data;
    for (i = 0; i < div_plot.data.length; ++i){
        if (2 < success) break;
        if (d[i].hasOwnProperty('data_src') && d[i].data_src == src){
            d[i].lifespan = update_lifespan;
            success += 1;
            console.log("function traceInstalled(src, update_lifespan){", success, src)
        }
    }
    return success > 0;
}

function plotTitle(comID){
    let c = config.mapMarkers;
    let _field = c.plotTitle.template.var;
    let _fmt = c.plotTitle.template.format;
    let vals = [];
    row_ix = Object.keys(
        mapMarkers.features
    ).filter(
        v=> mapMarkers.features[v].properties[config.mapMarkers.comIDName] == systemState.comID
    )[0]
    row = mapMarkers.features[row_ix];
    _field.forEach(
        p => vals.push(
            typeof(row.properties[p]) =="number" ? parseFloat(row.properties[p]).toFixed() : row.properties[p]
            // $.isNumeric(
            //     row.properties[p] && !Number.isInteger(row.properties[p])
            // ) ? row.properties[p].toFixed(2) :
            //     row.properties[p]
        )
    )
    console.log(vals);
    return formatArray(_fmt, vals)
}
function tracePlot(yr, comID) {
    let traceData = [];
    //let hGrid = {
    //    default: false,
    //    derived: false
    //}
    let c = config.traces;
    systemState.mod = 'default'

    systemState.xRange = CheckXRange(yr);
// TO DO: MOVE TO INI()
    if (config.hasOwnProperty('modTrace')) {
        modInstall()
    }
// END TO DO: MOVE TO INI()
    if (config.hasOwnProperty('horizontalGrid')) {
        hGrid.default = getGridLines()
        if (config.hasOwnProperty('modTrace')) hGrid.derived = getModGridLines(hGrid.default)
    }
    // Initialize the array for plotly traces
    traceIndices = [];
    count = 0;
    Object.keys(c).forEach(
        key => {
            traceIndices[key] = count;
            traceData[count] = JSON.parse(
                JSON.stringify(
                    c[key].style
                )
            );
            if (config.hasOwnProperty('modTrace') && c[key].hasOwnProperty('modEnabled') &&
                c[key].modEnabled
            ) {

                count = count+1;
                traceData[count] = JSON.parse(
                    JSON.stringify(
                        c[key].style
                    )
                );

            }
            count = count+1;
        }
    );
    Object.keys(c).forEach(
        key => {
            if (c[key].dynamic) return;
            src = pathGenerator(key);
            console.log("trace src", src);
            if (traceInstalled(src)) {
                console.log("traceInstalled(src) is true, quiting")
                return;
            }
            d3.csv(src,
                (error, data) => {
                if (error) {console.log(error); return}

                    let _trace = getTrace(data, key, src);

                    traceData[traceIndices[key]] = _trace;
                    // traceData[traceIdx].push(_trace);
                    //
                    // if (config.hasOwnProperty('modTrace') && c[key].hasOwnProperty('modEnabled') &&
                    //     c[key].modEnabled
                    // ) traceData.push(getModTrace(_trace));
                    if (config.hasOwnProperty('modTrace') && c[key].hasOwnProperty('modEnabled') &&
                        c[key].modEnabled
                    ) traceData[traceIndices[key]+1] = getModTrace(_trace);

                    let use_layout = JSON.parse(
                        JSON.stringify(
                            config.plotlyLayout
                        )
                    );
                    use_layout.xaxis.range = systemState.xRange;
                    use_layout.xaxis.autorange = false;

                    try {
                        use_layout.title = plotTitle(comID);
                    } catch {
                        use_layout.title = comID;
                    }

                    if (hGrid.default) use_layout.shapes = hGrid.default;
                    plotly_modBar = {
                        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
                        modeBarButtonsToAdd: [
                            {
                                name: 'toImage2',
                                icon: Plotly.Icons.camera,
                                click: function (gd) {
                                    Plotly.downloadImage(gd)
                                }
                            }
                        ],                        
                        responsive: true
                    };
                    plotly_modBar.displayModeBar = config.plotlyLayout.hasOwnProperty('displayModeBar') ? config.plotlyLayout.displayModeBar : true;

                    plot = Plotly.newPlot(
                        div_plot,
                        traceData,
                        use_layout,
                        plotly_modBar
                    );
                    if (systemState.timeSelector.activeTab != '') {
                        document.getElementById("div_plot").on("plotly_relayout", function (ed) {
                            syncPlots(ed, systemState.timeSelector.activeTab);
                        });
                    }

                    $(".updatemenu-button").on(
                        "click",
                        (ev) => {
                            let modSelected = String(ev.currentTarget.textContent);
                            console.log ("ev:", modSelected);
                            modEvnt(
                                modSelected,
                                hGrid
                            )
                        }
                    )
                }
            )
        });
//    document.getElementById("sliderMainDIV").style.display = 'block';

}

function addTraces(lifespan='semi-permanent') {
//lifeSpan = lifeSpan == undefined ? 'semi-permanent' : lifeSpan;
//function addTraces(arg) {
    let csvHeader = "dt,Q\n";
    let adding_traces = [];
    let c = config.traces
    //let lifespan = arg == undefined ? 'semi-permanent' : arg;

    Object.keys(c).forEach(function (key) {        
        if (!c[key].dynamic) return;
        console.log("systemState.prod, c[key].prod", systemState.prod, c[key], c[key].prod)
        if (c[key].ensemble) {
            if (systemState.prod != c[key].prod) {
                return
            }
        };
        
        let src = pathGenerator(key);
        console.log(key, "add trace src", src)
        if (traceInstalled(src, lifespan)) {return};
        $.ajax({
            url: src,
            dataType: 'text',
            async: false,
            success: function (data) {
                //let pref = '';
                //if (
                //    data.slice(
                //        csvHeader.length-2
                //    ) != csvHeader.slice(csvHeader.length-2)
                //) pref = csvHeader;
                //data = d3.csvParse(pref + data);
                data = d3.csvParse(data);
                let _trace = getTrace(data, key, src);
                _trace.lifespan = lifespan;
                _trace.showlegend = false;
                adding_traces.push(_trace);

                if (config.hasOwnProperty('modTrace') &&
                    c[key].hasOwnProperty('modEnabled') &&
                    c[key].modEnabled
                ) adding_traces.push(getModTrace(_trace));
            }
        });
    })
    Plotly.addTraces(div_plot, adding_traces);
}

function clearTraces(remove_lifespan = 'semi-permanent') {
    //remove_lifespan = remove_lifespan != undefined ? 'semi-permanent' : remove_lifespan;
    let idx_vec = [];
    div_plot.data.forEach(
        (tr, i) => {
            console.log(i, tr.lifespan, remove_lifespan)
            if (tr.hasOwnProperty('lifespan')) {
                if (remove_lifespan == 'semi-permanent') {
                    idx_vec.push(i);
                } else if (remove_lifespan == tr.lifespan) {
                    idx_vec.push(i);
                }
            }
        }
    )
    if (idx_vec.length > 0) Plotly.deleteTraces(div_plot, idx_vec);
}

