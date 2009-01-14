/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	/**#@+
	 * @class Element class, this enables element blocking in IE. Element blocking is a method to block out select blockes that
	 * gets visible though DIVs on IE 6 it uses a iframe for this blocking. This class also shortens the length of some DOM API calls
	 * since it's bound to an element.
	 * @member tinymce.dom.Element
	 */
	tinymce.create('tinymce.dom.Element', {
		/**
		 * Constructs a new Element instance. Consult the Wiki for more details on this class.
		 *
		 * @constructor
		 * @param {String} Element ID to bind/execute methods on.
		 * @param {Object} Optional settings name/value collection.
		 */
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
					var a = [id], i;

					for (i = 0; i < arguments.length; i++)
						a.push(arguments[i]);

					a = dom[k].apply(dom, a);
					t.update(k);

					return a;
				};
			});
		},

		/**#@+
		 * @method
		 */

		/**
		 * Adds a event handler to the element.
		 *
		 * @param {String} n Event name like for example "click".
		 * @param {function} f Function to execute on the specified event.
		 * @param {Object} s Optional scope to execute function on.
		 * @return {function} Event handler function the same as the input function.
		 */
		on : function(n, f, s) {
			return tinymce.dom.Event.add(this.id, n, f, s);
		},

		/**
		 * Returns the absolute X, Y cordinate of the element.
		 *
		 * @return {Object} Objext with x, y cordinate fields.
		 */
		getXY : function() {
			return {
				x : parseInt(this.getStyle('left')),
				y : parseInt(this.getStyle('top'))
			};
		},

		/**
		 * Returns the size of the element by a object with w and h fields.
		 *
		 * @return {Object} Object with element size with a w and h field.
		 */
		getSize : function() {
			var n = this.dom.get(this.id);

			return {
				w : parseInt(this.getStyle('width') || n.clientWidth),
				h : parseInt(this.getStyle('height') || n.clientHeight)
			};
		},

		/**
		 * Moves the element to a specific absolute position.
		 *
		 * @param {Number} x X cordinate of element position.
		 * @param {Number} y Y cordinate of element position.
		 */
		moveTo : function(x, y) {
			this.setStyles({left : x, top : y});
		},

		/**
		 * Moves the element relative to the current position.
		 *
		 * @param {Number} x Relative X cordinate of element position.
		 * @param {Number} y Relative Y cordinate of element position.
		 */
		moveBy : function(x, y) {
			var p = this.getXY();

			this.moveTo(p.x + x, p.y + y);
		},

		/**
		 * Resizes the element to a specific size.
		 *
		 * @param {Number} w New width of element.
		 * @param {Numner} h New height of element.
		 */
		resizeTo : function(w, h) {
			this.setStyles({width : w, height : h});
		},

		/**
		 * Resizes the element relative to the current sizeto a specific size.
		 *
		 * @param {Number} w Relative width of element.
		 * @param {Numner} h Relative height of element.
		 */
		resizeBy : function(w, h) {
			var s = this.getSize();

			this.resizeTo(s.w + w, s.h + h);
		},

		/**
		 * Updates the element blocker in IE6 based on the style information of the element.
		 *
		 * @param {String} k Optional function key. Used internally.
		 */
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

		/**#@-*/
	});
})();
