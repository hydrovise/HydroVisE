<?php

$seconds_to_cache = 3600;
$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");
ob_start("ob_gzhandler");

$_base = "/var/www/html/smap/retro";
#$fn = '/itime_data/2016/Q_ifc_nwm_tar/20161030_23/06904010.csv';

if (isset($_GET['fn'])){
    $fn = $_GET['fn'];
}

$fn = sprintf("phar://%s/%s.tar/%s", $_base, dirname($fn), basename($fn));
echo file_get_contents($fn);
