// flood_level = 'data/mean_annual_flood_q/usgs_06604440.csv';
cfs2cms = 0.0283168;

function any(iterable) {
    for (var strName in iterable) {
        return iterable[strName].length === 0;
    }
}


function move(progress) {
    var elem = document.getElementById("progressbar");
    var width = elem.style.width;
    elem.style.width = String(progress) + '%';
    elem.innerHTML = String(progress) + '%';
}


function returnFileList(lid) {
//   for (var i = 0; i < arguments.length; i++) {
//     console.log(arguments[i]);
//   }
    let fnList = [];
    let traceKeys = Object.keys(ts_Config);
    traceKeys.forEach(function (key) {
        let f = ts_Config[key].root + '/'
            + init.yr + '/'
            + ts_Config[key].subfolder + '/'
            + String(lid)
            + ts_Config[key].extension;


        fnList.push(f)
    })
    return fnList
}


pointDataCSV = 'data/lid_usgs.csv';
dtFormatRounded = 'YYYY-MM-DD';
dtFormatGeneral = 'YYYY-MM-DD HH:mm';

// let selectedRange = ["2015-06-16 06:00:10", "2015-07-03 22:33:36"];

//#### Get values based on array of indices ####//
function GetValFromIndices(array, indices) {
    var filteredData = (array, indices) => {
        return array.filter((element, index) => indices.includes(index));
    };
    return filteredData(array, indices)
}


//#### Fetch Specific Column from Data Object using Key ####//
function unpack(data, key) {
    return data.map(
        (row) => {
            return row[key];
        });
}

//#### Get DateTime from string using Moment.js ####//
function getDatetime(arr, key) {
//     console.log(arr)
    if (key) {
        return arr.map(
            (row) => {
                return moment(row[key]).format(dtFormatGeneral);
            });
    } else {
        return arr.map(
            (row) => {
                return moment(row).format(dtFormatGeneral);
            });
    }
}

//#### Round date to start of the day ####//
function roundToDay(dt) {
    if (dt.length > 1) {
        return dt.map(
            (row) => {
                return moment(row).format(dtFormatRounded) + ' 00:00';
            });
    } else {
        return moment(dt).format(dtFormatRounded) + ' 00:00'
    }
}

function loadCSV(file) {
    return new Promise(function (resolve, reject) {
        d3.csv(file, function (error, request) {
            if (error) {
                reject(error);
            } else {
                resolve(request);
            }
        });
    });
}

