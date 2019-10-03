<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$seconds_to_cache = 3600;
$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
header("Access-Control-Allow-Origin: *");
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");
ob_start("ob_gzhandler");

date_default_timezone_set('America/Chicago');

function pathInterpret($path){
    function xy2x_y($x_y){
        //Echo $x_y;
        $x = intval(floor(($x_y - 100000000)/10000));
        $y = $x_y % 10000;
        return array(
            "x" => $x, 
            "y" => $y
        );
    }
    
    $_arr = explode("/", trim($path,'/'));
    $_args = [];
    //echo "\n\n", count($_arr), "\n\n";
    if (count($_arr) != 3) return False;
    
    $_args += xy2x_y($_arr[2]);
    $_args += array("prd"=>$_arr[0]);
    $_args += array("yr"=>$_arr[1]);
    
    return $_args;
}

if (isset($_GET['path'])){    
    $path = $_GET['path'];
    $args = pathInterpret($path) or die('Incomplete path!');
} else {
    die('Missing path!');
}

$_dbq = array(
    "smos" => array(
        "db" => "rt_smos",
        "qr" => "WITH sub_lut as (
        SELECT 
            * 
        FROM 
            env_lookup_smos_smap 
        WHERE x_smap = %s and y_smap = %s
        )

        SELECT
                to_char(
                    date_trunc('hour', to_timestamp(tb_time_utc)),
                    'YYYY-MM-DD HH24:MI'
                ) as dt,
                sum(soil_moisture*contrib) val
         	FROM
         	    smos_l2.data
        	INNER JOIN sub_lut USING (smos_id)
            WHERE 
                tb_time_utc BETWEEN 
                extract ('epoch' FROM '%s-01-01 00:00-00'::timestamp with time zone) AND 
                extract ('epoch' FROM '%s-01-01 00:00-00'::timestamp with time zone + '1 year'::interval)
        GROUP BY 
            date_trunc('hour', to_timestamp(tb_time_utc)), 
            x_smap, 
            y_smap
        ORDER BY date_trunc('hour', to_timestamp(tb_time_utc));"
    ),
    "smap_l3" => array (
        "db"=>"rt_smap",
        "qr"=> "SELECT 
            to_char(
                date_trunc('hour', tb_time_utc),
                'YYYY-MM-DD HH24:MI'
            ) as dt, 
            soil_moisture sm
        FROM 
            smap_l3_v2.data
        WHERE             
            grid_x=%s AND 
            grid_y=%s AND
            tb_time_utc between 
                '%s-01-01 00:00-00'::timestamp with time zone AND 
                '%s-01-01 00:00-00'::timestamp with time zone + '1 year'::interval
            
        ORDER BY tb_time_utc;"
      
    ),
    "smap_l4_surface" => array (
        "db"=>"rt_smap",
        "qr"=> "SELECT 
            to_char(
                date_trunc('hour', sm_time),
                'YYYY-MM-DD HH24:MI'
            ) as dt,             
	        sm_surface	        
        FROM 
            smap_l4.data
        WHERE             
            grid_x=%s AND 
            grid_y=%s AND
            sm_time BETWEEN 
                '%s-01-01 00:00-00'::timestamp with time zone AND 
                '%s-01-01 00:00-00'::timestamp with time zone + '1 year'::interval
            
        ORDER BY sm_time;"

    ),
    "smap_l4_rootzone" => array (
        "db"=>"rt_smap",
        "qr"=> "SELECT 
            to_char(
                date_trunc('hour', sm_time),
                'YYYY-MM-DD HH24:MI'
            ) as dt,             
	        sm_rootzone	        
        FROM 
            smap_l4.data
        WHERE             
            grid_x=%s AND 
            grid_y=%s AND
            sm_time BETWEEN 
                '%s-01-01 00:00-00'::timestamp with time zone AND 
                '%s-01-01 00:00-00'::timestamp with time zone + '1 year'::interval
            
        ORDER BY sm_time;"

    ),
    "smap_l4_profile" => array (
        "db"=>"rt_smap",
        "qr"=> "SELECT 
            to_char(
                date_trunc('hour', sm_time),
                'YYYY-MM-DD HH24:MI'
            ) as dt,             
	        sm_profile	        
        FROM 
            smap_l4.data
        WHERE             
            grid_x=%s AND 
            grid_y=%s AND
            sm_time BETWEEN 
                '%s-01-01 00:00-00'::timestamp with time zone AND 
                '%s-01-01 00:00-00'::timestamp with time zone + '1 year'::interval
            
        ORDER BY sm_time;"

    )
);
$dbname = $_dbq[$args["prd"]]["db"];
$_qr = $_dbq[$args["prd"]]["qr"];



//echo "$_qr\n\n"    ;
$qr = sprintf($_qr, $args['x'], $args['y'], $args['yr'], $args['yr']);

$conn = pg_connect("host=s-iihr51.iihr.uiowa.edu dbname=$dbname user=navid password=SMAPtest123 port=5435") or die('connection failed');

$res = pg_query($qr);
echo "dt,sm\n";
while ($row = pg_fetch_row($res)) {
  echo $row[0], ",", $row[1] == 'NaN' ? '' : $row[1], "\n";
}
pg_close($conn);

?>