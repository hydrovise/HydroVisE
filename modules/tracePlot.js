function unpack(data11, key) {
    return data11.map(
        (row) => {
            return row[key];
        }
    );
}

function polynomialRegressor(x, y, order = 3) {
    const xMatrix = [];
    let xTemp = [];
    const yMatrix = numeric.transpose([y]);
    for (let j = 0; j < x.length; j++) {
        xTemp = [];
        for (let i = 0; i <= order; i++) {
            xTemp.push(Math.pow(x[j], i));
        }
        xMatrix.push(xTemp);
    }
    const xMatrixT = numeric.transpose(xMatrix);
    const dot1 = numeric.dot(xMatrixT, xMatrix);
    const dotInv = numeric.inv(dot1);
    const dot2 = numeric.dot(xMatrixT, yMatrix);
    // returns array of coefficients
    return numeric.dot(dotInv, dot2);
}

function polynomFunction(flow, Coef) {
    let total = 0;
    for (let i = 0; i < Coef.length; i++) {
        total += Coef[i][0] * (flow ** i);
        // console.log(total)
    }
    return total
}

function Q2Stage(rcCoef, flowVec) {
    return flowVec.map(flow => polynomFunction(flow, rcCoef))
}

function createTrace(traceID) {
    let trace = jQuery.extend({}, ts_Config[traceID].style);
    trace.x = unpack(dt[traceID], 'dt');
    trace.y = unpack(dt[traceID], 'Q');
    // trace.y = unpack(dt[traceID], 'Q');
    return trace
}

function createTraceStage(traceID) {
    let trace = jQuery.extend({}, ts_Config[traceID].style);
    trace.x = unpack(dt[traceID], 'dt');
    trace.y = Q2Stage(rcCoef, unpack(dt[traceID], 'Q'));
    trace.visible = false;
    return trace
}

function createArrayfromElement(elem, repNo) {
    let array = [];
    for (let i = 0; i < repNo; i++) {
        array.push(elem)
    }
    return array
}

var rcCoef;


