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

date_default_timezone_set('America/Chicago');

if (isset ($_GET['path'])){
    $_path = $_GET['path'];
} else {
    echo "dt,Q\n";
    exit;
}

$full_path = "/home/hygis_data/$_path.gz";

if (file_exists ($full_path)) {
    header("Content-Encoding: gzip");
    echo file_get_contents($full_path);
    exit;
}

?>