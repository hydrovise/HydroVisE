function ini() {
    map = L.map(
        'map',
        {
            center: [41.9472, -93.5403],
            zoom: 8,
            maxZoom: 15,
            // renderer: L.svg()
        }
    );
    group = L.featureGroup().addTo(map)
    var basemap = L.tileLayer(
        url, {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        }
    );

    basemap.addTo(map);
    map.getRenderer(map).options.padding = 0;

    var printer = L.easyPrint(
        {
            tileLayer: basemap,
            sizeModes: ['Current', 'A4Landscape', 'A4Portrait', 'A3Size'],
            filename: 'myMap',
            exportOnly: true,
            hideControlContainer: true
        }
    ).addTo(map);

    function manualPrint() {
        printer.printMap('CurrentSize', 'MyManualPrint')
    }

    var A3Size = {
        width: 8000,
        height: 5000,
        className: 'a3CssClass',
        tooltip: 'A custom A3 size'
    };
    addCustBaseMap(config.customBaseMap);
    Papa.parse('data/lid_usgs.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            lid_usgs = results.data;
            Papa.parse('data/metrics/metrics.csv', {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    metrics = results.data;
                    draw_markers(metrics, systemState.metric, systemState.yr, systemState.sim_type)
                }
            });
        }
    });
}