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

function returnFileList(comID) {
    let fnList = [];

    let traceKeys = Object.keys(config.traces);

    traceKeys.forEach(function (key) {
        let c = config.traces[key].template;
        let use_values = c.var.map(
            varKey => (varKey !== 'yr') ? comID : systemState[varKey]
        );
        let f = formatArray(c.path_format, use_values)
        fnList.push(f)
    });
    return fnList
}



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
function calcEvntMetrics() {

    let metricList = config.calcMetrics.metricList;
    let features = mapMarkers.features;
    let nFeatures = features.length;
    let processedFeatures = 0;
    let progress = 0;

    let elem_width = 0;


    document.getElementById('progressbar').style.display = 'block';
    document.getElementById('progressDIV').style.display = 'block';

    let metrics_local = [];


    asyncForEach(features.slice(0, nFeatures), async (feature) => {
        var comID = String(feature.properties[comIDName]);
        var fnList = returnFileList(comID);
        var dt1 = [];
        let itemsProcessed = 0;
        fnList.forEach(function (fn) {
            Papa.parse(fn, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    dt1[fn] = results['data'];
                    itemsProcessed++;
                    if(itemsProcessed === fnList.length) {
                        let pointmetric = [];
                        pointmetric = analyse(dt1, feature);
                        Object.keys(pointmetric).forEach(d =>  metrics_local.push(pointmetric[d]))

                        processedFeatures += 1;
                        progress = ((processedFeatures / nFeatures) * 100).toFixed(2);
                        elem_width = document.getElementById("progressbar").style.width;
                        move(progress);
                        if (processedFeatures ===  nFeatures) {
                            colorCodeMapMarkersSubYear(systemState.markerAttrs,metrics_local)
                            document.getElementById('progressbar').style.display = 'none';
                            document.getElementById('progressDIV').style.display = 'none';
                            document.getElementById("progressbar").style.width = String(0) + '%';
                            document.getElementById("progressbar").innerHTML = String(0) + '%';
                            metrics_subyear = metrics_local;
                            zoom_metric_state = true;
                        }
                    }
                }
            })


        });


    });
}

//#### Data Analysis ####//
function analyse(dataArr, feature) {
    selectedRange = systemState.xRange;
    let indices = [];
    lid = String(feature.properties[comIDName]);
    fnList = returnFileList(lid);

    fnList.forEach(function (f) {
        indices[f] = IsMember(roundToDay(selectedRange), getDatetime(dataArr[f], 'dt'))

    });
    let dataArray = [];
    let comparisonArray = [];
    // Take a subset of the data for matching the timestamps
    fnList.forEach(function (f) {
        dataArray[f] = dataArr[f].slice(indices[f][1][0], indices[f][1][1]);
    });
    // uses the first element of the defined traces as reference data
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
        );
        obs = GetValFromIndices(dataArray[fnObs], MatchIdx[fn][1]);
        sim = GetValFromIndices(dataArray[fn], MatchIdx[fn][0]);
        comparisonArray[fn] = [sim, obs];
    }

    //#### Generate an array with objects for feeding to MetricCalculator Function ####//
    let compreadyArray = [];
    for (let i = 1; i < fnList.length; i++) {
        compreadyArray[fnList[i]] = [];
        for (let j = 0; j < comparisonArray[fnList[i]][0].length; j++) {
            compreadyArray[fnList[i]].push({
                obs: comparisonArray[fnList[i]][1][j].Q,
                sim: Number(comparisonArray[fnList[i]][0][j].Q),
                dt: comparisonArray[fnList[i]][0][j].dt

            })
        }
    }

    metric_name_list = ['volume_error', 'agreementindex', 'bias', 'correlationcoefficient', 'covariance',
        'decomposed_mse', 'kge', 'log_p', 'mae', 'mse', 'nashsutcliffe',
        'pbias', 'rmse', 'rrmse', 'rsquared', 'rsr', 'nRMSE',
        'nMAE', 'timing', 'norm_bias', 'ppd', 'peak_qsim', 'qsim_vol',
        'qobs_vol', 'pt_change_vol'];
    metrics_local = {};

    let products = Object.keys(config.controls.prod);
    let j = 0;
    Object.keys(compreadyArray).forEach(key => {
        try{
            point_metrics = allMetrics(compreadyArray, key, feature);
            point_metrics['prod'] = products[j];
            point_metrics['year'] = systemState.yr;
            point_metrics[comIDName] = feature.properties[comIDName];

            metrics_local[j]= Object.assign({},point_metrics);

        } catch {
            console.log('Data missing on feature comID = ' +  feature.properties[comIDName])
        }

        j = j + 1;
    });
    return metrics_local
}

