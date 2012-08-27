<?php
// *************************CREATE FOLDER**********************************
function createfolder($dir,$perm) {
if(mkdir($dir, $perm))
	{
	chmod($dir, $perm);
	return true;	
	}
else
	{
	return false;
	}
}

// *************************VALIDATE FILE EXTENSIONS**********************************
function validateExtension($extension, $types) {
if(in_array($extension,$types)) return false; else return true;
}

//*************************************Display Alert Notifications*********************************
function alert(&$notify){
$alert_num = count($notify['type']);
for($i=0;$i<$alert_num;$i++)
	{
	?><div class="alert<?php echo $notify['type'][$i]; ?>"><?php echo $notify['message'][$i]; ?></div><br /><?php
	}
}

// *************************SORT FILE ARRAY BY SELECTED ORDER**********************************
function sortfileorder(&$sortbynow,&$sortorder,&$file) {

switch($sortbynow) 
	{
	case 'name':
		array_multisort($file['name'], $sortorder, $file['type'], $sortorder, $file['modified'], $sortorder, $file['size'], $sortorder, $file['dimensions'], $sortorder, $file['width'], $sortorder, $file['height'], $sortorder);
		break;
	case 'size':
		array_multisort($file['size'], $sortorder, $file['name'], SORT_ASC, $file['type'], $sortorder, $file['modified'], $sortorder, $file['dimensions'], $sortorder, $file['width'], $sortorder, $file['height'], $sortorder);
		break;
	case 'type':
		array_multisort($file['type'], $sortorder, $file['name'], SORT_ASC, $file['size'], $sortorder, $file['modified'], $sortorder, $file['dimensions'], $sortorder, $file['width'], $sortorder, $file['height'], $sortorder);
		break;
	case 'modified':
		array_multisort($file['modified'], $sortorder, $file['name'], $sortorder, $file['type'], $sortorder, $file['size'], $sortorder, $file['dimensions'], $sortorder, $file['width'], $sortorder, $file['height'], $sortorder);
		break;
	case 'dimensions':
		array_multisort($file['dimensions'], $sortorder, $file['width'], $sortorder, $file['name'], SORT_ASC, $file['modified'], $sortorder, $file['type'], $sortorder, $file['size'], $sortorder, $file['height'], $sortorder);
		break;
	default:
		// do nothing
	}
}