async function loadMultiCSV(fnList) {

    return new Promise(function (resolve, reject) {
        let dt = [];
        for (var i = 0; i < fnList.length; i++) {
            file = fnList[i];
            dt[file] = loadCSV(file);
        }
        resolve(dt)
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function arraysEqual(a1, a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1) === JSON.stringify(a2);
}

let metrics_subyear;

function readData(metrics, selectedRange) {
    // for testing the performance
    const num_comaprisons = 2;
    const test_p_num = 5;
    //

    let pointData = [];
    let match = [];
    let processed_points = 0;
    let progress = 0;
    const metrics_local = [];

    let all = [];
    for (keymet in metrics) {
        metrics_local[keymet] = []
    }
    let points = [];

    let elem = [];
    let elem_width = 0;
    let pointdatacsv = 'data/lid_usgs.csv';
    document.getElementById('progressbar').style.display = 'block';
    document.getElementById('progressDIV').style.display = 'block';
////////////////////new
    d3.csv(pointdatacsv, function (data) {
        points = data;

        asyncForEach(points.slice(0, test_p_num), async (point) => {
            var lid = String(point['lid']);
            var usgs_id = String(point['USGS_id']);
            var fnList = returnFileList(lid);
            var dt1 = [];

            fnList.forEach(function (fn) {

                Papa.parse(fn, {
                    download: true,
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {

                        dt1[fn] = results['data'];
                        if (Object.keys(dt1).length === 3) {
                            let pointmetric = [];
                            pointmetric = analyse(dt1, point, selectedRange);
                            for (let keymet in metrics) {
                                if (keymet !== 'year') {
//                                 console.log(pointmetric[keymet]);
                                    if (pointmetric[keymet] !== undefined) {
                                        pointmetric[keymet].forEach(item1 => {
                                            metrics_local[keymet].push(item1);
                                        })
                                    }
                                }
                            }
                            processed_points += 1;
                            progress = (processed_points / test_p_num) * 100;
                            elem_width = document.getElementById("progressbar").style.width;
                            move(progress)
                            if (metrics_local.lon.length === num_comaprisons * test_p_num) {
                                draw_markers_sub_year(metrics_local, metric_name, init.sim_type)
                                document.getElementById('progressbar').style.display = 'none';
                                document.getElementById('progressDIV').style.display = 'none';
                                document.getElementById("progressbar").style.width = String(0) + '%';
                                document.getElementById("progressbar").innerHTML = String(0) + '%';
                                metrics_subyear = metrics_local;
                                zoom_metric_state = true;
                            }
                        }

                    }
                });
            })


        })
    })


}


//#### Data Analysis ####//
function analyse(dt1, point, selectedRange, metric_name) {
//     console.log(IsMember(roundToDay(selectedRange), getDatetime(dataArr[files[1]], 'dt')))
    let indices = [];
    lid = String(point['lid']);
    usgs_id = String(point['USGS_id']);
    fnList = returnFileList(lid);
//     console.log(fnList)
    let dataArr = [];
    dataArr = dt1;
//     const dataArr =  loadCSV(fnList[1]);

//     console.log(dataArr)
    fnList.forEach(function (f) {
//         console.log(f)
        indices[f] = IsMember(roundToDay(selectedRange), getDatetime(dataArr[f], 'dt'))

    })
    let metrics = [];
    let dataArray = [];
    let comparisonArray = [];
    fnList.forEach(function (f) {
        dataArray[f] = dataArr[f].slice(indices[f][1][0], indices[f][1][1]);
    })
    let fnObs = fnList[0];
    let MatchIdx = [];
    let obs = [];
    for (i = 1; i < fnList.length; i++) {
        let fn = [];
        let sim = [];
        fn = fnList[i];

        MatchIdx[fn] = IsMember(
            getDatetime(dataArray[fn], 'dt'),
            getDatetime(dataArray[fnObs], 'dt')
        )

//         console.log(MatchIdx[fn][1])
//         console.log(unpack(dataArray[fnObs],'Q'))
//         console.log(GetValFromIndices(unpack(dataArray[fnObs],'Q'), MatchIdx[fn][1]))
        obs = GetValFromIndices(dataArray[fnObs], MatchIdx[fn][1])
        sim = GetValFromIndices(dataArray[fn], MatchIdx[fn][0])
        comparisonArray[fn] = [sim, obs];
    }
    // console.log(comparisonArray)
    //#### Generate an array with objects for feeding to MetricCalculator Function ####//
    let compreadyArray = [];
    for (let i = 1; i < fnList.length; i += 1) {
        compreadyArray[fnList[i]] = [];
        for (let j = 0; j < comparisonArray[fnList[i]][0].length; j += 1) {
//             console.log(fnList[i])
            compreadyArray[fnList[i]].push({
                obs: comparisonArray[fnList[i]][1][j].Q,
                pred: Number(comparisonArray[fnList[i]][0][j].Q),
                dt: comparisonArray[fnList[i]][0][j].dt

            })
        }
    }
//     console.log(compreadyArray)
    metric_name_list = ['volume_error', 'agreementindex', 'bias', 'correlationcoefficient', 'covariance',
        'decomposed_mse', 'kge', 'log_p', 'mae', 'mse', 'nashsutcliffe',
        'pbias', 'rmse', 'rrmse', 'rsquared', 'rsr', 'nRMSE',
        'nMAE', 'timing', 'norm_bias', 'ppd', 'peak_qsim', 'qsim_vol',
        'qobs_vol', 'pt_change_vol'];
    metrics_local = [];
    // initialize metrics object with the array names
    metric_name_list.forEach(function (key) {
        metrics_local[key] = [];
    })

    for (key1 in point) {
        metrics_local[key1] = [];
    }
    lut_SimType = ['Q_ol', 'Q_assim_norm_v2'];
    metrics_local['sim_type'] = [];
    j = 0;
    for (key in compreadyArray) {
        for (key1 in point) {
            metrics_local[key1].push(point[key1]);
        }
        point_metrics = allMetrics(compreadyArray, key, point, metric_name)
        metric_name_list.forEach(function (metric_name) {
            try {
                metrics_local[metric_name].push(point_metrics[metric_name]);
            } catch {

            }


        });
        metrics_local['sim_type'].push(lut_SimType[j]);
//         console.log(point)
//         console.log(metrics_local)
        j = j + 1;
    }

//     console.log(metrics_local)
    return metrics_local
}

// dt = readData();

