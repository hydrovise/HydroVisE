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

$_id = -1;
if (isset($_GET['id'])){
    $_id = $_GET['id'];
} else {
    die;
}


$trans = array(
    array('hlm90_lid'=> 178160,	'ifis_id'=>665,		'usgs_id'=>'06809210',	'nws_id'=>'ATCI4',	'lat'=>41.346101,	'lng'=>-95.076936),
    array('hlm90_lid'=> 272942,	'ifis_id'=>620,		'usgs_id'=>'05471500',	'nws_id'=>'OOAI4',	'lat'=>41.355699,	'lng'=>-92.657359),
    array('hlm90_lid'=> 465190,	'ifis_id'=>605,		'usgs_id'=>'05459500',	'nws_id'=>'MCWI4',	'lat'=>43.164962,	'lng'=>-93.192703),
    array('hlm90_lid'=> 367813,	'ifis_id'=>612,		'usgs_id'=>'05464500',	'nws_id'=>'CIDI4',	'lat'=>41.971945,	'lng'=>-91.667124),
    array('hlm90_lid'=> 367593,	'ifis_id'=>609,		'usgs_id'=>'05464000',	'nws_id'=>'ALOI4',	'lat'=>42.495542,	'lng'=>-92.334352),
    array('hlm90_lid'=> 397674,	'ifis_id'=>654,		'usgs_id'=>'06600500',	'nws_id'=>'JMEI4',	'lat'=>42.576660,	'lng'=>-96.311416),
    array('hlm90_lid'=> 426049,	'ifis_id'=>593,		'usgs_id'=>'05421740',	'nws_id'=>'ANSI4',	'lat'=>42.083339,	'lng'=>-91.267382),
    array('hlm90_lid'=> 553137,	'ifis_id'=>648,		'usgs_id'=>'06483290',	'nws_id'=>'RAPI4',	'lat'=>43.422972,	'lng'=>-96.164887),
    array('hlm90_lid'=> 203851,	'ifis_id'=>571,		'usgs_id'=>'05487520',	'nws_id'=>'SWNI4',	'lat'=>41.489400,	'lng'=>-93.278250),
    array('hlm90_lid'=> 503998,	'ifis_id'=>519,		'usgs_id'=>'05387440',	'nws_id'=>'BLFI4',	'lat'=>43.406913,	'lng'=>-91.899046),
    array('hlm90_lid'=> 104818,	'ifis_id'=>671,		'usgs_id'=>'06903400',	'nws_id'=>'CHTI4',	'lat'=>40.951890,	'lng'=>-93.259848),
    array('hlm90_lid'=> 483619,	'ifis_id'=>523,		'usgs_id'=>'05411600',	'nws_id'=>'SPLI4',	'lat'=>43.207278,	'lng'=>-91.950333),
    array('hlm90_lid'=> 157405,	'ifis_id'=>666,		'usgs_id'=>'06809500',	'nws_id'=>'RDOI4',	'lat'=>41.008604,	'lng'=>-95.241658),
    array('hlm90_lid'=> 313504,	'ifis_id'=>616,		'usgs_id'=>'05470000',	'nws_id'=>'AMEI4',	'lat'=>42.066513,	'lng'=>-93.620134),
    array('hlm90_lid'=> 465030,	'ifis_id'=>649,		'usgs_id'=>'06483500',	'nws_id'=>'RKVI4',	'lat'=>43.214426,	'lng'=>-96.294471),
    array('hlm90_lid'=> 434514,	'ifis_id'=>589,		'usgs_id'=>'05412500',	'nws_id'=>'GRBI4',	'lat'=>42.739988,	'lng'=>-91.261799),
    array('hlm90_lid'=> 78279,	'ifis_id'=>669,		'usgs_id'=>'06819185',	'nws_id'=>'BDFI4',	'lat'=>40.660543,	'lng'=>-94.716636),
    array('hlm90_lid'=> 387745,	'ifis_id'=>650,		'usgs_id'=>'06599900',	'nws_id'=>'PCMI4',	'lat'=>42.693333,	'lng'=>-96.370000),
    array('hlm90_lid'=> 323592,	'ifis_id'=>551,		'usgs_id'=>'05463500',	'nws_id'=>'HUDI4',	'lat'=>42.407764,	'lng'=>-92.463245),
    array('hlm90_lid'=> 83159,	'ifis_id'=>672,		'usgs_id'=>'06903700',	'nws_id'=>'PRMI4',	'lat'=>40.800561,	'lng'=>-93.192430),
    array('hlm90_lid'=> 273761,	'ifis_id'=>662,		'usgs_id'=>'06609500',	'nws_id'=>'LGNI4',	'lat'=>41.642490,	'lng'=>-95.782786),
    array('hlm90_lid'=> 273299,	'ifis_id'=>622,		'usgs_id'=>'05474000',	'nws_id'=>'AGSI4',	'lat'=>40.753650,	'lng'=>-91.277094),
    array('hlm90_lid'=> 285449,	'ifis_id'=>591,		'usgs_id'=>'05418500',	'nws_id'=>'MAQI4',	'lat'=>42.083353,	'lng'=>-90.632912),
    array('hlm90_lid'=> 279587,	'ifis_id'=>566,		'usgs_id'=>'05483600',	'nws_id'=>'PANI4',	'lat'=>41.687209,	'lng'=>-94.371077),
    array('hlm90_lid'=> 522951,	'ifis_id'=>602,		'usgs_id'=>'05458300',	'nws_id'=>'WVLI4',	'lat'=>42.737220,	'lng'=>-92.470090),
    array('hlm90_lid'=> 504030,	'ifis_id'=>585,		'usgs_id'=>'05387500',	'nws_id'=>'DEHI4',	'lat'=>43.304889,	'lng'=>-91.795543),
    array('hlm90_lid'=> 317905,	'ifis_id'=>596,		'usgs_id'=>'05451500',	'nws_id'=>'MIWI4',	'lat'=>42.065821,	'lng'=>-92.907700),
    array('hlm90_lid'=> 378559,	'ifis_id'=>632,		'usgs_id'=>'05482000',	'nws_id'=>'DMOI4',	'lat'=>41.612489,	'lng'=>-93.621051),
    array('hlm90_lid'=> 240462,	'ifis_id'=>621,		'usgs_id'=>'05472500',	'nws_id'=>'SIGI4',	'lat'=>41.300845,	'lng'=>-92.204626),
    array('hlm90_lid'=> 216572,	'ifis_id'=>663,		'usgs_id'=>'06807410',	'nws_id'=>'HNKI4',	'lat'=>41.389992,	'lng'=>-95.371667),
    array('hlm90_lid'=> 275929,	'ifis_id'=>631,		'usgs_id'=>'05481950',	'nws_id'=>'GRMI4',	'lat'=>41.688322,	'lng'=>-93.735500),
    array('hlm90_lid'=> 217531,	'ifis_id'=>568,		'usgs_id'=>'05484800',	'nws_id'=>'DOSI4',	'lat'=>41.587211,	'lng'=>-93.703276),
    array('hlm90_lid'=> 374994,	'ifis_id'=>655,		'usgs_id'=>'06602020',	'nws_id'=>'HOKI4',	'lat'=>42.226935,	'lng'=>-96.078072),
    array('hlm90_lid'=> 522855,	'ifis_id'=>601,		'usgs_id'=>'05457700',	'nws_id'=>'CCYI4',	'lat'=>43.062195,	'lng'=>-92.673884),
    array('hlm90_lid'=> 326674,	'ifis_id'=>660,		'usgs_id'=>'06607500',	'nws_id'=>'TURI4',	'lat'=>41.964432,	'lng'=>-95.972788),
    array('hlm90_lid'=> 108201,	'ifis_id'=>644,		'usgs_id'=>'05489000',	'nws_id'=>'BSSI4',	'lat'=>41.219002,	'lng'=>-92.908533),
    array('hlm90_lid'=> 368052,	'ifis_id'=>613,		'usgs_id'=>'05465000',	'nws_id'=>'CNEI4',	'lat'=>41.409192,	'lng'=>-91.290434),
    array('hlm90_lid'=> 334449,	'ifis_id'=>634,		'usgs_id'=>'05482500',	'nws_id'=>'EFWI4',	'lat'=>41.988039,	'lng'=>-94.376913),
    array('hlm90_lid'=> 204188,	'ifis_id'=>646,		'usgs_id'=>'05490500',	'nws_id'=>'KEQI4',	'lat'=>40.727806,	'lng'=>-91.959617),
    array('hlm90_lid'=> 178416,	'ifis_id'=>640,		'usgs_id'=>'05486000',	'nws_id'=>'NRWI4',	'lat'=>41.457907,	'lng'=>-93.654969),
    array('hlm90_lid'=> 425876,	'ifis_id'=>592,		'usgs_id'=>'05421000',	'nws_id'=>'IDPI4',	'lat'=>42.463598,	'lng'=>-91.895172),
    array('hlm90_lid'=> 555865,	'ifis_id'=>625,		'usgs_id'=>'05476750',	'nws_id'=>'HBTI4',	'lat'=>42.719416,	'lng'=>-94.220518),
    array('hlm90_lid'=> 326618,	'ifis_id'=>659,		'usgs_id'=>'06607200',	'nws_id'=>'MAPI4',	'lat'=>42.156934,	'lng'=>-95.810007),
    array('hlm90_lid'=> 448250,	'ifis_id'=>656,		'usgs_id'=>'06605000',	'nws_id'=>'SPOI4',	'lat'=>43.128026,	'lng'=>-95.210830),
    array('hlm90_lid'=> 318079,	'ifis_id'=>597,		'usgs_id'=>'05453100',	'nws_id'=>'MROI4',	'lat'=>41.812726,	'lng'=>-92.064792),
    array('hlm90_lid'=> 367916,	'ifis_id'=>1688,	'usgs_id'=>	'05464780',	'nws_id'=>'CEBI4',	'lat'=>41.787222,	'lng'=>-91.313750),
    array('hlm90_lid'=> 203920,	'ifis_id'=>573,		'usgs_id'=>'05488110',	'nws_id'=>'RRDI4',	'lat'=>41.360553,	'lng'=>-92.973256),
    array('hlm90_lid'=> 406874,	'ifis_id'=>604,		'usgs_id'=>'05458900',	'nws_id'=>'FNHI4',	'lat'=>42.629426,	'lng'=>-92.543522),
    array('hlm90_lid'=> 434478,	'ifis_id'=>588,		'usgs_id'=>'05412020',	'nws_id'=>'EKDI4',	'lat'=>42.843485,	'lng'=>-91.401277),
    array('hlm90_lid'=> 326673,	'ifis_id'=>575,		'usgs_id'=>'06602400',	'nws_id'=>'',		'lat'=>41.964432,	'lng'=>-95.991955),
    array('hlm90_lid'=> 318225,	'ifis_id'=>598,		'usgs_id'=>'05454500',	'nws_id'=>'IOWI4',	'lat'=>41.656683,	'lng'=>-91.541002),
    array('hlm90_lid'=> 350386,	'ifis_id'=>607,		'usgs_id'=>'05463000',	'nws_id'=>'NHRI4',	'lat'=>42.572759,	'lng'=>-92.617970),
    array('hlm90_lid'=> 179425,	'ifis_id'=>641,		'usgs_id'=>'05486490',	'nws_id'=>'IDNI4',	'lat'=>41.424158,	'lng'=>-93.587439),
    array('hlm90_lid'=> 412870,	'ifis_id'=>562,		'usgs_id'=>'05480820',	'nws_id'=>'GLDI4',	'lat'=>42.724417,	'lng'=>-93.946694),
    array('hlm90_lid'=> 92010,	'ifis_id'=>579,		'usgs_id'=>'06903900',	'nws_id'=>'RABI4',	'lat'=>40.821872,	'lng'=>-92.891254),
    array('hlm90_lid'=> 197506,	'ifis_id'=>637,		'usgs_id'=>'05484650',	'nws_id'=>'DMWI4',	'lat'=>41.561656,	'lng'=>-93.703554),
    array('hlm90_lid'=> 162846,	'ifis_id'=>642,		'usgs_id'=>'05487470',	'nws_id'=>'AKWI4',	'lat'=>41.337216,	'lng'=>-93.486325),
    array('hlm90_lid'=> 368221,	'ifis_id'=>590,		'usgs_id'=>'05416900',	'nws_id'=>'MCHI4',	'lat'=>42.469988,	'lng'=>-91.448715),
    array('hlm90_lid'=> 368142,	'ifis_id'=>615,		'usgs_id'=>'05465700',	'nws_id'=>'OKVI4',	'lat'=>41.103194,	'lng'=>-91.063528),
    array('hlm90_lid'=> 367769,	'ifis_id'=>611,		'usgs_id'=>'05464420',	'nws_id'=>'PLOI4',	'lat'=>42.069163,	'lng'=>-91.785180),
    array('hlm90_lid'=> 314529,	'ifis_id'=>526,		'usgs_id'=>'05418400',	'nws_id'=>'',		'lat'=>42.164405,	'lng'=>-90.728246),
    array('hlm90_lid'=> 450755,	'ifis_id'=>653,		'usgs_id'=>'06600100',	'nws_id'=>'ALTI4',	'lat'=>42.981931,	'lng'=>-96.001129),
    array('hlm90_lid'=> 278516,	'ifis_id'=>661,		'usgs_id'=>'06608500',	'nws_id'=>'PSGI4',	'lat'=>41.830544,	'lng'=>-95.931399),
    array('hlm90_lid'=> 487254,	'ifis_id'=>658,		'usgs_id'=>'06606600',	'nws_id'=>'CRRI4',	'lat'=>42.482278,	'lng'=>-95.792889),
    array('hlm90_lid'=> 203941,	'ifis_id'=>643,		'usgs_id'=>'05488500',	'nws_id'=>'TRCI4',	'lat'=>41.281391,	'lng'=>-92.861504),
    array('hlm90_lid'=> 426239,	'ifis_id'=>594,		'usgs_id'=>'05422000',	'nws_id'=>'DEWI4',	'lat'=>41.766974,	'lng'=>-90.534859),
    array('hlm90_lid'=> 317961,	'ifis_id'=>1609,	'usgs_id'=>'05451770',	'nws_id'=>'TMAI4',	'lat'=>41.964256,	'lng'=>-92.636550),
    array('hlm90_lid'=> 143605,	'ifis_id'=>574,		'usgs_id'=>'05488200',	'nws_id'=>'KECI4',	'lat'=>41.300553,	'lng'=>-93.045481),
    array('hlm90_lid'=> 334282,	'ifis_id'=>564,		'usgs_id'=>'05482300',	'nws_id'=>'SCRI4',	'lat'=>42.354427,	'lng'=>-94.990822),
    array('hlm90_lid'=> 368123,	'ifis_id'=>614,		'usgs_id'=>'05465500',	'nws_id'=>'WAPI4',	'lat'=>41.178086,	'lng'=>-91.182094),
    array('hlm90_lid'=> 272678,	'ifis_id'=>618,		'usgs_id'=>'05471000',	'nws_id'=>'AESI4',	'lat'=>42.006653,	'lng'=>-93.595495),
    array('hlm90_lid'=> 318037,	'ifis_id'=>580,		'usgs_id'=>'05452500',	'nws_id'=>'BPLI4',	'lat'=>41.855560,	'lng'=>-92.238890),
    array('hlm90_lid'=> 318272,	'ifis_id'=>600,		'usgs_id'=>'05455700',	'nws_id'=>'LNTI4',	'lat'=>41.423139,	'lng'=>-91.475278),
    array('hlm90_lid'=> 504104,	'ifis_id'=>586,		'usgs_id'=>'05388250',	'nws_id'=>'DCHI4',	'lat'=>43.421084,	'lng'=>-91.508752),
    array('hlm90_lid'=> 437890,	'ifis_id'=>595,		'usgs_id'=>'05449500',	'nws_id'=>'ROWI4',	'lat'=>42.759944,	'lng'=>-93.621849),
    array('hlm90_lid'=> 132569,	'ifis_id'=>572,		'usgs_id'=>'05487980',	'nws_id'=>'DLLI4',	'lat'=>41.246639,	'lng'=>-93.290167),
    array('hlm90_lid'=> 216714,	'ifis_id'=>664,		'usgs_id'=>'06808500',	'nws_id'=>'RDPI4',	'lat'=>40.873055,	'lng'=>-95.580275),
    array('hlm90_lid'=> 197256,	'ifis_id'=>599,		'usgs_id'=>'05455500',	'nws_id'=>'KALI4',	'lat'=>41.469739,	'lng'=>-91.714613),
    array('hlm90_lid'=> 378537,	'ifis_id'=>563,		'usgs_id'=>'05481650',	'nws_id'=>'SDTI4',	'lat'=>41.680544,	'lng'=>-93.668276),
    array('hlm90_lid'=> 399711,	'ifis_id'=>525,		'usgs_id'=>'05412400',	'nws_id'=>'VLPI4',	'lat'=>42.753875,	'lng'=>-91.369025),
    array('hlm90_lid'=> 229021,	'ifis_id'=>570,		'usgs_id'=>'05485640',	'nws_id'=>'DFMI4',	'lat'=>41.613878,	'lng'=>-93.545493),
    array('hlm90_lid'=> 487052,	'ifis_id'=>657,		'usgs_id'=>'06605850',	'nws_id'=>'LNNI4',	'lat'=>42.895811,	'lng'=>-95.243330),
    array('hlm90_lid'=> 434365,	'ifis_id'=>587,		'usgs_id'=>'05411850',	'nws_id'=>'EDRI4',	'lat'=>43.054188,	'lng'=>-91.809098),
    array('hlm90_lid'=> 157543,	'ifis_id'=>667,		'usgs_id'=>'06810000',	'nws_id'=>'HMBI4',	'lat'=>40.601667,	'lng'=>-95.645000),
    array('hlm90_lid'=> 292251,	'ifis_id'=>617,		'usgs_id'=>'05470500',	'nws_id'=>'AMWI4',	'lat'=>42.023042,	'lng'=>-93.630496),
    array('hlm90_lid'=> 79118,	'ifis_id'=>670,		'usgs_id'=>'06898000',	'nws_id'=>'DVSI4',	'lat'=>40.640280,	'lng'=>-93.808280),
    array('hlm90_lid'=> 272783,	'ifis_id'=>619,		'usgs_id'=>'05471050',	'nws_id'=>'CFXI4',	'lat'=>41.681378,	'lng'=>-93.246594),
    array('hlm90_lid'=> 432886,	'ifis_id'=>606,		'usgs_id'=>'05462000',	'nws_id'=>'SHRI4',	'lat'=>42.711925,	'lng'=>-92.582966),
    array('hlm90_lid'=> 367567,	'ifis_id'=>608,		'usgs_id'=>'05463050',	'nws_id'=>'CEDI4',	'lat'=>42.537583,	'lng'=>-92.443306),
    array('hlm90_lid'=> 204046,	'ifis_id'=>645,		'usgs_id'=>'05489500',	'nws_id'=>'OTMI4',	'lat'=>41.010848,	'lng'=>-92.411296),
    array('hlm90_lid'=> 425748,	'ifis_id'=>527,		'usgs_id'=>'05420680',	'nws_id'=>'TPLI4',	'lat'=>42.836091,	'lng'=>-92.257400),
    array('hlm90_lid'=> 323529,	'ifis_id'=>534,		'usgs_id'=>'05451210',	'nws_id'=>'NPVI4',	'lat'=>42.314984,	'lng'=>-93.152425),
    array('hlm90_lid'=> 522980,	'ifis_id'=>603,		'usgs_id'=>'05458500',	'nws_id'=>'JANI4',	'lat'=>42.648316,	'lng'=>-92.465186),
    array('hlm90_lid'=> 197517,	'ifis_id'=>638,		'usgs_id'=>'05484900',	'nws_id'=>'DEMI4',	'lat'=>41.581656,	'lng'=>-93.642996),
    array('hlm90_lid'=> 92050,	'ifis_id'=>673,		'usgs_id'=>'06904010',	'nws_id'=>'MOLI4',	'lat'=>40.692517,	'lng'=>-92.772418),
    array('hlm90_lid'=> 202584,	'ifis_id'=>635,		'usgs_id'=>'05484000',	'nws_id'=>'REDI4',	'lat'=>41.589432,	'lng'=>-94.151346),
    array('hlm90_lid'=> 509679,	'ifis_id'=>549,		'usgs_id'=>'05458000',	'nws_id'=>'IONI4',	'lat'=>43.033280,	'lng'=>-92.503544),
    array('hlm90_lid'=> 463732,	'ifis_id'=>626,		'usgs_id'=>'05478265',	'nws_id'=>'AGNI4',	'lat'=>43.082278,	'lng'=>-94.230861),
    array('hlm90_lid'=> 463834,	'ifis_id'=>627,		'usgs_id'=>'05479000',	'nws_id'=>'DAKI4',	'lat'=>42.723582,	'lng'=>-94.193489),
    array('hlm90_lid'=> 378268,	'ifis_id'=>628,		'usgs_id'=>'05480500',	'nws_id'=>'FODI4',	'lat'=>42.508303,	'lng'=>-94.203573),
    array('hlm90_lid'=> 412946,	'ifis_id'=>629,		'usgs_id'=>'05481000',	'nws_id'=>'WBCI4',	'lat'=>42.432475,	'lng'=>-93.805776),
    array('hlm90_lid'=> 378371,	'ifis_id'=>630,		'usgs_id'=>'05481300',	'nws_id'=>'STRI4',	'lat'=>42.251920,	'lng'=>-93.996898),
    array('hlm90_lid'=> 197446,	'ifis_id'=>636,		'usgs_id'=>'05484500',	'nws_id'=>'VNMI4',	'lat'=>41.533878,	'lng'=>-93.949950),
    array('hlm90_lid'=> 203777,	'ifis_id'=>639,		'usgs_id'=>'05485500',	'nws_id'=>'DESI4',	'lat'=>41.577767,	'lng'=>-93.605495),
    array('hlm90_lid'=> 74725,	'ifis_id'=>647,		'usgs_id'=>'05494300',	'nws_id'=>'BMFI4',	'lat'=>40.769466,	'lng'=>-92.418796),
    array('hlm90_lid'=> 270936,	'ifis_id'=>535,		'usgs_id'=>'05451700',	'nws_id'=>'MTWI4',	'lat'=>42.008878,	'lng'=>-92.852421),
    array('hlm90_lid'=> 255051,	'ifis_id'=>536,		'usgs_id'=>'05451900',	'nws_id'=>'HAVI4',	'lat'=>41.899439,	'lng'=>-92.474355),
    array('hlm90_lid'=> 277520,	'ifis_id'=>537,		'usgs_id'=>'05452000',	'nws_id'=>'EBRI4',	'lat'=>41.964162,	'lng'=>-92.313242),
    array('hlm90_lid'=> 245378,	'ifis_id'=>538,		'usgs_id'=>'05452200',	'nws_id'=>'HRTI4',	'lat'=>41.834997,	'lng'=>-92.386297),
    array('hlm90_lid'=> 226574,	'ifis_id'=>544,		'usgs_id'=>'05454300',	'nws_id'=>'',		'lat'=>41.676682,	'lng'=>-91.598781),
    array('hlm90_lid'=> 426130,	'ifis_id'=>529,		'usgs_id'=>'05421760',	'nws_id'=>'OXJI4',	'lat'=>41.971944,	'lng'=>-90.960000),
    array('hlm90_lid'=> 522792,	'ifis_id'=>548,		'usgs_id'=>'05457505',	'nws_id'=>'OSGI4',	'lat'=>43.283472,	'lng'=>-92.852500),
    array('hlm90_lid'=> 432794,	'ifis_id'=>550,		'usgs_id'=>'05460400',	'nws_id'=>'RKFI4',	'lat'=>43.005389,	'lng'=>-92.925583),
    array('hlm90_lid'=> 216755,	'ifis_id'=>577,		'usgs_id'=>'06808820',	'nws_id'=>'WNSI4',	'lat'=>40.687139,	'lng'=>-95.600222),
    array('hlm90_lid'=> 486916,	'ifis_id'=>576,		'usgs_id'=>'06604440',	'nws_id'=>'LSSI4',	'lat'=>43.212778,	'lng'=>-95.239167),
    array('hlm90_lid'=> 318031,	'ifis_id'=>826,		'usgs_id'=>'05452500',	'nws_id'=>'',		'lat'=>41.859165,	'lng'=>-92.277962),
    array('hlm90_lid'=> 399598,	'ifis_id'=>524,		'usgs_id'=>'05412340',	'nws_id'=>'FAYI4',	'lat'=>42.844139,	'lng'=>-91.818167),
    array('hlm90_lid'=> 360567,	'ifis_id'=>1683,	'usgs_id'=>'05418110',	'nws_id'=>'',		'lat'=>42.470556,	'lng'=>-91.122222),
    array('hlm90_lid'=> 191552,	'ifis_id'=>1691,	'usgs_id'=>'06805850',	'nws_id'=>'',		'lat'=>41.102111,	'lng'=>-95.718417),
    array('hlm90_lid'=> 277781,	'ifis_id'=>1765,	'usgs_id'=>'05464695',	'nws_id'=>'',		'lat'=>42.030944,	'lng'=>-91.611859),
    array('hlm90_lid'=> 309414,	'ifis_id'=>552,		'usgs_id'=>'05464220',	'nws_id'=>'DYSI4',	'lat'=>42.251658,	'lng'=>-92.298798),
    array('hlm90_lid'=> 258321,	'ifis_id'=>554,		'usgs_id'=>'05471200',	'nws_id'=>'MGOI4',	'lat'=>41.805266,	'lng'=>-93.309374),
    array('hlm90_lid'=> 418967,	'ifis_id'=>1774,	'usgs_id'=>'05411900',	'nws_id'=>'',		'lat'=>42.952512,	'lng'=>-91.643016),
    array('hlm90_lid'=> 199682,	'ifis_id'=>531,		'usgs_id'=>'05422560',	'nws_id'=>'',		'lat'=>41.556697,	'lng'=>-90.687641),
    array('hlm90_lid'=> 273178,	'ifis_id'=>555,		'usgs_id'=>'05473065',	'nws_id'=>'',		'lat'=>41.088611,	'lng'=>-91.718583),
    array('hlm90_lid'=> 221500,	'ifis_id'=>546,		'usgs_id'=>'05455100',	'nws_id'=>'',		'lat'=>41.606405,	'lng'=>-91.615724),
    array('hlm90_lid'=> 228998,	'ifis_id'=>569,		'usgs_id'=>'05485605',	'nws_id'=>'ANKI4',	'lat'=>41.717377,	'lng'=>-93.570133),
    array('hlm90_lid'=> 226541,	'ifis_id'=>543,		'usgs_id'=>'05454220',	'nws_id'=>'',		'lat'=>41.718346,	'lng'=>-91.740174),
    array('hlm90_lid'=> 230973,	'ifis_id'=>542,		'usgs_id'=>'05454090',	'nws_id'=>'',		'lat'=>41.700000,	'lng'=>-91.562778),
    array('hlm90_lid'=> 221201,	'ifis_id'=>553,		'usgs_id'=>'05464942',	'nws_id'=>'',		'lat'=>41.669603,	'lng'=>-91.350636),
    array('hlm90_lid'=> 98104,	'ifis_id'=>668,		'usgs_id'=>'06817000',	'nws_id'=>'ICLI4',	'lat'=>40.743278,	'lng'=>-95.014194),
    array('hlm90_lid'=> 199722,	'ifis_id'=>532,		'usgs_id'=>'05422600',	'nws_id'=>'',		'lat'=>41.546144,	'lng'=>-90.524024),
    array('hlm90_lid'=> 318208,	'ifis_id'=>540,		'usgs_id'=>'05453520',	'nws_id'=>'CTWI4',	'lat'=>41.715293,	'lng'=>-91.530170),
    array('hlm90_lid'=> 447887,	'ifis_id'=>521,		'usgs_id'=>'05389000',	'nws_id'=>'',		'lat'=>43.111927,	'lng'=>-91.265132),
    array('hlm90_lid'=> 367697,	'ifis_id'=>610,		'usgs_id'=>'05464315',	'nws_id'=>'VINI4',	'lat'=>42.170828,	'lng'=>-92.023792),
    array('hlm90_lid'=> 110818,	'ifis_id'=>557,		'usgs_id'=>'05473450',	'nws_id'=>'',		'lat'=>41.006973,	'lng'=>-91.551550),
    array('hlm90_lid'=> 114284,	'ifis_id'=>556,		'usgs_id'=>'05473400',	'nws_id'=>'',		'lat'=>40.925305,	'lng'=>-91.674220),
    array('hlm90_lid'=> 431052,	'ifis_id'=>522,		'usgs_id'=>'05389400',	'nws_id'=>'',		'lat'=>43.040817,	'lng'=>-91.206519),
    array('hlm90_lid'=> 230601,	'ifis_id'=>539,		'usgs_id'=>'05453000',	'nws_id'=>'',		'lat'=>41.749447,	'lng'=>-92.182127),
    array('hlm90_lid'=> 279554,	'ifis_id'=>565,		'usgs_id'=>'05483450',	'nws_id'=>'',		'lat'=>41.778597,	'lng'=>-94.492749),
    array('hlm90_lid'=> 227265,	'ifis_id'=>541,		'usgs_id'=>'05454000',	'nws_id'=>'',		'lat'=>41.700017,	'lng'=>-91.487668),
    array('hlm90_lid'=> 555741,	'ifis_id'=>624,		'usgs_id'=>'05476590',	'nws_id'=>'EMTI4',	'lat'=>43.126111,	'lng'=>-94.705833)
);


foreach ($trans as $row) {    
    $_found = array_search($_id, $row);
    if ($_found) {
             echo file_get_contents (
             sprintf (
                "http://s-iihr50.iihr.uiowa.edu/smap/retro/data/staticLayers/basinBoundaries/%04d.kml", 
                $row['ifis_id']
            )
        );
    }
}              

//echo json_encode($trans);

