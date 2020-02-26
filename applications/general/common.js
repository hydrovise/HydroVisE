if (!String.prototype.format) {
    String.prototype.format = function() {
    let args = arguments;
    return this.replace(
            /{(\d+)}/g,
            function(match, number) {
                _ret  = typeof args[number] != 'undefined' ? args[number] : match;
                return _ret != null ? _ret : '';
            }
        )
    }
}


function formatArray(fmt,args){
    return fmt.replace(
        /{(\d+)}/g,
        function(match, number) {
            let _ret  = typeof args[number] != 'undefined' ? args[number] : match;
            return _ret != null ? _ret : '';
        }
    )
}


Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date() };
Date.time = function() { return Date.now().getUnixTime(); };


if (!Number.prototype.toRad) {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
}

if (!Number.prototype.toDeg) {
    Number.prototype.toDeg = function() {
        return this * 180 / Math.PI;
    }
}

function _GET(){
    let query = window.location.search.substring(1).split("&");
    let _init ={};
    for (let i = 0,
        max = query.length;
        i < max; i++
    ) {
        if (query[i] === "") continue;
        let param = query[i].split("=");
        _init[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
    }
    return _init
}

function getlength(number) {
    return number.toString().length;
}

function fetchFromLUT(comID, IDin, IDOut, LUTData){
    let matchIDX = IsMember(unpack(LUTData,comID),[IDin]);
    return  LUTData[matchIDX[0]]!==undefined ? LUTData[matchIDX[0]][IDOut] : undefined
}

Object.size = function (obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function randomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color
}

function syncPlots(ed, divID) {
    let div = document.getElementById(divID);

    repeating_relayout = !repeating_relayout;
    if (repeating_relayout) {
        return;
    }

    let x = div.layout.xaxis;
    if (x.range[0] !== ed["xaxis.range[0]"] ||
        x.range[1] !== ed["xaxis.range[1]"]) {
        ed["xaxis.range[0]"] =  systemState.xRange[0];
        ed["xaxis.range[1]"] = systemState.xRange[1];
        Plotly.relayout(div, ed)
    } else{
        repeating_relayout = !repeating_relayout;
    }
}

function pathGeneratorGeneral(subConfig, unix_time) {
    let c = subConfig.pathTemplate;
    return formatArray(c.path_format, [String(unix_time)])
}
