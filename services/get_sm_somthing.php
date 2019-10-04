<?php

ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
date_default_timezone_set('America/Chicago');
ob_start("ob_gzhandler");

$seconds_to_cache = 3600;
$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");

function pathInterpret($path){
    $_arr = explode("/", trim($path, '/'));
    $_args = [];
    //echo "\n\n", count($_arr), "\n\n";
    if (count($_arr) != 2) return False;

    $_args += array("yr"=>$_arr[0]);
    $_args += array("xy"=>$_arr[1]);

    return $_args;
}

if (isset($_GET['path'])){
    $path = $_GET['path'];
    $args = pathInterpret($path) or die('Incomplete path!');
} else {
    die('Missing path!');
}

$_qr ="with lut as (
	SELECT gst_name, grid_xy FROM (VALUES
('Beaver1'	    ,100480015),
('Beaver2'	    ,100480015),
('Beaver3'	    ,100480014),
('FB01'	        ,100500012),
('FB02'	        ,100520014),
('FB03'	        ,100560014),
('NF01'	        ,100380023),
('NF02'	        ,100380023),
('NF03'	        ,100390022),
('NF04'	        ,100400020),
('NF05'	        ,100410022),
('NRG06'	    ,100360027),
('Otter1'	    ,100580017),
('Otter2'	    ,100560016),
('Otter3'	    ,100570017),
('Otter4'	    ,100560017),
('Otter5'	    ,100580016),
('SChequest1'   ,100520040),
('SChequest2'   ,100510040),
('SChequest3'   ,100510039),
('TU02'	        ,100520013),
('TU03'	        ,100510014),
('TU05'	        ,100550014),
('TU06'	        ,100570015),
('TU07'	        ,100530015),
('TU08'	        ,100540016),
('TU12'	        ,100580018),
('TU13'	        ,100590015),
('TU14'	        ,100590017),
('TU16'	        ,100600018),
('TU17'	        ,100630019),
('TU18'	        ,100610020),
('TU19'	        ,100610016),
('TU20'	        ,100550017),
('Walnut01'     ,100400031),
('Walnut02'     ,100410031),
('Walnut03'     ,100400031)

) as ctx (gst_name, grid_xy)
),
gid as (
SELECT
    gst_id
FROM
    instrument_network.observatory O
INNER JOIN lut L
    ON lower(O.gst_name) = lower(L.gst_name)
WHERE
grid_xy = %s
),
dt_grid as (SELECT generate_series('%s-01-01 00:00-06', '%s-01-01 00:00-06'::timestamp with time zone + '1 year'::interval, '1 hour'::interval)::timestamp with time zone dt)

SELECT
    to_char(
        date_trunc('hour', G.dt),
        'YYYY-MM-DD HH24:MI'
    ) as dt,
	avg(vwc)::numeric(4,3) sm
FROM
    dt_grid G
LEFT JOIN
    _instrument_soil.data_soil_cs65x_%s D
ON
    G.dt = date_trunc('hour', D.time_utc)
WHERE
	gst_id in (SELECT gst_id FROM gid)  and
	probe_depth = 5 and
	vwc < 0.55 and
	vwc > 0.05
GROUP BY dt
ORDER BY dt;";

$qr = sprintf($_qr, $args['xy'], $args['yr'], $args['yr'], $args['yr']);
$conn = pg_connect("host=localhost dbname=ifc_ground user=rgoska") or die('connection failed');
$res = pg_query($qr);


pg_close($conn);

$resp_arr = array('dt,sm');
while ($row = pg_fetch_row($res)) {
  array_push(
    $resp_arr,
        sprintf(
            "%s,%s",
            $row[0],
            $row[1] == 'NaN' ? '' : $row[1]
        )
    );
}

echo isset($_GET['callback']) ? "{$_GET['callback']}(" . implode("\n", $resp_arr) .")" : implode("\n", $resp_arr)  ;

?>