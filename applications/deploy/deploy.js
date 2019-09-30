function createNewPerson(name) {
    var obj = {};
    obj.name = name;
    obj.greeting = function() {
        alert('Hi! I\'m ' + obj.name + '.');
    };
    return obj;
}

function addFunction() {
    var PointProperties  = ['root folder', 'variableHeaders.Timestamp', 'variableHeaders.Variable']
    var table = document.getElementById("textbox");
    var rowlen = table.rows.length;
    var row = table.insertRow(rowlen);
    row.id = rowlen;
//     console.log(row)
    var arr = ['Trace' + row.id];
    for (i = 0; i < 2; i++) {
        var x = row.insertCell(i)
        if (i == 1) {
            x.innerHTML = "<input type='button' onclick='removeCell(" + row.id + ")' value=Delete>"
        } else {
            x.innerHTML = "<label>" + arr[i] + "- root" + " : </label><input type='textbox' name='trace." + arr[i] + ".root'><br>" +
                "<label>Datetime Header" + " : </label><input type='textbox' name='trace." + arr[i] + ".HeaderDt'>" +
                "<label>Variable Header" + " : </label><input type='textbox' name='trace." + arr[i] + ".HeaderVar'><br>" +
                "<label>Datetime Name" + " : </label><input type='textbox' name='trace." + arr[i] + ".dtname'>" +
                "<label>Variable Name" + " : </label><input type='textbox' name='trace." + arr[i] + ".varname'><br>" +
            "<label>Layout:</label><br>" +
                "<label>Line</label><input type='radio' checked={true} name='trace." + arr[i] + ".layout.plot_type' value='Line'>" +
                "<label>Point</label><input type='radio' name='trace." + arr[i] + ".layout.plot_type' value='Point'><br>"+ 
                "<input type='color' name='trace." + arr[i] + ".layout.color' value='#ff0000'>"
        }
    }
}


function add2dFunction() {
    var PointProperties  = ['root folder', 'variableHeaders.Timestamp', 'variableHeaders.Variable']
    var table = document.getElementById("textbox");
    var rowlen = table.rows.length;
    var row = table.insertRow(rowlen);
    row.id = rowlen;
//     console.log(row)
    var arr = ['Trace' + row.id];
    for (i = 0; i < 2; i++) {
        var x = row.insertCell(i)
        if (i == 1) {
            x.innerHTML = "<input type='button' onclick='removeCell(" + row.id + ")' value=Delete>"
        } else {
            x.innerHTML = "<label>" + arr[i] + "- root" + " : </label><input type='textbox' name='trace." + arr[i] + ".root'><br>" +
                "<label>Datetime Header" + " : </label><input type='textbox' name='trace." + arr[i] + ".HeaderDt'>" +
                "<label>Variable Header" + " : </label><input type='textbox' name='trace." + arr[i] + ".HeaderVar'><br>" +
                "<label>Datetime Name" + " : </label><input type='textbox' name='trace." + arr[i] + ".dtname'>" +
                "<label>Variable Name" + " : </label><input type='textbox' name='trace." + arr[i] + ".varname'><br>" +
                "<label>Layout:</label><br>" +
                "<label>Line</label><input type='radio' checked={true} name='trace." + arr[i] + ".layout.plot_type' value='Line'>" +
                "<label>Point</label><input type='radio' name='trace." + arr[i] + ".layout.plot_type' value='Point'><br>"+
                "<input type='color' name='trace." + arr[i] + ".layout.color' value='#ff0000'>"
        }
    }
}

function addFunctionpoint() {
    var table = document.getElementById("PointForm");
    var rowlen = table.rows.length;
    var row = table.insertRow(rowlen);
    row.id = rowlen;
    // console.log(row)
    var arr = ['Trace ' + row.id];
    for (i = 0; i < 2; i++) {
        var x = row.insertCell(i);
        if (i === 1) {
            x.innerHTML = "<input type='button' onclick='removeCell(" + row.id + ")' value=Delete>"
        } else {
            x.innerHTML = "<label>" + arr[i] + ":</label><input type='textbox1' name='pointlist." + arr[i] + "'>"
        }
    }
}

function removeCell(rowid) {
    var table = document.getElementById(rowid).remove();
}

function serialize() {
    var elements = document.querySelectorAll('#myform input');
    console.log(elements)
    var data = {};
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var val = el.value;
        if (!val) val = "";
        var fullName = el.getAttribute("name");
        var type = el.getAttribute("type")
        if (!fullName) continue;
        var fullNameParts = fullName.split('.');
//         console.log(fullNameParts)
        var prefix = '';
        var stack = data;
        for (var k = 0; k < fullNameParts.length-1 ; k++) {
            prefix = fullNameParts[k];
            if (!stack[prefix]) {
                stack[prefix] = {};
            }
            stack = stack[prefix];
        }
        prefix = fullNameParts[fullNameParts.length-1];
//         console.log(prefix)
        console.log(stack[prefix])
        if (type === 'radio') {
            if (el.checked) {
                stack[prefix] = val;
            }
            
        } else {
            if (stack[prefix]) {

            var newVal = stack[prefix] + ',' + val;
            stack[prefix] += newVal;
        } else {
            stack[prefix] = val;
        }
        }
//         console.log(stack[prefix] +' ----' + val)
    }
    console.log(data);
    document.getElementById("result").appendChild(
        renderjson(data)
    );
    // var paragraph = document.getElementById("result");
    // var text = document.createTextNode("This just got added");
    // paragraph.appendChild(renderjson(data))
}