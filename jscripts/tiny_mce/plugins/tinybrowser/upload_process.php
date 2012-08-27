<?php
require_once("config_tinybrowser.php");
require_once("fns_tinybrowser.php");

// Initialise files array and error vars
$files = array();
$good = 0;
$bad = 0;
$dup = 0;
$total = (isset($_GET['filetotal']) ? $_GET['filetotal'] : 0);


// Assign get variables
$folder = $tinybrowser['docroot'].urldecode($_GET['folder']);
$passfeid = (isset($_GET['feid']) ? '&feid='.$_GET['feid'] : '');

if ($handle = opendir($folder))
	{
	while (false !== ($file = readdir($handle)))
		{
		if ($file != "." && $file != ".." && substr($file,-1)=='_')
			{
			//-- File Naming
			$tmp_filename = $folder.$file;
			$dest_filename	 = $folder.rtrim($file,'_');
        
			//-- Duplicate Files
			if(file_exists($dest_filename)) { unlink($tmp_filename); $dup++; continue; }

			//-- Bad extensions
			$ext = end(explode('.',$dest_filename));
			if(!validateExtension($ext, $tinybrowser['prohibited'])) { unlink($tmp_filename); continue; }
        
			//-- Rename temp file to dest file
			rename($tmp_filename, $dest_filename);
			$good++;
			
			//-- if image, perform additional processing
			if($_GET['type']=='image')
				{
				//-- Good mime-types
				$imginfo = getimagesize($dest_filename);
	   		if($imginfo === false) { unlink($dest_filename); continue; }
				$mime = $imginfo['mime'];

				// resize image to maximum height and width, if set
				if($tinybrowser['imageresize']['width'] > 0 || $tinybrowser['imageresize']['height'] > 0)
					{
					// assign new width and height values, only if they are less than existing image size
					$widthnew  = ($tinybrowser['imageresize']['width'] > 0 && $tinybrowser['imageresize']['width'] < $imginfo[0] ? $tinybrowser['imageresize']['width'] : $imginfo[0]);
					$heightnew = ($tinybrowser['imageresize']['height'] > 0 && $tinybrowser['imageresize']['height'] < $imginfo[1] ? $tinybrowser['imageresize']['height'] :  $imginfo[1]);

					// only resize if width or height values are different
					if($widthnew != $imginfo[0] || $heightnew != $imginfo[1])
						{
						$im = convert_image($dest_filename,$mime);
						resizeimage($im,$widthnew,$heightnew,$dest_filename,$tinybrowser['imagequality']);
						imagedestroy($im);
						}
					}

				// generate thumbnail
				$thumbimg = $folder."_thumbs/_".rtrim($file,'_');
				if (!file_exists($thumbimg))
					{
					$im = convert_image($dest_filename,$mime);
					resizeimage	($im,$tinybrowser['thumbsize'],$tinybrowser['thumbsize'],$thumbimg,$tinybrowser['thumbquality']);
					imagedestroy ($im);
					}
				}

      	}
		}
	closedir($handle);
	}
$bad = $total-($good+$dup);

// Check for problem during upload
if($total>0 && $bad==$total) Header('Location: ./upload.php?type='.$_GET['type'].$passfeid.'&permerror=1&total='.$total);
else Header('Location: ./upload.php?type='.$_GET['type'].$passfeid.'&badfiles='.$bad.'&goodfiles='.$good.'&dupfiles='.$dup);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>TinyBrowser :: Process Upload</title>
	</head>
	<body>
		<p>You won't see this.</p>
	</body>
</html>
