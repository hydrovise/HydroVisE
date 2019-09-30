var arr_color = {
    timing: {
        color_table: [
            '#0000FF',
            '#4040FF',
            '#8080FF',
            '#bfbfFF',
            '#ffffFF',
            '#ffffFF',
            '#ffbfbf',
            '#FF8080',
            '#FF4040',
            '#FF0000',
        ],
        min: -30,
        max: 24,
        step: 6,
        reverse: true,
        show_min: false,
        round: 1,
        c_len: 1.0 / 6.0
    },
    // pt_change_vol: {
    //     color_table: [
    //         '#67001f',
    //         '#b2182b',
    //         '#d6604d',
    //         '#f4a582',
    //         '#fddbc7',
    //         '#d1e5f0',
    //         '#92c5de',
    //         '#4393c3',
    //         '#2166ac',
    //         '#053061',
    //     ],
    //     min: -125,
    //     max:  100,
    //     step: 25,
    //     reverse: true,
    //     show_min: false,
    //     round: 10,
    //     c_len: 10.0
    // },
    pt_change_vol: {
        color_table: [
            '#053061',
            '#2166ac',
            '#4393c3',
            '#92c5de',
            '#d1e5f0',
            '#fddbc7',
            '#f4a582',
            '#d6604d',
            '#b2182b',
            '#67001f',
        ],
        min: -125,
        max: 100,
        step: 25,
        reverse: true,
        show_min: false,
        round: 1,
        c_len: 1.0 / 25
    },
    cc: {
        color_table: [
            '#FFFFCC',
            '#FFFD46',
            '#ADFF2F',
            '#32CD32',
            '#008000',
        ],
        min: 0,
        max: 0.8,
        reverse: true,
        show_min: true,
        step: 0.2,
        round: 10,
        c_len: 5
    },
    nrmse: {
        color_table: [
            '#FFFFCC',
            '#FDFF46',
            '#FFAD2F',
            '#CD3232',
            '#800000',
        ],
        min: 0,
        max: 2,
        step: 0.5,
        round: 100,
        reverse: true,
        show_min: true,
        c_len: 2
    },
    nMAE: {
        color_table: [
            '#FFFFCC',
            '#FDFF46',
            '#FFAD2F',
            '#CD3232',
            '#800000',
        ],
        min: 0,
        step: 0.005,
        max: 0.02,
        round: 1000,
        reverse: true,
        show_min: true,
        c_len: 200
    },
    mae: {
        color_table: [
            '#FFFFCC',
            '#FDFF46',
            '#FFAD2F',
            '#CD3232',
            '#800000',
        ],
        min: 0,
        step: 0.005,
        max: 0.02,
        round: 1000,
        reverse: true,
        show_min: true,
        c_len: 200
    },
    kge: {
        color_table: [
            '#ffffe0',
            '#ffdaa3',
            '#ffb27c',
            '#fb8768',
            '#eb5f5b',
            '#d3394a',
            '#b3152f',
            '#8b0000',
        ],
        min: -0.1,
        max: 0.6,
        step: 0.1,
        reverse: true,
        show_min: false,
        round: 10,
        c_len: 10
    },
    ppd: {
        color_table: [
            '#053061',
            '#2166ac',
            '#4393c3',
            '#92c5de',
            '#d1e5f0',
            '#fddbc7',
            '#f4a582',
            '#d6604d',
            '#b2182b',
            '#67001f',
        ],
        min: -1.25,
        max: 1,
        step: .25,
        reverse: true,
        show_min: false,
        round: 4,
        c_len: 1.0 / .25
    }

};
// kge: {
//     color_table: [
//         '#ffFFff',
//         '#eeeeff',
//         '#ccccff',
//         '#9999ff',
//         '#6666ff',
//         '#3333ff',
//         '#000080',
//     ],
//         min: -0.1,
//         max: 0.5,
//         step: 0.1,
//         reverse: true,
//         show_min: false,
//         round: 10,
//         c_len: 10
// }
// kge: {
//     color_table: [
//         '#ffffe0',
//         '#ffdaa3',
//         '#ffb27c',
//         '#fb8768',
//         '#eb5f5b',
//         '#d3394a',
//         '#b3152f',
//         '#8b0000',
//     ],
//         min: -0.1,
//         max: 0.6,
//         step: 0.1,
//         reverse: true,
//         show_min: false,
//         round: 10,
//         c_len: 10
// }
// }

function vColor(_var, _val) {
    rv = Math.max(
        Math.min(
            arr_color[_var].max,
            _val
        ),
        arr_color[_var].min
    )
    rvs = rv - arr_color[_var].min;
    rvsn = Math.floor(rvs * arr_color[_var].c_len);
    return arr_color[_var].color_table[rvsn]
}


function generateColorBar(selected) {
    var colors = arr_color[selected].color_table;
    var step = arr_color[selected].step;
    var vmin = arr_color[selected].min;
    var rev = arr_color[selected].reverse;
    var show_min = arr_color[selected].show_min;
    var zero = 0;
    var rnd = arr_color[selected].round;

    bins = Array.apply(
        null, Array(colors.length)
    ).map(function (_, i) {
        return Math.round((i * step + vmin) * rnd) / rnd;
    });

    var zip = bins.map(
        function (e, i) {
            return [
                e,
                colors[i]
            ];
        }
    );


    if (rev) {
        zip = zip.reverse();
        zero = zip.length - 1;
    }

    if (!show_min) zip[zero][0] = '';
    var bar_height = Math.floor(600 / colors.length)
    let metric_name = selected.toUpperCase();
    // WHY WOULD YOU DO THIS...
    if (selected == 'pt_change_vol'){
        metric_name = '% vol diff'
    } else if (selected==='correlationcoefficient'){
        metric_name = 'CC'
    }

    var str_div_bars = '<div id="colorbar">' +  '<p style="font-size:20px;font-weight: 400;color: #111111">'+metric_name+ '</p>';
    zip.forEach(
        function (element) {
            str_div_bars += '<div class="bar-row" style="height: {2}px"><div class="bar bar-label">{0}</div><div class="bar" style="background-color:{1}")></div></div>'.format(element[0], element[1], bar_height);
        }
    );
    $("#colorbar").replaceWith(str_div_bars + '</div>');
}
