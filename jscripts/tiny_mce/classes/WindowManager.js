/**
 * WindowManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	/**
	 * This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
	 *
	 * @class tinymce.WindowManager
	 * @example
	 * // Opens a new dialog with the file.htm file and the size 320x240
	 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
	 * tinyMCE.activeEditor.windowManager.open({
	 *    url : 'file.htm',
	 *    width : 320,
	 *    height : 240
	 * }, {
	 *    custom_param : 1
	 * });
	 * 
	 * // Displays an alert box using the active editors window manager instance
	 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
	 * 
	 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
	 * tinyMCE.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
	 *    if (s)
	 *       tinyMCE.activeEditor.windowManager.alert("Ok");
	 *    else
	 *       tinyMCE.activeEditor.windowManager.alert("Cancel");
	 * });
	 */
	tinymce.create('tinymce.WindowManager', {
		/**
		 * Constructs a new window manager instance.
		 *
		 * @constructor
		 * @method WindowManager
		 * @param {tinymce.Editor} ed Editor instance that the windows are bound to.
		 */
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		/**
		 * Opens a new window.
		 *
		 * @method open
		 * @param {Object} s Optional name/value settings collection contains things like width/height/url etc.
		 * @option {String} title Window title. 
		 * @option {String} file URL of the file to open in the window. 
		 * @option {Number} width Width in pixels. 
		 * @option {Number} height Height in pixels. 
		 * @option {Boolean} resizable Specifies whether the popup window is resizable or not. 
		 * @option {Boolean} maximizable Specifies whether the popup window has a "maximize" button and can get maximized or not. 
		 * @option {Boolean} inline Specifies whether to display in-line (set to 1 or true for in-line display; requires inlinepopups plugin). 
		 * @option {String/Boolean} popup_css Optional CSS to use in the popup. Set to false to remove the default one. 
		 * @option {Boolean} translate_i18n Specifies whether translation should occur or not of i18 key strings. Default is true. 
		 * @option {String/bool} close_previous Specifies whether a previously opened popup window is to be closed or not (like when calling the file browser window over the advlink popup). 
		 * @option {String/bool} scrollbars Specifies whether the popup window can have scrollbars if required (i.e. content larger than the popup size specified). 
		 * @param {Object} p Optional parameters/arguments collection can be used by the dialogs to retrive custom parameters.
		 * @option {String} plugin_url url to plugin if opening plugin window that calls tinyMCEPopup.requireLangPack() and needs access to the plugin language js files 
		 */
		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		/**
		 * Closes the specified window. This will also dispatch out a onClose event.
		 *
		 * @method close
		 * @param {Window} w Native window object to close.
		 */
		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		/**
		 * Creates a instance of a class. This method was needed since IE can't create instances
		 * of classes from a parent window due to some reference problem. Any arguments passed after the class name
		 * will be passed as arguments to the constructor.
		 *
		 * @method createInstance
		 * @param {String} cl Class name to create an instance of.
		 * @return {Object} Instance of the specified class.
		 * @example
		 * var uri = tinyMCEPopup.editor.windowManager.createInstance('tinymce.util.URI', 'http://www.somesite.com');
		 * alert(uri.getURI());
		 */
		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		/**
		 * Creates a confirm dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method confirm
		 * @param {String} t Title for the new confirm dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
		 * tinyMCE.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
		 *    if (s)
		 *       tinyMCE.activeEditor.windowManager.alert("Ok");
		 *    else
		 *       tinyMCE.activeEditor.windowManager.alert("Cancel");
		 * });
		 */
		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		/**
		 * Creates a alert dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method alert
		 * @param {String} t Title for the new alert dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Displays an alert box using the active editors window manager instance
		 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
		 */
		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		/**
		 * Resizes the specified window or id.
		 *
		 * @param {Number} dw Delta width.
		 * @param {Number} dh Delta height.
		 * @param {window/id} win Window if the dialog isn't inline. Id if the dialog is inline.
		 */
		resizeBy : function(dw, dh, win) {
			win.resizeBy(dw, dh);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}
	});
}(tinymce));