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
# ob_start("ob_gzhandler");
header("Content-Encoding: gzip");

date_default_timezone_set('America/Chicago');

$c_yr = date('Y', time());

if (isset ($_GET['yr'])){
    $_yr = $_GET['yr'];
} else {
    echo "dt,Q\n";
    exit;
}

if (isset($_GET['sid'])){
    $_sid = $_GET['sid'];

} else {
    echo "dt,Q\n";
    exit;
}

$_par   = "00060";
if (isset ($_GET['par'])){
    $_par = $_GET['par'];    
}

$_conv = 1/35.3147;
if (isset ($_GET['conv'])){
    $_conv = $_GET['conv'];
}


$local_store = "/home/hygis_data/usgs/$_par";
$_dst = sprintf("%s/%s/%s.csv.gz", $local_store, $_yr, $_sid);

if (file_exists ($_dst)) {
    echo file_get_contents($_dst);
    exit;
}



?>