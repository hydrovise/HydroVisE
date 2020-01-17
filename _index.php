<?php
# phpinfo();
# header("Location: http://s-iihr55.iihr.uiowa.edu/hygis.html", true, 301);
header("Location: http://s-iihr55.iihr.uiowa.edu/hygis.html?". $_SERVER['QUERY_STRING'], true, 301);
exit();
?>
