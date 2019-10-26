if (!String.prototype.format) {
    String.prototype.format = function() {
    var args = arguments;
    return this.replace(
            /{(\d+)}/g,
            function(match, number) {
                _ret  = typeof args[number] != 'undefined' ? args[number] : match
                return _ret != null ? _ret : '';
            }
        )
    }
}

function formatArray(fmt,args){
    return fmt.replace(
        /{(\d+)}/g,
        function(match, number) {
            _ret  = typeof args[number] != 'undefined' ? args[number] : match
            return _ret != null ? _ret : '';
        }
    )
}


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
    var query = window.location.search.substring(1).split("&");
    var _init ={};
    for (var i = 0,
        max = query.length;
        i < max; i++
    ) {
        if (query[i] === "") continue;
        var param = query[i].split("=");
        _init[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
    }
    return _init
}

function getlength(number) {
    return number.toString().length;
}

function fetchFromLUT(comID, IDin, IDOut, LUTData){
    matchIDX = IsMember(unpack(LUTData,comID),[IDin]);
    return  LUTData[matchIDX[0]]!==undefined ? LUTData[matchIDX[0]][IDOut] : undefined
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color
}

function syncPlots(ed, divID) {
    div = document.getElementById(divID);
    console.log("ed, div, repeting_releyout", ed, div, repeting_releyout)
    // if (ed["xaxis.autorange"] && x.autorange) return;
    // if (ed["xaxis.range[0]"] == undefined ||
    //     ed["xaxis.range[1]"] == undefined) return;
    repeting_releyout = !repeting_releyout;
    // ed["yaxis.range"] = false;
    // ed["yaxis.autorange"] = false;
    // ed.yaxis.autorange = false;
    if (repeting_releyout) {
        return;
    }
    let x = div.layout.xaxis;
    (
        x.range[0] != ed["xaxis.range[0]"] ||
        x.range[1] != ed["xaxis.range[1]"]
    ) ? Plotly.relayout(div, ed) : repeting_releyout = !repeting_releyout;

}