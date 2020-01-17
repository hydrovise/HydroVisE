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

if (file_exists ($_dst) && trim($c_yr) != trim($_yr)) {
    header("Content-Encoding: gzip");
    echo file_get_contents($_dst);
    exit;
}

ob_start("ob_gzhandler");

$src_url = "https://nwis.waterservices.usgs.gov/nwis/iv/?format=rdb&sites=%s&startDT=%s-01-01&endDT=%s-12-31&parameterCd=%s&siteStatus=all";
$cont = file_get_contents(sprintf($src_url, $_sid, $_yr, $_yr, $_par));
$resp = "dt,Q\n";

foreach (explode("\n", $cont) as $line) {
    $flds = explode("\t", $line);
    //echo substr($flds[3], 0, 5), $flds[3];
    //continue;
    if ($flds[0] == 'USGS') {
        $resp .= sprintf(
            //"%s %s,%s\n", 
            "%s,%s\n", 
            $flds[2], 
            //substr($flds[3], 0, 5),
            is_numeric($flds[4]) ? number_format(floatval($flds[4]) * $_conv,2,'.','') : $flds[4]
        );
    }
}
echo $resp;

if (trim($c_yr) == trim($_yr) || strlen($resp)==0) exit;

if (!is_dir("$local_store/$_yr")) {
    mkdir ("$local_store/$_yr", 0775);
}


$fh = gzopen ($_dst, 'w9');
gzwrite ($fh, $resp);
gzclose($fh);

?>