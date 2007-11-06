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
	var i, nl = document.getElementsByTagName('script'), base, api, src, p;

	for (i=0; i<nl.length; i++) {
		src = nl[i].src;

		if (src && src.indexOf("tiny_mce_dev.js") != -1) {
			base = src.substring(0, src.lastIndexOf('/'));

			if ((p = src.indexOf('?api=')) != -1)
				api = src.substring(p + 5);
		}
	}

	nl = null;

	function include(u) {
		document.write('<script type="text/javascript" src="' + base + '/classes/' + u + '"></script>');
	};

	// Firebug
//	document.documentElement.setAttribute("debug", "true");
//	include('firebug/firebug.js');

	// Core ns
	include('tinymce.js');

	// Load framework adapter
	if (api) {
		include('adapter/' + api + '/' + api + '.js');
		include('adapter/' + api + '/adapter.js');
	}

	// Core API
	include('util/Dispatcher.js');
	include('util/URI.js');
	include('util/Cookie.js');
	include('util/JSON.js');
	include('util/XHR.js');
	include('util/JSONRequest.js');
	include('dom/DOMUtils.js');
	include('dom/Event.js');
	include('dom/Element.js');
	include('dom/Selection.js');
	include('dom/XMLWriter.js');
	include('dom/StringWriter.js');
	include('dom/Serializer.js');
	include('dom/ScriptLoader.js');
	include('ui/Control.js');
	include('ui/Container.js');
	include('ui/Separator.js');
	include('ui/MenuItem.js');
	include('ui/Menu.js');
	include('ui/DropMenu.js');
	include('ui/Button.js');
	include('ui/ListBox.js');
	include('ui/NativeListBox.js');
	include('ui/SplitButton.js');
	include('ui/ColorSplitButton.js');
	include('ui/Toolbar.js');
	include('Theme.js');
	include('AddOnManager.js');
	include('EditorManager.js');
	include('Editor.js');
	include('EditorCommands.js');
	include('UndoManager.js');
	include('ForceBlocks.js');
	include('ControlManager.js');
	include('WindowManager.js');

	// Developer API
	include('xml/Parser.js');
	include('Developer.js');
}());