var rcCoef = {};

function _Q2Stage(flow_arr) {
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
        }
        return total
    }

    function loadRatingCurve(lid){
        $.ajax({
            url: 'http://s-iihr50.iihr.uiowa.edu/smap/retro/data/ratingCurve/rc_usgs.csv',
            dataType: 'text',
            async: false,
            success: function (data) {
                data = d3.csvParse(data);
                let data_rc = data.filter(row => row['link_id'] == String(lid));
                if (data_rc.length == 0) return;
                let x = unpack(data_rc, 'discharge_l');
                var y = unpack(data_rc, 'stage_l');
                x = x.map(data => Number(data) * cfs2cms);
                y = y.map(Number);
                rcCoef[lid] = polynomialRegressor(x, y, order = 3);
            }
        });
    }

    if (!rcCoef[lid]) {
        loadRatingCurve(lid);
    };
    return flow_arr.map(val => val=="" ? "" : polynomFunction(val, rcCoef[lid]))
}
