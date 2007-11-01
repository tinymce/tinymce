/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	tinymce.create('tinymce.WindowManager', {
		WindowManager : function(ed) {
			var t = this;
			t.editor = ed;
			t.onOpen = new tinymce.util.Dispatcher(t);
			t.onClose = new tinymce.util.Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		open : function(s, p) {
			var f = '', x, y, mo = this.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort();

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

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				} else
					s.modal = s.alwaysRaised = s.dialog = s.centerscreen = s.dependent = true;
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

			this.features = s;
			this.params = p;
			t.onOpen.dispatch(s, p);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(s.url || s.file, window, f);
				} else
					w = window.open(s.url || s.file, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(this.editor.getLang('popup_blocked'));
		},

		close : function(w) {
			w.close();
			t.onClose.dispatch();
		},

		setTitle : function(v) {
		},

		getParam : function(n, dv) {
			var v = this.params[n];

			return tinymce.is(v) ? v : dv;
		},

		getFeature : function(n, dv) {
			return this.features[n] || dv;
		},

		createDOM : function(doc, s) {
			return new tinymce.dom.DOMUtils(doc, s);
		},

		confirm : function(t, cb, s) {
			cb.call(s || this, confirm(this._decode(this.editor.getLang(t, t))));
		},

		alert : function(t, cb, s) {
			alert(this._decode(t));

			if (cb)
				cb.call(s || this);
		},

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}
	});
}());