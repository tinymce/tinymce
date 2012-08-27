<?php
require_once("config_tinybrowser.php");
// Set language
if(isset($tinybrowser['language']) && file_exists('langs/'.$tinybrowser['language'].'.php'))
	{
	require_once('langs/'.$tinybrowser['language'].'.php'); 
	}
else
	{
	require_once('langs/en.php'); // Falls back to English
	}
require_once("fns_tinybrowser.php");

// Check session, if it exists
if(session_id() != '')
	{
	if(!isset($_SESSION[$tinybrowser['sessioncheck']]))
		{
		echo TB_DENIED;
		exit;
		}
	}

if(!$tinybrowser['allowupload'])
	{
	echo TB_UPDENIED;
	exit;
	}

// Assign get variables
$typenow = (isset($_GET['type']) ? $_GET['type'] : 'image');
$passfeid = (isset($_GET['feid']) && $_GET['feid']!='' ? '&feid='.$_GET['feid'] : '');

// determine file dialog file types
switch ($_GET['type'])
	{
	case 'image':
		$filestr = TB_TYPEIMG;
		break;
	case 'media':
		$filestr = TB_TYPEMEDIA;
		break;
	case 'file':
		$filestr = TB_TYPEFILE;
		break;
	}
$fileexts = str_replace(",",";",$tinybrowser['filetype'][$_GET['type']]);
$filelist = $filestr.' ('.$tinybrowser['filetype'][$_GET['type']].')';

// Initalise alert array
$notify = array(
	"type" => array(),
	"message" => array()
);
$goodqty = (isset($_GET['goodfiles']) ? $_GET['goodfiles'] : 0);
$badqty = (isset($_GET['badfiles']) ? $_GET['badfiles'] : 0);
$dupqty = (isset($_GET['dupfiles']) ? $_GET['dupfiles'] : 0);

if($goodqty>0)
	{
	$notify['type'][]='success';
	$notify['message'][]=sprintf(TB_MSGUPGOOD, $goodqty);
	}
if($badqty>0)
	{
	$notify['type'][]='failure';
	$notify['message'][]=sprintf(TB_MSGUPBAD, $badqty);
	}
if($dupqty>0)
	{
	$notify['type'][]='failure';
	$notify['message'][]=sprintf(TB_MSGUPDUP, $dupqty);
	}
if(isset($_GET['permerror']))
	{
	$notify['type'][]='failure';
	$notify['message'][]=sprintf(TB_MSGUPFAIL, $tinybrowser['docroot'].$tinybrowser['path'][$typenow]);
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<title>TinyBrowser :: <?php echo TB_UPLOAD; ?></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<?php
if($passfeid == '' && $tinybrowser['integration']=='tinymce')
	{
	?><link rel="stylesheet" type="text/css" media="all" href="<?php echo $tinybrowser['tinymcecss']; ?>" /><?php 
	}
else
	{
	?><link rel="stylesheet" type="text/css" media="all" href="css/stylefull_tinybrowser.css" /><?php 
	}
?>
<link rel="stylesheet" type="text/css" media="all" href="css/style_tinybrowser.css.php" />
<script type="text/javascript" src="js/swfobject.js"></script>
<script type="text/javascript">
function uploadComplete(url) {
document.location = url;
}
</script>
</head>
<body onload='
      var so = new SWFObject("flexupload.swf", "mymovie", "600", "340", "9", "#ffffff");
      so.addVariable("folder", "<?php echo urlencode($tinybrowser['path'][$typenow]); ?>");
      so.addVariable("uptype", "<?php echo $typenow; ?>");
      so.addVariable("destid", "<?php echo $passfeid; ?>");
      so.addVariable("maxsize", "<?php echo $tinybrowser['maxsize'][$_GET['type']]; ?>");
      so.addVariable("sessid", "<?php echo session_id(); ?>");
      so.addVariable("obfus", "<?php echo md5($_SERVER['DOCUMENT_ROOT'].$tinybrowser['obfuscate']); ?>");
      so.addVariable("filenames", "<?php echo $filelist; ?>");
      so.addVariable("extensions", "<?php echo $fileexts; ?>");
      so.addVariable("filenamelbl", "<?php echo TB_FILENAME; ?>");
      so.addVariable("sizelbl", "<?php echo TB_SIZE; ?>");
      so.addVariable("typelbl", "<?php echo TB_TYPE; ?>");
      so.addVariable("progresslbl", "<?php echo TB_PROGRESS; ?>");
      so.addVariable("browselbl", "<?php echo TB_BROWSE; ?>");
      so.addVariable("removelbl", "<?php echo TB_REMOVE; ?>");
      so.addVariable("uploadlbl", "<?php echo TB_UPLOAD; ?>");
      so.addVariable("uplimitmsg", "<?php echo TB_MSGMAXSIZE; ?>");
      so.addVariable("uplimitlbl", "<?php echo TB_TTLMAXSIZE; ?>");
      so.addVariable("uplimitbyte", "<?php echo TB_BYTES; ?>");
      so.addParam("allowScriptAccess", "always");
      so.addParam("type", "application/x-shockwave-flash");
      so.write("flashcontent");'>
<?php
if(count($notify['type'])>0) alert($notify);
?>
<div class="tabs">
<ul>
<li id="browse_tab"><span><a href="tinybrowser.php?type=<?php echo $typenow.$passfeid ; ?>"><?php echo TB_BROWSE; ?></a></span></li>
<li id="upload_tab" class="current"><span><a href="upload.php?type=<?php echo $typenow.$passfeid ; ?>"><?php echo TB_UPLOAD; ?></a></span></li>
<?php
if($tinybrowser['allowedit'] || $tinybrowser['allowdelete'])
	{
	?><li id="edit_tab"><span><a href="edit.php?type=<?php echo $typenow.$passfeid ; ?>"><?php echo TB_EDIT; ?></a></span></li>
	<?php } ?>
</ul>
</div>
<div class="panel_wrapper">
<div id="general_panel" class="panel currentmod">
<fieldset>
<legend><?php echo TB_UPLOADFILES; ?></legend>
    <div id="flashcontent"></div>
</fieldset></div></div>
</body>
</html>
