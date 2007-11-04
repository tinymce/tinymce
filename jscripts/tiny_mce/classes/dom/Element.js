/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.dom.Element', {
		Element : function(id, s) {
			var t = this, dom, el;

			s = s || {};
			t.id = id;
			t.dom = dom = s.dom || tinymce.DOM;
			t.settings = s;

			// Only IE leaks DOM references, this is a lot faster
			if (!tinymce.isIE)
				el = t.dom.get(t.id);

			each([
				'getPos',
				'getRect',
				'getParent',
				'add',
				'setStyle',
				'getStyle',
				'setStyles',
				'setAttrib',
				'setAttribs',
				'getAttrib',
				'addClass',
				'removeClass',
				'hasClass',
				'getOuterHTML',
				'setOuterHTML',
				'remove',
				'show',
				'hide',
				'isHidden',
				'setHTML',
				'get'
			], function(k) {
				t[k] = function() {
					var a = arguments, o;

					// Opera fails
					if (tinymce.isOpera) {
						a = [id];

						each(arguments, function(v) {
							a.push(v);
						});
					} else
						Array.prototype.unshift.call(a, el || id);

					o = dom[k].apply(dom, a);
					t.update(k);

					return o;
				};
			});
		},

		on : function(n, f, s) {
			return tinymce.dom.Event.add(this.id, n, f, s);
		},

		getXY : function() {
			return {
				x : parseInt(this.getStyle('left')),
				y : parseInt(this.getStyle('top'))
			};
		},

		getSize : function() {
			var n = this.dom.get(this.id);

			return {
				w : parseInt(this.getStyle('width') || n.clientWidth),
				h : parseInt(this.getStyle('height') || n.clientHeight)
			};
		},

		moveTo : function(x, y) {
			this.setStyles({left : x, top : y});
		},

		moveBy : function(x, y) {
			var p = this.getXY();

			this.moveTo(p.x + x, p.y + y);
		},

		resizeTo : function(w, h) {
			this.setStyles({width : w, height : h});
		},

		resizeBy : function(w, h) {
			var s = this.getSize();

			this.resizeTo(s.w + w, s.h + h);
		},

		update : function(k) {
			var t = this, b, dom = t.dom;

			if (tinymce.isIE6 && t.settings.blocker) {
				k = k || '';

				// Ignore getters
				if (k.indexOf('get') === 0 || k.indexOf('has') === 0 || k.indexOf('is') === 0)
					return;

				// Remove blocker on remove
				if (k == 'remove') {
					dom.remove(t.blocker);
					return;
				}

				if (!t.blocker) {
					t.blocker = dom.uniqueId();
					b = dom.add(t.settings.container || dom.getRoot(), 'iframe', {id : t.blocker, style : 'position:absolute;', frameBorder : 0, src : 'javascript:""'});
					dom.setStyle(b, 'opacity', 0);
				} else
					b = dom.get(t.blocker);

				dom.setStyle(b, 'left', t.getStyle('left', 1));
				dom.setStyle(b, 'top', t.getStyle('top', 1));
				dom.setStyle(b, 'width', t.getStyle('width', 1));
				dom.setStyle(b, 'height', t.getStyle('height', 1));
				dom.setStyle(b, 'display', t.getStyle('display', 1));
				dom.setStyle(b, 'zIndex', parseInt(t.getStyle('zIndex', 1) || 0) - 1);
			}
		}
	});
})();
