/**
 * tiny_mce_dev.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * This file should only be used while developing TinyMCE 
 * tiny_mce.js or tiny_mce_src.js should be used in a production environment.
 * This file loads the js files from classes instead of a merged copy.
 */

(function() {
	var i, nl = document.getElementsByTagName('script'), base, src, p, li, query = '', it, scripts = [];

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

	nl = null; // IE leak fix

	function include(u) {
		scripts.push(base + '/classes/' + u);
	};

	function load() {
		var i, html = '';

		for (i = 0; i < scripts.length; i++)
			html += '<script type="text/javascript" src="' + scripts[i] + '"></script>\n';

		document.write(html);
	};

	// Firebug
	if (query.debug)
		include('firebug/firebug-lite.js');

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
	include('dom/EventUtils.js');
	include('dom/Element.js');
	include('dom/Selection.js');
	include('dom/XMLWriter.js');
	include('dom/Schema.js');
	include('dom/StringWriter.js');
	include('dom/Serializer.js');
	include('dom/ScriptLoader.js');
	include('dom/TreeWalker.js');
	include('dom/RangeUtils.js');
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
	include('Formatter.js');
	include('CommandManager.js');
	include('LegacyInput.js');

	// Developer API
	include('xml/Parser.js');
	include('Developer.js');

	load();
}());