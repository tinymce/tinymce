/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 *
 * This file should only be used while developing TinyMCE 
 * tiny_mce.js or tiny_mce_src.js should be used in a production environment.
 * This file loads the js files from classes instead of a merged copy.
 */

(function() {
	var i, nl = document.getElementsByTagName('script'), base, src, p, li, query = '', it;

	if (window.tinyMCEPreInit) {
		base = tinyMCEPreInit.base;
		query = tinyMCEPreInit.query || '';
	} else {
		for (i=0; i<nl.length; i++) {
			src = nl[i].src;

			if (src && src.indexOf("tiny_mce_dev.js") != -1) {
				base = src.substring(0, src.lastIndexOf('/'));

				if ((p = src.indexOf('?')) != -1)
					query = src.substring(p + 1);
			}
		}
	}

	// Parse query string
	li = query.split('&');
	query = {};
	for (i=0; i<li.length; i++) {
		it = li[i].split('=');
		query[unescape(it[0])] = unescape(it[1]);
	}

	nl = null;

	function include(u) {
		//document.write('<script type="text/javascript" src="' + base + '/classes/' + u + '"></script>');
		var w = window, x = w.XMLHttpRequest, da;

		u = base + '/classes/' + u;

		if (x && w.opera) {
			x = new XMLHttpRequest();
			x.open('GET', u, false);
			x.async = false;
			x.send('');
			da = x.responseText;

			// Evaluate script
			if (!w.execScript) {
				try {
					eval.call(w, da);
				} catch (ex) {
					eval(da, w); // Firefox 3.0a8
				}
			} else
				w.execScript(da); // IE
		} else
			document.write('<script type="text/javascript" src="' + u + '"></script>');
	};

	// Firebug
	if (query.debug && (!window.console || !console.debug || /WebKit/.test(navigator.userAgent))) {
		window.console = null; // Force firebug on WebKit
		document.documentElement.setAttribute("debug", "true");
		include('firebug/firebug-lite.js');
	}

	// Core ns
	include('tinymce.js');

	// Load framework adapter
	if (query.api)
		include('adapter/' + query.api + '/adapter.js');

	// Core API
	include('util/Dispatcher.js');
	include('util/URI.js');
	include('util/Cookie.js');
	include('util/JSON.js');
	include('util/JSONP.js');
	include('util/XHR.js');
	include('util/JSONRequest.js');
	include('dom/DOMUtils.js');
	include('dom/Range.js');
	include('dom/TridentSelection.js');
	include('dom/Sizzle.js');
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
	include('ui/MenuButton.js');
	include('ui/SplitButton.js');
	include('ui/ColorSplitButton.js');
	include('ui/Toolbar.js');
	include('AddOnManager.js');
	include('EditorManager.js');
	include('Editor.js');
	include('EditorCommands.js');
	include('UndoManager.js');
	include('ForceBlocks.js');
	include('ControlManager.js');
	include('WindowManager.js');
	include('CommandManager.js');
	include('commands/RemoveFormat.js');
	include('commands/BlockQuote.js');
	include('commands/CutCopyPaste.js');
	include('commands/InsertHorizontalRule.js');
	include('commands/UndoRedo.js');

	// Developer API
	include('xml/Parser.js');
	include('Developer.js');
}());