function tracePlot(yr, lid) {
    let traceData = [];
    var visPlotlyFlow = [];
    var visPlotlyStage = [];
    dt = [];
    let traceKeys = Object.keys(ts_Config);
    console.log(traceKeys);
    // Import Rating Curves for All gages
    try {
        $.ajax({
            url: 'platformdata/rc_usgs.csv',
            dataType: 'text',
            async: false,
            success: function (data) {
                data = d3.csvParse(data);
                let data_rc = data.filter(row => row['link_id'] === String(lid));
                // Extract data column for Discharge
                let x = unpack(data_rc, 'discharge_l');
                // Convert the flow rates from CFS 2 CMS
                // (Compatible with the original streamflow data CMS units)
                // Extract data column for Stage
                var y = unpack(data_rc, 'stage_l');
                x = x.map(data => Number(data) * cfs2cms);
                y = y.map(Number);
                // get the coefficients of the polynomial fit from streamflow
                // Coefficients are given as [C0, C1, C2, ...]
                // whereas the polynomial function is : y = F(x) = $C_0 + C_1 x + C_2 x^2 + C_3 x^3
                rcCoef = polynomialRegressor(x, y, order = 3);
            }
        });
    } catch {
        console.log('There is no flood level data for this gauage.')
    }


    $.ajax({
        url: NWSLevConfig['root'] +
            NWSLevConfig['subfolder'] +
            NWSLevConfig['filename'] +
            NWSLevConfig['extension'],
        dataType: 'text',
        async: false,
        success: function (data) {
            data = d3.csvParse(data);
            NWSLevels = data.filter(e => e['link_id'] === String(lid));
        }
    });

    let NWSkeys = Object.keys(NWSLevConfig.flood_stages);
    // console.log(NWSLevels)
    if (NWSLevels.length > 0) {
        NWSkeys.forEach(function (level) {

            ['flw', 'stg'].forEach(function (StageFlw) {
                let varName = StageFlw + '_' + level;
                // console.log(varName)
                let trace = jQuery.extend({}, NWSLevConfig['flood_stages'][level].style);
                XRange = CheckXRange(init.yr);
                trace.x = XRange;
                let val = [];
                if (StageFlw === 'flw') {
                    val = NWSLevels[0][varName] * cfs2cms;
                    trace.visible = true;
                } else {
                    val = NWSLevels[0][varName];
                    trace.visible = false;
                }
                trace.y = createArrayfromElement(val, 2);
                traceData.push(trace)
            });
            visPlotlyStage.push(false, true);
            visPlotlyFlow.push(true, false);
        });
    }


    traceKeys.forEach(function (key) {
        let f = ts_Config[key].root + '/'
            + yr + '/'
            + ts_Config[key].subfolder + '/'
            + String(lid)
            + ts_Config[key].extension;
        d3.csv(f,
            (data) => {
                dt[key] = data;
                traceData.push(createTrace(key));

                if (NWSLevels.length !== 0) {
                    console.log(NWSLevels);
                    if (ts_Config[key].stageEnabled) {
                        visPlotlyStage.push(false, true);
                        visPlotlyFlow.push(true, false);
                        traceData.push(createTraceStage(key))
                    } else {
                        visPlotlyStage.push(true);
                        visPlotlyFlow.push(true);
                    }
//                     console.log(visPlotlyStage, visPlotlyFlow);
                    plotly_Q_Stage[0].buttons[0].args[0].visible = visPlotlyFlow;
                    plotly_Q_Stage[0].buttons[1].args[0].visible = visPlotlyStage;
                    // console.log(dt)
                }
                if (d3.keys(dt).length === traceKeys.length) {
                    plotlyLayout.title = usgs_name;
                    plotlyLayout.xaxis.range = XRange;
                    myplot = Plotly.newPlot(
                        'canvasDIV',
                        traceData,
                        plotlyLayout,
                        {
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
                            displayModeBar: true,
                            responsive: true
                        }
                    );

                    // canvasDIV.on(
                    //     'plotly_click',
                    //     (data) => {
                    //         if (i_m_loading) return
                    //         let dt = '';
                    //         let current = new Date();
                    //         let timestamp = [];
                    //         let idx = data.points[0].pointIndex;
                    //
                    //         if (data.points[0].curveNumber === 2) {
                    //             timestamp = (smap_ts_am[idx]);
                    //         } else if (data.points[0].curveNumber === 3) {
                    //             timestamp = (smap_ts_pm[idx]);
                    //         }
                    //         let fnPath = 'data/SMAP_L3_tiff/' + timestamp.toString() + '.tif';
                    //         loader.addTo(map);
                    //         change(fnPath, timestamp);
                    //     }
                    // );
                    canvasDIV.on(
                        'plotly_relayout',
                        (eventdata) => {
                            if (eventdata['xaxis.range[0]'] !== undefined) {
                                selectedRange = [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']];
//                                 console.log([eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']]);
                                if (plot_state === 'event_based') {
                                    // metric_subyear = readData(metrics, selectedRange)
                                    document.getElementById("claculatemetricsButton").disabled = false;
                                    zoom_state = true
                                }
                                return selectedRange;
                            }
                        }
                    );
                    // canvasDIV.innerHTML += "<button style='z-index: 4' id='clickme'  type='button'>Click Me!</button></div>"
                    // return myplot
                    // map.setView([44, -93.5], 7);
                }
            })
    });
    var i_m_loading = false;
}

function CheckXRange(_yr) {
    let XRange;
    if (!zoom_state) {
        if (myplot !== undefined) {
            XRange = [_yr + "-04-01 00:00:00", _yr + "-12-01 00:00:00"];
        } else {
            XRange = [init.yr + "-04-01 00:00:00", init.yr + "-12-01 00:00:00"];
        }
        return XRange
    } else {
        return selectedRange
    }

}