// **************************RESIZE IMAGE TO GIVEN SIZE*****************************************
function resizeimage($im,$maxwidth,$maxheight,$urlandname,$comp){
$width = imagesx($im);
$height = imagesy($im);
if(($maxwidth && $width > $maxwidth) || ($maxheight && $height > $maxheight))
	{
	if($maxwidth && $width > $maxwidth)
		{
		$widthratio = $maxwidth/$width;
		$resizewidth=true;
		} 
	else $resizewidth=false;
		if($maxheight && $height > $maxheight)
		{
		$heightratio = $maxheight/$height;
		$resizeheight=true;
		} 
	else $resizeheight=false;
		if($resizewidth && $resizeheight)
		{
		if($widthratio < $heightratio) $ratio = $widthratio;
		else $ratio = $heightratio;
		}
	elseif($resizewidth)
		{
		$ratio = $widthratio;
		}
	elseif($resizeheight)
		{
		$ratio = $heightratio;
		}
	$newwidth = $width * $ratio;
	$newheight = $height * $ratio;
		if(function_exists("imagecopyresampled"))
		{
		$newim = imagecreatetruecolor($newwidth, $newheight);
		imagecopyresampled($newim, $im, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
		}
	else
		{
		$newim = imagecreate($newwidth, $newheight);
		imagecopyresized($newim, $im, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
		}
	imagejpeg ($newim,$urlandname,$comp);
	imagedestroy ($newim);
	}
else
	{
	imagejpeg ($im,$urlandname,$comp);
	}
}

// **************************CHECK IMAGE TYPE AND CONVERT TO TEMP TYPE*****************************
function convert_image($imagetemp,$imagetype){

if($imagetype == "image/pjpeg" || $imagetype == "image/jpeg")
	{
	$cim1 = imagecreatefromjpeg($imagetemp);
	}
elseif($imagetype == "image/x-png" || $imagetype == "image/png")
	{
	$cim1 = imagecreatefrompng($imagetemp);
	}
elseif($imagetype == "image/gif")
	{
	$cim1 = imagecreatefromgif($imagetemp);
	}
return $cim1;
}

// **************************GENERATE FORM OPEN*****************************
function form_open($name,$class,$url,$parameters){
?><form name="<?php echo $name; ?>" class="<?php echo $class; ?>" method="post" action="<?php echo $url.$parameters; ?>">
<?php
}

// **************************GENERATE FORM SELECT ELEMENT*****************************
function form_select($options,$name,$label,$current,$auto){
if ($label) {?><label for="<?php echo $name; ?>"><?php echo $label; ?></label><?php } 
?><select name="<?php echo $name; ?>" <?php if ($auto) {?>onchange="this.form.submit();"<?php }?>>
<?php
$loopnum = count($options); 
for($i=0;$i<$loopnum;$i++)
	{
	$selected = ($options[$i][0] == $current ? ' selected' : ''); 
	echo '<option value="'.$options[$i][0].'"'.$selected.'>'.$options[$i][1].'</option>';
	}
?></select><?php
}

// **************************GENERATE FORM HIDDEN ELEMENT*****************************
function form_hidden_input($name,$value) {
?><input type="hidden" name="<?php echo $name; ?>" value="<?php echo $value; ?>" />
<?php
}

// **************************GENERATE FORM TEXT ELEMENT*****************************
function form_text_input($name,$label,$value,$size,$maxlength) {
if ($label) {?><label for="<?php echo $name; ?>"><?php echo $label; ?></label><?php } ?>
<input type="text" name="<?php echo $name; ?>" size="<?php echo $size; ?>" maxlength="<?php echo $maxlength; ?>" value="<?php echo $value; ?>" /><?php
}

// **************************GENERATE FORM SUBMIT BUTTON*****************************
function form_submit_button($name,$label,$class) {
?><button <?php if ($class) {?>class="<?php echo $class; ?>"<?php } ?>type="submit" name="<?php echo $name; ?>"><?php echo $label; ?></button>
</form>
<?php
}

//********************************Returns True if Number is Odd**************************************
function IsOdd($num)
{
return (1 - ($num & 1));
}

//********************************Truncate Text to Given Length If Required***************************
function truncate_text($textstring,$length){
	if (strlen($textstring) > $length)
		{
		$textstring = substr($textstring,0,$length).'...';
		}
	return $textstring;
}

/**
 * Present a size (in bytes) as a human-readable value
 * 
 * @param int    $size        size (in bytes)
 * @param int    $precision    number of digits after the decimal point
 * @return string
 */
function bytestostring($size, $precision = 0) {
    $sizes = array('YB', 'ZB', 'EB', 'PB', 'TB', 'GB', 'MB', 'KB', 'B');
    $total = count($sizes);

    while($total-- && $size > 1024) $size /= 1024;
    return round($size, $precision).' '.$sizes[$total];
}
//function to clean a filename string so it is a valid filename
function clean_filename($filename){
$reserved = preg_quote('\/:*?"<>|', '/');//characters that are  illegal on any of the 3 major OS's and other strang characters
return preg_replace("/([\\x00-\\x20\\x7f-\\xff{$reserved}])/e", "_", $filename);
}

//********************************Return File MIME Type***************************
function returnMIMEType($filename)
    {
        preg_match("|\.([a-z0-9]{2,4})$|i", $filename, $fileSuffix);

        switch(strtolower($fileSuffix[1]))
        {
            case "js" :
                return "application/x-javascript";

            case "json" :
                return "application/json";

            case "jpg" :
            case "jpeg" :
            case "jpe" :
                return "image/jpg";

            case "png" :
            case "gif" :
            case "bmp" :
            case "tiff" :
                return "image/".strtolower($fileSuffix[1]);

            case "css" :
                return "text/css";

            case "xml" :
                return "application/xml";

            case "doc" :
            case "docx" :
                return "application/msword";

            case "xls" :
            case "xlt" :
            case "xlm" :
            case "xld" :
            case "xla" :
            case "xlc" :
            case "xlw" :
            case "xll" :
                return "application/vnd.ms-excel";

            case "ppt" :
            case "pps" :
                return "application/vnd.ms-powerpoint";

            case "rtf" :
                return "application/rtf";

            case "pdf" :
                return "application/pdf";

            case "html" :
            case "htm" :
            case "php" :
                return "text/html";

            case "txt" :
                return "text/plain";

            case "mpeg" :
            case "mpg" :
            case "mpe" :
                return "video/mpeg";

            case "mp3" :
                return "audio/mpeg3";

            case "wav" :
                return "audio/wav";

            case "aiff" :
            case "aif" :
                return "audio/aiff";

            case "avi" :
                return "video/msvideo";

            case "wmv" :
                return "video/x-ms-wmv";

            case "mov" :
                return "video/quicktime";

            case "zip" :
                return "application/zip";

            case "tar" :
                return "application/x-tar";

            case "swf" :
                return "application/x-shockwave-flash";

            default :
            if(function_exists("mime_content_type"))
            {
                $fileSuffix = mime_content_type($filename);
            }

            return "unknown/" . trim($fileSuffix[0], ".");
        }
    }

?>
