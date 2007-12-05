/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

// Some global instances
var tinymce = null, tinyMCEPopup, tinyMCE;

/**#@+
 * @class TinyMCE popup/dialog helper class. This gives you easy access to the
 * parent editor instance and a bunch of other things. It's higly recommended
 * that you load this script into your dialogs.
 *
 * @static
 * @member tinyMCEPopup
 */
tinyMCEPopup = {
	/**#@+
	 * @method
	 */

	/**
	 * Initializes the popup this will be called automatically.
	 */
	init : function() {
		var t = this, w = t.getWin(), ti;

		// Find API
		tinymce = w.tinymce;
		tinyMCE = w.tinyMCE;
		t.editor = tinymce.EditorManager.activeEditor;
		t.params = t.editor.windowManager.params;

		// Setup local DOM
		t.dom = t.editor.windowManager.createInstance('tinymce.dom.DOMUtils', document);
		t.dom.loadCSS(t.editor.settings.popup_css);

		// Setup on init listeners
		t.listeners = [];
		t.onInit = {
			add : function(f, s) {
				t.listeners.push({func : f, scope : s});
			}
		};

		t.isWindow = !t.getWindowArg('mce_inline');
		t.id = t.getWindowArg('mce_window_id');
		t.editor.windowManager.onOpen.dispatch(t.editor.windowManager, window);
	},

	/**
	 * Returns the reference to the parent window that opened the dialog.
	 *
	 * @return {Window} Reference to the parent window that opened the dialog.
	 */
	getWin : function() {
		return window.dialogArguments || opener || parent || top;
	},

	/**
	 * Returns a window argument/parameter by name.
	 *
	 * @param {String} n Name of the window argument to retrive.
	 * @param {String} dv Optional default value to return.
	 * @return {String} Argument value or default value if it wasn't found.
	 */
	getWindowArg : function(n, dv) {
		var v = this.params[n];

		return tinymce.is(v) ? v : dv;
	},

	/**
	 * Returns a editor parameter/config option value.
	 *
	 * @param {String} n Name of the editor config option to retrive.
	 * @param {String} dv Optional default value to return.
	 * @return {String} Parameter value or default value if it wasn't found.
	 */
	getParam : function(n, dv) {
		return this.editor.getParam(n, dv);
	},

	/**
	 * Returns a language item by key.
	 *
	 * @param {String} n Language item like mydialog.something.
	 * @param {String} dv Optional default value to return.
	 * @return {String} Language value for the item like "my string" or the default value if it wasn't found.
	 */
	getLang : function(n, dv) {
		return this.editor.getLang(n, dv);
	},

	/**
	 * Executed a command on editor that opened the dialog/popup.
	 *
	 * @param {String} cmd Command to execute.
	 * @param {bool} ui Optional boolean value if the UI for the command should be presented or not.
	 * @param {Object} val Optional value to pass with the comman like an URL.
	 */
	execCommand : function(cmd, ui, val) {
		this.restoreSelection();
		return this.editor.execCommand(cmd, ui, val);
	},

	/**
	 * Resizes the dialog to the inner size of the window. This is needed since various browsers
	 * have different border sizes on windows.
	 */
	resizeToInnerSize : function() {
		var t = this, n, b = document.body, vp = t.dom.getViewPort(window), dw, dh;

		dw = t.getWindowArg('mce_width') - vp.w;
		dh = t.getWindowArg('mce_height') - vp.h;

		if (t.isWindow)
			window.resizeBy(dw, dh);
		else
			t.editor.windowManager.resizeBy(dw, dh, t.id);
	},

	/**
	 * Will executed the specified string when the page has been loaded. This function
	 * was added for compatibility with the 2.x branch.
	 *
	 * @param {String} s String to evalutate on init.
	 */
	executeOnLoad : function(s) {
		this.onInit.add(function() {
			eval(s);
		});
	},

	/**
	 * Stores the current editor selection for later restoration. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 */
	storeSelection : function() {
		this.editor.windowManager.bookmark = tinyMCEPopup.editor.selection.getBookmark('simple');
	},

	/**
	 * Restores any stored selection. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 */
	restoreSelection : function() {
		var t = tinyMCEPopup;

		if (!t.isWindow && tinymce.isIE)
			t.editor.selection.moveToBookmark(t.editor.windowManager.bookmark);
	},

	/**
	 * Loads a specific dialog language pack. If you pass in plugin_url as a arugment
	 * when you open the window it will load the <plugin url>/langs/<code>_dlg.js lang pack file.
	 */
	requireLangPack : function() {
		var u = this.getWindowArg('plugin_url') || this.getWindowArg('theme_url');

		if (u)
			document.write('<script type="text/javascript" src="' + u + '/langs/' + this.editor.settings.language + '_dlg.js' + '"></script>');
	},

	/**
	 * Executes a color picker on the specified element id. When the user
	 * then selects a color it will be set as the value of the specified element.
	 *
	 * @param {DOMEvent} e DOM event object.
	 * @param {string} element_id Element id to be filled with the color value from the picker.
	 */
	pickColor : function(e, element_id) {
		this.execCommand('mceColorPicker', true, {
			color : document.getElementById(element_id).value,
			func : function(c) {
				document.getElementById(element_id).value = c;

				if (tinymce.is(document.getElementById(element_id).onchange, 'function'))
					document.getElementById(element_id).onchange();
			}
		});
	},

	/**
	 * Opens a filebrowser/imagebrowser this will set the output value from
	 * the browser as a value on the specified element.
	 *
	 * @param {string} element_id Id of the element to set value in.
	 * @param {string} type Type of browser to open image/file/flash.
	 * @param {string} option Option name to get the file_broswer_callback function name from.
	 */
	openBrowser : function(element_id, type, option) {
		tinyMCEPopup.restoreSelection();
		this.editor.execCallback('file_browser_callback', element_id, document.getElementById(element_id).value, type, window);
	},

	/**
	 * Closes the current window.
	 */
	close : function() {
		var t = this;

		t.dom = t.dom.doc = null; // Cleanup
		t.editor.windowManager.close(window, t.id);
	},

	// Internal functions	

	_restoreSelection : function() {
		var e = window.event.srcElement;

		if (e.nodeName == 'INPUT' && (e.type == 'submit' || e.type == 'button'))
			tinyMCEPopup.restoreSelection();
	},

/*	_restoreSelection : function() {
		var e = window.event.srcElement;

		// If user focus a non text input or textarea
		if ((e.nodeName != 'INPUT' && e.nodeName != 'TEXTAREA') || e.type != 'text')
			tinyMCEPopup.restoreSelection();
	},*/

	_onDOMLoaded : function() {
		var t = this, ti = document.title, bm, h;

		// Translate page
		h = document.body.innerHTML;

		// Replace a=x with a="x" in IE
		if (tinymce.isIE)
			h = h.replace(/ (value|title|alt)=([^\s>]+)/gi, ' $1="$2"');

		document.body.innerHTML = t.editor.translate(h);
		document.title = ti = t.editor.translate(ti);
		document.body.style.display = '';

		// Restore selection in IE when focus is placed on a non textarea or input element of the type text
		if (tinymce.isIE)
			document.attachEvent('onmouseup', tinyMCEPopup._restoreSelection);

		t.restoreSelection();

		// Call onInit
		tinymce.each(t.listeners, function(o) {
			o.func.call(o.scope, t.editor);
		});

		t.resizeToInnerSize();

		if (t.isWindow)
			window.focus();
		else
			t.editor.windowManager.setTitle(ti, t.id);

		if (!tinymce.isIE && !t.isWindow) {
			tinymce.dom.Event._add(document, 'focus', function() {
				t.editor.windowManager.focus(t.id)
			});
		}

		// Patch for accessibility
		tinymce.each(t.dom.select('select'), function(e) {
			e.onkeydown = tinyMCEPopup._accessHandler;
		});

		// Move focus to window
		window.focus();
	},

	_accessHandler : function(e) {
		var e = e || window.event;

		if (e.keyCode == 13 || e.keyCode == 32) {
			e = e.target || e.srcElement;

			if (e.onchange)
				e.onchange();

			return tinymce.dom.Event.cancel(e);
		}
	},

	_wait : function() {
		var t = this, ti;

		if (tinymce.isIE && document.location.protocol != 'https:') {
			// Fake DOMContentLoaded on IE
			document.write('<script id=__ie_onload defer src=\'javascript:""\';><\/script>');
			document.getElementById("__ie_onload").onreadystatechange = function() {
				if (this.readyState == "complete") {
					t._onDOMLoaded();
					document.getElementById("__ie_onload").onreadystatechange = null; // Prevent leak
				}
			};
		} else {
			if (tinymce.isIE || tinymce.isWebKit) {
				ti = setInterval(function() {
					if (/loaded|complete/.test(document.readyState)) {
						clearInterval(ti);
						t._onDOMLoaded();
					}
				}, 10);
			} else {
				window.addEventListener('DOMContentLoaded', function() {
					t._onDOMLoaded();
				}, false);
			}
		}
	}
};

tinyMCEPopup.init();
tinyMCEPopup._wait(); // Wait for DOM Content Loaded
