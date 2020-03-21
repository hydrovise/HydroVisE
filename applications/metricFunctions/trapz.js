function operator(a, b, opName) {
    switch (opName) {
        case 'sum':
            result = a + b;
            break;
        case 'subtract':
            result = a - b;
            break;
        case 'multiply':
            result = a * b;
            break;
        case 'divide':
            result = a / b;
            break;
        case 'mean':
            result = (a + b) / 2;
            break;
        case 'power':
            result = a **b;
            break;
    }
    return result
}

function vecOperator(a, b, opName, dataType) {

    if (b.constructor===Array && dataType === 'value') {
        var x = a.map(function (item, index) {
            // In this case item correspond to currentValue of array a,
            // using index to get value from array b
            return operator(item, b[index], opName);
        })

    } else if (b.constructor===Array && dataType === 'date') {
        var x = a.map(function (item, index) {
            // returns seconds
            return operator(moment(item), moment(b[index]), opName) / 1000;
        })

    } else if (b.constructor!==Array && dataType==='value'){
        var x = a.map(function (item) {
            // In this case item correspond to currentValue of array a,
            // using index to get value from array b
            return operator(item, b, opName);
        })
    }
    return x
}

//#### Integral Function based on time ####//
function trapzIntegral(Array, dt) {
    let dt1, dt2 = [];
    dt1 = dt.slice(0, dt.length - 1);
    dt2 = dt.slice(1, dt.length);
    var deltaT = vecOperator(dt2, dt1, 'subtract', 'date');

    let arr1, arr2 = [];
    arr1 = Array.slice(0, Array.length - 1);
    arr2 = Array.slice(1, Array.length);
    var meanval = vecOperator(arr1, arr2, 'mean', 'value');
    mult = vecOperator(meanval, deltaT, 'multiply', 'value');
    integral = math.sum(mult);
    return integral
}
