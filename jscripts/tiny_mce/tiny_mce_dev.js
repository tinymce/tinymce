/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * This file should only be used while developing TinyMCE 
 * tiny_mce.js or tiny_mce_src.js should be used in a production environment.
 * This file loads the js files from classes instead of a merged copy.
 */

function getTinyMCEBaseURL() {
	var i, nl = document.getElementsByTagName('script');

	for (i=0; i<nl.length; i++) {
		if (nl[i].src && nl[i].src.indexOf("tiny_mce_dev.js") != -1)
			return nl[i].src.substring(0, nl[i].src.lastIndexOf('/'));
	}
}

function include(u) {
	document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEBaseURL + '/' + u + '"></script>');
}

// Load all classes
var tinyMCEBaseURL = getTinyMCEBaseURL();

include('classes/TinyMCE_Engine.class.js');
include('classes/TinyMCE_Control.class.js');
include('classes/TinyMCE_Selection.class.js');
include('classes/TinyMCE_UndoRedo.class.js');
include('classes/TinyMCE_Cleanup.class.js');
include('classes/TinyMCE_DOMUtils.class.js');
include('classes/TinyMCE_URL.class.js');
include('classes/TinyMCE_Array.class.js');
include('classes/TinyMCE_Event.class.js');
include('classes/TinyMCE_ForceParagraphs.class.js');
include('classes/TinyMCE_Layer.class.js');
include('classes/TinyMCE_Menu.class.js');
include('classes/TinyMCE_Compatibility.class.js');
include('classes/TinyMCE_Debug.class.js');
