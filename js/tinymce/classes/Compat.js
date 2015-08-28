/**
 * Compat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TinyMCE core class.
 *
 * @static
 * @class tinymce
 * @borrow-members tinymce.EditorManager
 * @borrow-members tinymce.util.Tools
 */
define("tinymce/Compat", [
	"tinymce/dom/DOMUtils",
	"tinymce/dom/EventUtils",
	"tinymce/dom/ScriptLoader",
	"tinymce/AddOnManager",
	"tinymce/util/Tools",
	"tinymce/Env"
], function(DOMUtils, EventUtils, ScriptLoader, AddOnManager, Tools, Env) {
	var tinymce = window.tinymce;

	/**
	 * @property {tinymce.dom.DOMUtils} DOM Global DOM instance.
	 * @property {tinymce.dom.ScriptLoader} ScriptLoader Global ScriptLoader instance.
	 * @property {tinymce.AddOnManager} PluginManager Global PluginManager instance.
	 * @property {tinymce.AddOnManager} ThemeManager Global ThemeManager instance.
	 */
	tinymce.DOM = DOMUtils.DOM;
	tinymce.ScriptLoader = ScriptLoader.ScriptLoader;
	tinymce.PluginManager = AddOnManager.PluginManager;
	tinymce.ThemeManager = AddOnManager.ThemeManager;

	tinymce.dom = tinymce.dom || {};
	tinymce.dom.Event = EventUtils.Event;

	Tools.each(Tools, function(func, key) {
		tinymce[key] = func;
	});

	Tools.each('isOpera isWebKit isIE isGecko isMac'.split(' '), function(name) {
		tinymce[name] = Env[name.substr(2).toLowerCase()];
	});

	return {};
});

// Describe the different namespaces

/**
 * Root level namespace this contains classes directly releated to the TinyMCE editor.
 *
 * @namespace tinymce
 */

/**
 * Contains classes for handling the browsers DOM.
 *
 * @namespace tinymce.dom
 */

/**
 * Contains html parser and serializer logic.
 *
 * @namespace tinymce.html
 */

/**
 * Contains the different UI types such as buttons, listboxes etc.
 *
 * @namespace tinymce.ui
 */

/**
 * Contains various utility classes such as json parser, cookies etc.
 *
 * @namespace tinymce.util
 */

/**
 * Contains modules to handle data binding.
 *
 * @namespace tinymce.data
 */
