<?php
$mainpage = (strpos(basename($_SERVER['HTTP_REFERER']),'tinybrowser.php') === 0 ? true : false);
require_once("../config_tinybrowser.php");

if($mainpage && !isset($_GET['feid']) && $tinybrowser['integration'] == 'tinymce')
	{?>
	function selectURL(url)
	{
		document.passform.fileurl.value = url;
		FileBrowserDialogue.mySubmit();
	}
	var FileBrowserDialogue = {
	    init : function () {
	        // Here goes your code for setting your custom things onLoad.
				rowHighlight();
	    },
	    mySubmit : function () {
	 		  var URL = document.passform.fileurl.value;
	        var win = tinyMCEPopup.getWindowArg("window");
	
	        // insert information now
	        win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = URL;
	
	        // for image browsers: update image dimensions
			  if (typeof(win.ImageDialog) != "undefined" && document.URL.indexOf('type=image') != -1)
				  {
		        if (win.ImageDialog.getImageData) win.ImageDialog.getImageData();
		        if (win.ImageDialog.showPreviewImage) win.ImageDialog.showPreviewImage(URL);
				  }
	
	        // close popup window
	        tinyMCEPopup.close();
	    }
	}
	tinyMCEPopup.onInit.add(FileBrowserDialogue.init, FileBrowserDialogue);
	<?php 
	}
elseif($mainpage && !isset($_GET['feid']) && $tinybrowser['integration'] == 'fckeditor')
	{?>
	function selectURL(url){
	// window.opener.SetUrl( url, width, height, alt);
	window.opener.SetUrl( url ) ;
	window.close() ;
	}
	<?php
	}
elseif($mainpage && $_GET['feid'] != '')
	{?>
	function selectURL(url) {
	opener.document.getElementById("<?php echo $_GET['feid']; ?>").value = url;
	// Set img source of element id, if img id exists (format is elementid + "img")
	if(typeof(opener.document.getElementById("<?php echo $_GET['feid']; ?>img")) != "undefined" && opener.document.getElementById("<?php echo $_GET['feid']; ?>img").src.length != 0)
	   {
		opener.document.getElementById("<?php echo $_GET['feid']; ?>img").src = url;
		}
	self.close();
	}
	<?php
	}
?>

rowHighlight = function() {
var x = document.getElementsByTagName('tr');
for (var i=0;i<x.length;i++) 
	{
	x[i].onmouseover = function () {this.className = "over " + this.className;}
	x[i].onmouseout = function () {this.className = this.className.replace("over", ""); this.className = this.className.replace(" ", "");}
	}
var y = document.getElementsByTagName('th');
for (var ii=0;ii<y.length;ii++) 
	{
	y[ii].onmouseover = function () {if(this.className != "nohover") this.className = "over " + this.className;}
	y[ii].onmouseout = function () {this.className = this.className.replace("over", ""); this.className = this.className.replace(" ", "");}
	}
}