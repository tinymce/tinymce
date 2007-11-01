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

(function() {
	var i, nl = document.getElementsByTagName('script'), base;

	for (i=0; i<nl.length; i++) {
		if (nl[i].src && nl[i].src.indexOf("tiny_mce_dev.js") != -1)
			base = nl[i].src.substring(0, nl[i].src.lastIndexOf('/'));
	}

	nl = null;

	function include(u) {
		document.write('<script type="text/javascript" src="' + base + '/' + u + '"></script>');
	};

	// Load and setup firebug
//	document.documentElement.setAttribute("debug", "true");
//	include('classes/firebug/firebug.js');

	// Load API
	include('classes/tinymce.js');
	include('classes/util/Dispatcher.js');
	include('classes/util/URI.js');
	include('classes/util/Cookie.js');
	include('classes/util/JSON.js');
	include('classes/util/XHR.js');
	include('classes/util/JSONRequest.js');
	include('classes/dom/DOMUtils.js');
	include('classes/dom/Event.js');
	include('classes/dom/Element.js');
	include('classes/dom/Selection.js');
	include('classes/dom/XMLWriter.js');
	include('classes/dom/StringWriter.js');
	include('classes/dom/Serializer.js');
	include('classes/dom/ScriptLoader.js');
	include('classes/ui/Control.js');
	include('classes/ui/Container.js');
	include('classes/ui/Separator.js');
	include('classes/ui/MenuItem.js');
	include('classes/ui/Menu.js');
	include('classes/ui/DropMenu.js');
	include('classes/ui/Button.js');
	include('classes/ui/ListBox.js');
	include('classes/ui/NativeListBox.js');
	include('classes/ui/SplitButton.js');
	include('classes/ui/ColorSplitButton.js');
	include('classes/ui/Toolbar.js');
	include('classes/Theme.js');
	include('classes/ThemeManager.js');
	include('classes/PluginManager.js');
	include('classes/EditorManager.js');
	include('classes/Editor.js');
	include('classes/EditorCommands.js');
	include('classes/UndoManager.js');
	include('classes/ForceBlocks.js');
	include('classes/ControlManager.js');
	include('classes/WindowManager.js');

	// Developer API
	include('classes/xml/Parser.js');
	include('classes/Developer.js');
}());