/**
 * Element.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * Element class, this enables element blocking in IE. Element blocking is a method to block out select blockes that
	 * gets visible though DIVs on IE 6 it uses a iframe for this blocking. This class also shortens the length of some DOM API calls
	 * since it's bound to an element.
	 *
	 * @class tinymce.dom.Element
	 */

	/**
	 * Constructs a new Element instance. Consult the Wiki for more details on this class.
	 *
	 * @constructor
	 * @method Element
	 * @param {String} id Element ID to bind/execute methods on.
	 * @param {Object} settings Optional settings name/value collection.
	 */
	tinymce.dom.Element = function(id, settings) {
		var t = this, dom, el;

		t.settings = settings = settings || {};
		t.id = id;
		t.dom = dom = settings.dom || tinymce.DOM;

		// Only IE leaks DOM references, this is a lot faster
		if (!tinymce.isIE)
			el = dom.get(t.id);

		tinymce.each(
				('getPos,getRect,getParent,add,setStyle,getStyle,setStyles,' + 
				'setAttrib,setAttribs,getAttrib,addClass,removeClass,' + 
				'hasClass,getOuterHTML,setOuterHTML,remove,show,hide,' + 
				'isHidden,setHTML,get').split(/,/)
			, function(k) {
				t[k] = function() {
					var a = [id], i;

					for (i = 0; i < arguments.length; i++)
						a.push(arguments[i]);

					a = dom[k].apply(dom, a);
					t.update(k);

					return a;
				};
		});

		tinymce.extend(t, {
			/**
			 * Adds a event handler to the element.
			 *
			 * @method on
			 * @param {String} n Event name like for example "click".
			 * @param {function} f Function to execute on the specified event.
			 * @param {Object} s Optional scope to execute function on.
			 * @return {function} Event handler function the same as the input function.
			 */
			on : function(n, f, s) {
				return tinymce.dom.Event.add(t.id, n, f, s);
			},

			/**
			 * Returns the absolute X, Y cordinate of the element.
			 *
			 * @method getXY
			 * @return {Object} Objext with x, y cordinate fields.
			 */
			getXY : function() {
				return {
					x : parseInt(t.getStyle('left')),
					y : parseInt(t.getStyle('top'))
				};
			},

			/**
			 * Returns the size of the element by a object with w and h fields.
			 *
			 * @method getSize
			 * @return {Object} Object with element size with a w and h field.
			 */
			getSize : function() {
				var n = dom.get(t.id);

				return {
					w : parseInt(t.getStyle('width') || n.clientWidth),
					h : parseInt(t.getStyle('height') || n.clientHeight)
				};
			},

			/**
			 * Moves the element to a specific absolute position.
			 *
			 * @method moveTo
			 * @param {Number} x X cordinate of element position.
			 * @param {Number} y Y cordinate of element position.
			 */
			moveTo : function(x, y) {
				t.setStyles({left : x, top : y});
			},

			/**
			 * Moves the element relative to the current position.
			 *
			 * @method moveBy
			 * @param {Number} x Relative X cordinate of element position.
			 * @param {Number} y Relative Y cordinate of element position.
			 */
			moveBy : function(x, y) {
				var p = t.getXY();

				t.moveTo(p.x + x, p.y + y);
			},

			/**
			 * Resizes the element to a specific size.
			 *
			 * @method resizeTo
			 * @param {Number} w New width of element.
			 * @param {Numner} h New height of element.
			 */
			resizeTo : function(w, h) {
				t.setStyles({width : w, height : h});
			},

			/**
			 * Resizes the element relative to the current sizeto a specific size.
			 *
			 * @method resizeBy
			 * @param {Number} w Relative width of element.
			 * @param {Numner} h Relative height of element.
			 */
			resizeBy : function(w, h) {
				var s = t.getSize();

				t.resizeTo(s.w + w, s.h + h);
			},

			/**
			 * Updates the element blocker in IE6 based on the style information of the element.
			 *
			 * @method update
			 * @param {String} k Optional function key. Used internally.
			 */
			update : function(k) {
				var b;

				if (tinymce.isIE6 && settings.blocker) {
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
						b = dom.add(settings.container || dom.getRoot(), 'iframe', {id : t.blocker, style : 'position:absolute;', frameBorder : 0, src : 'javascript:""'});
						dom.setStyle(b, 'opacity', 0);
					} else
						b = dom.get(t.blocker);

					dom.setStyles(b, {
						left : t.getStyle('left', 1),
						top : t.getStyle('top', 1),
						width : t.getStyle('width', 1),
						height : t.getStyle('height', 1),
						display : t.getStyle('display', 1),
						zIndex : parseInt(t.getStyle('zIndex', 1) || 0) - 1
					});
				}
			}
		});
	};
})(tinymce);
