<?php
$tbpath = pathinfo($_SERVER['PHP_SELF']);
$tbmain = $tbpath['dirname'].'/tinybrowser.php';
?>

function tinyBrowserPopUp(type,formelementid) {
   tburl = "<?php echo $tbmain; ?>" + "?type=" + type + "&feid=" + formelementid;
	newwindow=window.open(tburl,'tinybrowser','height=440,width=665,scrollbars=yes,resizable=yes');
	if (window.focus) {newwindow.focus()}
	return false;
}