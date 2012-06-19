/**
 * Popup.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

// Some global instances
var tinymce = null, tinyMCEPopup, tinyMCE;

/**
 * TinyMCE popup/dialog helper class. This gives you easy access to the
 * parent editor instance and a bunch of other things. It's higly recommended
 * that you load this script into your dialogs.
 *
 * @static
 * @class tinyMCEPopup
 */
tinyMCEPopup = {
	/**
	 * Initializes the popup this will be called automatically.
	 *
	 * @method init
	 */
	init : function() {
		var t = this, w, ti;

		// Find window & API
		w = t.getWin();
		tinymce = w.tinymce;
		tinyMCE = w.tinyMCE;
		t.editor = tinymce.EditorManager.activeEditor;
		t.params = t.editor.windowManager.params;
		t.features = t.editor.windowManager.features;

		// Setup local DOM
		t.dom = t.editor.windowManager.createInstance('tinymce.dom.DOMUtils', document, {ownEvents: true, proxy: tinyMCEPopup._eventProxy});
		t.dom.bind(window, 'ready', t._onDOMLoaded, t);

		// Enables you to skip loading the default css
		if (t.features.popup_css !== false)
			t.dom.loadCSS(t.features.popup_css || t.editor.settings.popup_css);

		// Setup on init listeners
		t.listeners = [];

		/**
		 * Fires when the popup is initialized.
		 *
		 * @event onInit
		 * @param {tinymce.Editor} editor Editor instance.
		 * @example
		 * // Alerts the selected contents when the dialog is loaded
		 * tinyMCEPopup.onInit.add(function(ed) {
		 *     alert(ed.selection.getContent());
		 * });
		 * 
		 * // Executes the init method on page load in some object using the SomeObject scope
		 * tinyMCEPopup.onInit.add(SomeObject.init, SomeObject);
		 */
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
	 * @method getWin
	 * @return {Window} Reference to the parent window that opened the dialog.
	 */
	getWin : function() {
		// Added frameElement check to fix bug: #2817583
		return (!window.frameElement && window.dialogArguments) || opener || parent || top;
	},

	/**
	 * Returns a window argument/parameter by name.
	 *
	 * @method getWindowArg
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
	 * @method getParam
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
	 * @method getLang
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
	 * @method execCommand
	 * @param {String} cmd Command to execute.
	 * @param {Boolean} ui Optional boolean value if the UI for the command should be presented or not.
	 * @param {Object} val Optional value to pass with the comman like an URL.
	 * @param {Object} a Optional arguments object.
	 */
	execCommand : function(cmd, ui, val, a) {
		a = a || {};
		a.skip_focus = 1;

		this.restoreSelection();
		return this.editor.execCommand(cmd, ui, val, a);
	},

	/**
	 * Resizes the dialog to the inner size of the window. This is needed since various browsers
	 * have different border sizes on windows.
	 *
	 * @method resizeToInnerSize
	 */
	resizeToInnerSize : function() {
		var t = this;

		// Detach it to workaround a Chrome specific bug
		// https://sourceforge.net/tracker/?func=detail&atid=635682&aid=2926339&group_id=103281
		setTimeout(function() {
			var vp = t.dom.getViewPort(window);

			t.editor.windowManager.resizeBy(
				t.getWindowArg('mce_width') - vp.w,
				t.getWindowArg('mce_height') - vp.h,
				t.id || window
			);
		}, 10);
	},

	/**
	 * Will executed the specified string when the page has been loaded. This function
	 * was added for compatibility with the 2.x branch.
	 *
	 * @method executeOnLoad
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
	 *
	 * @method storeSelection
	 */
	storeSelection : function() {
		this.editor.windowManager.bookmark = tinyMCEPopup.editor.selection.getBookmark(1);
	},

	/**
	 * Restores any stored selection. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 *
	 * @method restoreSelection
	 */
	restoreSelection : function() {
		var t = tinyMCEPopup;

		if (!t.isWindow && tinymce.isIE)
			t.editor.selection.moveToBookmark(t.editor.windowManager.bookmark);
	},

	/**
	 * Loads a specific dialog language pack. If you pass in plugin_url as a arugment
	 * when you open the window it will load the <plugin url>/langs/<code>_dlg.js lang pack file.
	 *
	 * @method requireLangPack
	 */
	requireLangPack : function() {
		var t = this, u = t.getWindowArg('plugin_url') || t.getWindowArg('theme_url');

		if (u && t.editor.settings.language && t.features.translate_i18n !== false && t.editor.settings.language_load !== false) {
			u += '/langs/' + t.editor.settings.language + '_dlg.js';

			if (!tinymce.ScriptLoader.isDone(u)) {
				document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"></script>');
				tinymce.ScriptLoader.markDone(u);
			}
		}
	},

	/**
	 * Executes a color picker on the specified element id. When the user
	 * then selects a color it will be set as the value of the specified element.
	 *
	 * @method pickColor
	 * @param {DOMEvent} e DOM event object.
	 * @param {string} element_id Element id to be filled with the color value from the picker.
	 */
	pickColor : function(e, element_id) {
		this.execCommand('mceColorPicker', true, {
			color : document.getElementById(element_id).value,
			func : function(c) {
				document.getElementById(element_id).value = c;

				try {
					document.getElementById(element_id).onchange();
				} catch (ex) {
					// Try fire event, ignore errors
				}
			}
		});
	},

	/**
	 * Opens a filebrowser/imagebrowser this will set the output value from
	 * the browser as a value on the specified element.
	 *
	 * @method openBrowser
	 * @param {string} element_id Id of the element to set value in.
	 * @param {string} type Type of browser to open image/file/flash.
	 * @param {string} option Option name to get the file_broswer_callback function name from.
	 */
	openBrowser : function(element_id, type, option) {
		tinyMCEPopup.restoreSelection();
		this.editor.execCallback('file_browser_callback', element_id, document.getElementById(element_id).value, type, window);
	},

	/**
	 * Creates a confirm dialog. Please don't use the blocking behavior of this
	 * native version use the callback method instead then it can be extended.
	 *
	 * @method confirm
	 * @param {String} t Title for the new confirm dialog.
	 * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
	 * @param {Object} s Optional scope to execute the callback in.
	 */
	confirm : function(t, cb, s) {
		this.editor.windowManager.confirm(t, cb, s, window);
	},

	/**
	 * Creates a alert dialog. Please don't use the blocking behavior of this
	 * native version use the callback method instead then it can be extended.
	 *
	 * @method alert
	 * @param {String} t Title for the new alert dialog.
	 * @param {function} cb Callback function to be executed after the user has selected ok.
	 * @param {Object} s Optional scope to execute the callback in.
	 */
	alert : function(tx, cb, s) {
		this.editor.windowManager.alert(tx, cb, s, window);
	},

	/**
	 * Closes the current window.
	 *
	 * @method close
	 */
	close : function() {
		var t = this;

		// To avoid domain relaxing issue in Opera
		function close() {
			t.editor.windowManager.close(window);
			tinymce = tinyMCE = t.editor = t.params = t.dom = t.dom.doc = null; // Cleanup
		};

		if (tinymce.isOpera)
			t.getWin().setTimeout(close, 0);
		else
			close();
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
		var t = tinyMCEPopup, ti = document.title, bm, h, nv;

		// Translate page
		if (t.features.translate_i18n !== false) {
			h = document.body.innerHTML;

			// Replace a=x with a="x" in IE
			if (tinymce.isIE)
				h = h.replace(/ (value|title|alt)=([^"][^\s>]+)/gi, ' $1="$2"')

			document.dir = t.editor.getParam('directionality','');

			if ((nv = t.editor.translate(h)) && nv != h)
				document.body.innerHTML = nv;

			if ((nv = t.editor.translate(ti)) && nv != ti)
				document.title = ti = nv;
		}

		if (!t.editor.getParam('browser_preferred_colors', false) || !t.isWindow)
			t.dom.addClass(document.body, 'forceColors');

		document.body.style.display = '';

		// Restore selection in IE when focus is placed on a non textarea or input element of the type text
		if (tinymce.isIE) {
			document.attachEvent('onmouseup', tinyMCEPopup._restoreSelection);

			// Add base target element for it since it would fail with modal dialogs
			t.dom.add(t.dom.select('head')[0], 'base', {target : '_self'});
		}

		t.restoreSelection();
		t.resizeToInnerSize();

		// Set inline title
		if (!t.isWindow)
			t.editor.windowManager.setTitle(window, ti);
		else
			window.focus();

		if (!tinymce.isIE && !t.isWindow) {
			t.dom.bind(document, 'focus', function() {
				t.editor.windowManager.focus(t.id);
			});
		}

		// Patch for accessibility
		tinymce.each(t.dom.select('select'), function(e) {
			e.onkeydown = tinyMCEPopup._accessHandler;
		});

		// Call onInit
		// Init must be called before focus so the selection won't get lost by the focus call
		tinymce.each(t.listeners, function(o) {
			o.func.call(o.scope, t.editor);
		});

		// Move focus to window
		if (t.getWindowArg('mce_auto_focus', true)) {
			window.focus();

			// Focus element with mceFocus class
			tinymce.each(document.forms, function(f) {
				tinymce.each(f.elements, function(e) {
					if (t.dom.hasClass(e, 'mceFocus') && !e.disabled) {
						e.focus();
						return false; // Break loop
					}
				});
			});
		}

		document.onkeyup = tinyMCEPopup._closeWinKeyHandler;
	},

	_accessHandler : function(e) {
		e = e || window.event;

		if (e.keyCode == 13 || e.keyCode == 32) {
			var elm = e.target || e.srcElement;

			if (elm.onchange)
				elm.onchange();

			return tinymce.dom.Event.cancel(e);
		}
	},

	_closeWinKeyHandler : function(e) {
		e = e || window.event;

		if (e.keyCode == 27)
			tinyMCEPopup.close();
	},

	_eventProxy: function(id) {
		return function(evt) {
			tinyMCEPopup.dom.events.callNativeHandler(id, evt);
		};
	}
};

tinyMCEPopup.init();