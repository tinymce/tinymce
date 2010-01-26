/**
 * DOMUtils.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var each = tinymce.each,
		is = tinymce.is,
		isWebKit = tinymce.isWebKit,
		isIE = tinymce.isIE,
		blockRe = /^(H[1-6R]|P|DIV|ADDRESS|PRE|FORM|T(ABLE|BODY|HEAD|FOOT|H|R|D)|LI|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|NOSCRIPT|MENU|ISINDEX|SAMP)$/,
		boolAttrs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected'),
		mceAttribs = makeMap('src,href,style,coords,shape'),
		encodedChars = {'&' : '&amp;', '"' : '&quot;', '<' : '&lt;', '>' : '&gt;'},
		encodeCharsRe = /[<>&\"]/g,
		simpleSelectorRe = /^([a-z0-9],?)+$/i,
		tagRegExp = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)(\s*\/?)>/g,
		attrRegExp = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	function makeMap(str) {
		var map = {}, i;

		str = str.split(',');
		for (i = str.length; i >= 0; i--)
			map[str[i]] = 1;

		return map;
	};

	/**
	 * Utility class for various DOM manipulation and retrival functions.
	 * @class tinymce.dom.DOMUtils
	 */
	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,
		props : {
			"for" : "htmlFor",
			"class" : "className",
			className : "className",
			checked : "checked",
			disabled : "disabled",
			maxlength : "maxLength",
			readonly : "readOnly",
			selected : "selected",
			value : "value",
			id : "id",
			name : "name",
			type : "type"
		},

		/**
		 * Constructs a new DOMUtils instance. Consult the Wiki for more details on settings etc for this class.
		 *
		 * @constructor
		 * @method DOMUtils
		 * @param {Document} d Document reference to bind the utility class to.
		 * @param {settings} s Optional settings collection.
		 */
		DOMUtils : function(d, s) {
			var t = this, globalStyle;

			t.doc = d;
			t.win = window;
			t.files = {};
			t.cssFlicker = false;
			t.counter = 0;
			t.boxModel = !tinymce.isIE || d.compatMode == "CSS1Compat"; 
			t.stdMode = d.documentMode === 8;

			t.settings = s = tinymce.extend({
				keep_values : false,
				hex_colors : 1,
				process_html : 1
			}, s);

			// Fix IE6SP2 flicker and check it failed for pre SP2
			if (tinymce.isIE6) {
				try {
					d.execCommand('BackgroundImageCache', false, true);
				} catch (e) {
					t.cssFlicker = true;
				}
			}

			// Build styles list
			if (s.valid_styles) {
				t._styles = {};

				// Convert styles into a rule list
				each(s.valid_styles, function(value, key) {
					t._styles[key] = tinymce.explode(value);
				});
			}

			tinymce.addUnload(t.destroy, t);
		},

		/**
		 * Returns the root node of the document this is normally the body but might be a DIV. Parents like getParent will not
		 * go above the point of this root node.
		 *
		 * @method getRoot
		 * @return {Element} Root element for the utility class.
		 */
		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @method getViewPort
		 * @param {Window} w Optional window to get viewport of.
		 * @return {Object} Viewport object with fields x, y, w and h.
		 */
		getViewPort : function(w) {
			var d, b;

			w = !w ? this.win : w;
			d = w.document;
			b = this.boxModel ? d.documentElement : d.body;

			// Returns viewport size excluding scrollbars
			return {
				x : w.pageXOffset || b.scrollLeft,
				y : w.pageYOffset || b.scrollTop,
				w : w.innerWidth || b.clientWidth,
				h : w.innerHeight || b.clientHeight
			};
		},

		/**
		 * Returns the rectangle for a specific element.
		 *
		 * @method getRect
		 * @param {Element/String} e Element object or element ID to get rectange from.
		 * @return {object} Rectange for specified element object with x, y, w, h fields.
		 */
		getRect : function(e) {
			var p, t = this, sr;

			e = t.get(e);
			p = t.getPos(e);
			sr = t.getSize(e);

			return {
				x : p.x,
				y : p.y,
				w : sr.w,
				h : sr.h
			};
		},

		/**
		 * Returns the size dimensions of the specified element.
		 *
		 * @method getSize
		 * @param {Element/String} e Element object or element ID to get rectange from.
		 * @return {object} Rectange for specified element object with w, h fields.
		 */
		getSize : function(e) {
			var t = this, w, h;

			e = t.get(e);
			w = t.getStyle(e, 'width');
			h = t.getStyle(e, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1)
				w = 0;

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1)
				h = 0;

			return {
				w : parseInt(w) || e.offsetWidth || e.clientWidth,
				h : parseInt(h) || e.offsetHeight || e.clientHeight
			};
		},

		/**
		 * Returns a node by the specified selector function. This function will
		 * loop through all parent nodes and call the specified function for each node.
		 * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
		 * and the node it found will be returned.
		 *
		 * @method getParent
		 * @param {Node/String} n DOM node to search parents on or ID string.
		 * @param {function} f Selection function to execute on each node or CSS pattern.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Node} DOM Node or null if it wasn't found.
		 */
		getParent : function(n, f, r) {
			return this.getParents(n, f, r, false);
		},

		/**
		 * Returns a node list of all parents matching the specified selector function or pattern.
		 * If the function then returns true indicating that it has found what it was looking for and that node will be collected.
		 *
		 * @method getParents
		 * @param {Node/String} n DOM node to search parents on or ID string.
		 * @param {function} f Selection function to execute on each node or CSS pattern.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Array} Array of nodes or null if it wasn't found.
		 */
		getParents : function(n, f, r, c) {
			var t = this, na, se = t.settings, o = [];

			n = t.get(n);
			c = c === undefined;

			if (se.strict_root)
				r = r || t.getRoot();

			// Wrap node name as func
			if (is(f, 'string')) {
				na = f;

				if (f === '*') {
					f = function(n) {return n.nodeType == 1;};
				} else {
					f = function(n) {
						return t.is(n, na);
					};
				}
			}

			while (n) {
				if (n == r || !n.nodeType || n.nodeType === 9)
					break;

				if (!f || f(n)) {
					if (c)
						o.push(n);
					else
						return n;
				}

				n = n.parentNode;
			}

			return c ? o : null;
		},

		/**
		 * Returns the specified element by ID or the input element if it isn't a string.
		 *
		 * @method get
		 * @param {String/Element} n Element id to look for or element to just pass though.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get : function(e) {
			var n;

			if (e && this.doc && typeof(e) == 'string') {
				n = e;
				e = this.doc.getElementById(e);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (e && e.id !== n)
					return this.doc.getElementsByName(n)[1];
			}

			return e;
		},

		/**
		 * Returns the next node that matches selector or function
		 *
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Next node item matching the selector or null if it wasn't found.
		 */
		getNext : function(node, selector) {
			return this._findSib(node, selector, 'nextSibling');
		},

		/**
		 * Returns the previous node that matches selector or function
		 *
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Previous node item matching the selector or null if it wasn't found.
		 */
		getPrev : function(node, selector) {
			return this._findSib(node, selector, 'previousSibling');
		},

		// #ifndef jquery

		/**
		 * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
		 * This function is optimized for the most common patterns needed in TinyMCE but it also performes good enough
		 * on more complex patterns.
		 *
		 * @method select
		 * @param {String} p CSS level 1 pattern to select/find elements by.
		 * @param {Object} s Optional root element/scope element to search in.
		 * @return {Array} Array with all matched elements.
		 */
		select : function(pa, s) {
			var t = this;

			return tinymce.dom.Sizzle(pa, t.get(s) || t.get(t.settings.root_element) || t.doc, []);
		},

		/**
		 * Returns true/false if the specified element matches the specified css pattern.
		 *
		 * @method is
		 * @param {Node/NodeList} n DOM node to match or an array of nodes to match.
		 * @param {String} selector CSS pattern to match the element agains.
		 */
		is : function(n, selector) {
			var i;

			// If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
			if (n.length === undefined) {
				// Simple all selector
				if (selector === '*')
					return n.nodeType == 1;

				// Simple selector just elements
				if (simpleSelectorRe.test(selector)) {
					selector = selector.toLowerCase().split(/,/);
					n = n.nodeName.toLowerCase();

					for (i = selector.length - 1; i >= 0; i--) {
						if (selector[i] == n)
							return true;
					}

					return false;
				}
			}

			return tinymce.dom.Sizzle.matches(selector, n.nodeType ? [n] : n).length > 0;
		},

		// #endif

		/**
		 * Adds the specified element to another element or elements.
		 *
		 * @method add
		 * @param {String/Element/Array} Element id string, DOM node element or array of id's or elements to add to.
		 * @param {String/Element} n Name of new element to add or existing element to add.
		 * @param {Object} a Optional object collection with arguments to add to the new element(s).
		 * @param {String} h Optional inner HTML contents to add for each element.
		 * @param {Boolean} c Optional internal state to indicate if it should create or add.
		 * @return {Element/Array} Element that got created or array with elements if multiple elements where passed.
		 */
		add : function(p, n, a, h, c) {
			var t = this;

			return this.run(p, function(p) {
				var e, k;

				e = is(n, 'string') ? t.doc.createElement(n) : n;
				t.setAttribs(e, a);

				if (h) {
					if (h.nodeType)
						e.appendChild(h);
					else
						t.setHTML(e, h);
				}

				return !c ? p.appendChild(e) : e;
			});
		},

		/**
		 * Creates a new element.
		 *
		 * @method create
		 * @param {String} n Name of new element.
		 * @param {Object} a Optional object name/value collection with element attributes.
		 * @param {String} h Optional HTML string to set as inner HTML of the element.
		 * @return {Element} HTML DOM node element that got created.
		 */
		create : function(n, a, h) {
			return this.add(this.doc.createElement(n), n, a, h, 1);
		},

		/**
		 * Create HTML string for element. The elemtn will be closed unless an empty inner HTML string is passed.
		 *
		 * @method createHTML
		 * @param {String} n Name of new element.
		 * @param {Object} a Optional object name/value collection with element attributes.
		 * @param {String} h Optional HTML string to set as inner HTML of the element.
		 * @return {String} String with new HTML element like for example: <a href="#">test</a>.
		 */
		createHTML : function(n, a, h) {
			var o = '', t = this, k;

			o += '<' + n;

			for (k in a) {
				if (a.hasOwnProperty(k))
					o += ' ' + k + '="' + t.encode(a[k]) + '"';
			}

			if (tinymce.is(h))
				return o + '>' + h + '</' + n + '>';

			return o + ' />';
		},

		/**
		 * Removes/deletes the specified element(s) from the DOM.
		 *
		 * @method remove
		 * @param {String/Element/Array} n ID of element or DOM element object or array containing multiple elements/ids.
		 * @param {Boolean} k Optional state to keep children or not. If set to true all children will be placed at the location of the removed element.
		 * @return {Element/Array} HTML DOM element that got removed or array of elements depending on input.
		 */
		remove : function(n, k) {
			var t = this;

			return this.run(n, function(n) {
				var p, g, i;

				p = n.parentNode;

				if (!p)
					return null;

				if (k) {
					for (i = n.childNodes.length - 1; i >= 0; i--)
						t.insertAfter(n.childNodes[i], n);

					//each(n.childNodes, function(c) {
					//	p.insertBefore(c.cloneNode(true), n);
					//});
				}

				// Fix IE psuedo leak
				if (t.fixPsuedoLeaks) {
					p = n.cloneNode(true);
					k = 'IELeakGarbageBin';
					g = t.get(k) || t.add(t.doc.body, 'div', {id : k, style : 'display:none'});
					g.appendChild(n);
					g.innerHTML = '';

					return p;
				}

				return p.removeChild(n);
			});
		},

		/**
		 * Sets the CSS style value on a HTML element. The name can be a camelcase string
		 * or the CSS style name like background-color.
		 *
		 * @method setStyle
		 * @param {String/Element/Array} n HTML element/Element ID or Array of elements/ids to set CSS style value on.
		 * @param {String} na Name of the style value to set.
		 * @param {String} v Value to set on the style.
		 */
		setStyle : function(n, na, v) {
			var t = this;

			return t.run(n, function(e) {
				var s, i;

				s = e.style;

				// Camelcase it, if needed
				na = na.replace(/-(\D)/g, function(a, b){
					return b.toUpperCase();
				});

				// Default px suffix on these
				if (t.pixelStyles.test(na) && (tinymce.is(v, 'number') || /^[\-0-9\.]+$/.test(v)))
					v += 'px';

				switch (na) {
					case 'opacity':
						// IE specific opacity
						if (isIE) {
							s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";

							if (!n.currentStyle || !n.currentStyle.hasLayout)
								s.display = 'inline-block';
						}

						// Fix for older browsers
						s[na] = s['-moz-opacity'] = s['-khtml-opacity'] = v || '';
						break;

					case 'float':
						isIE ? s.styleFloat = v : s.cssFloat = v;
						break;
					
					default:
						s[na] = v || '';
				}

				// Force update of the style data
				if (t.settings.update_styles)
					t.setAttrib(e, '_mce_style');
			});
		},

		/**
		 * Returns the current style or runtime/computed value of a element.
		 *
		 * @method getStyle
		 * @param {String/Element} n HTML element or element id string to get style from.
		 * @param {String} na Style name to return.
		 * @param {String} c Computed style.
		 * @return {String} Current style or computed style value of a element.
		 */
		getStyle : function(n, na, c) {
			n = this.get(n);

			if (!n)
				return false;

			// Gecko
			if (this.doc.defaultView && c) {
				// Remove camelcase
				na = na.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(n, null).getPropertyValue(na);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			na = na.replace(/-(\D)/g, function(a, b){
				return b.toUpperCase();
			});

			if (na == 'float')
				na = isIE ? 'styleFloat' : 'cssFloat';

			// IE & Opera
			if (n.currentStyle && c)
				return n.currentStyle[na];

			return n.style[na];
		},

		/**
		 * Sets multiple styles on the specified element(s).
		 *
		 * @method setStyles
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set styles on.
		 * @param {Object} o Name/Value collection of style items to add to the element(s).
		 */
		setStyles : function(e, o) {
			var t = this, s = t.settings, ol;

			ol = s.update_styles;
			s.update_styles = 0;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});

			// Update style info
			s.update_styles = ol;
			if (s.update_styles)
				t.setAttrib(e, s.cssText);
		},

		/**
		 * Sets the specified attributes value of a element or elements.
		 *
		 * @method setAttrib
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attribute on.
		 * @param {String} n Name of attribute to set.
		 * @param {String} v Value to set on the attribute of this value is falsy like null 0 or '' it will remove the attribute instead.
		 */
		setAttrib : function(e, n, v) {
			var t = this;

			// Whats the point
			if (!e || !n)
				return;

			// Strict XML mode
			if (t.settings.strict)
				n = n.toLowerCase();

			return this.run(e, function(e) {
				var s = t.settings;

				switch (n) {
					case "style":
						if (!is(v, 'string')) {
							each(v, function(v, n) {
								t.setStyle(e, n, v);
							});

							return;
						}

						// No mce_style for elements with these since they might get resized by the user
						if (s.keep_values) {
							if (v && !t._isRes(v))
								e.setAttribute('_mce_style', v, 2);
							else
								e.removeAttribute('_mce_style', 2);
						}

						e.style.cssText = v;
						break;

					case "class":
						e.className = v || ''; // Fix IE null bug
						break;

					case "src":
					case "href":
						if (s.keep_values) {
							if (s.url_converter)
								v = s.url_converter.call(s.url_converter_scope || t, v, n, e);

							t.setAttrib(e, '_mce_' + n, v, 2);
						}

						break;
					
					case "shape":
						e.setAttribute('_mce_style', v);
						break;
				}

				if (is(v) && v !== null && v.length !== 0)
					e.setAttribute(n, '' + v, 2);
				else
					e.removeAttribute(n, 2);
			});
		},

		/**
		 * Sets the specified attributes of a element or elements.
		 *
		 * @method setAttribs
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attributes on.
		 * @param {Object} o Name/Value collection of attribute items to add to the element(s).
		 */
		setAttribs : function(e, o) {
			var t = this;

			return this.run(e, function(e) {
				each(o, function(v, n) {
					t.setAttrib(e, n, v);
				});
			});
		},

		/**
		 * Returns the specified attribute by name.
		 *
		 * @method getAttrib
		 * @param {String/Element} e Element string id or DOM element to get attribute from.
		 * @param {String} n Name of attribute to get.
		 * @param {String} dv Optional default value to return if the attribute didn't exist.
		 * @return {String} Attribute value string, default value or null if the attribute wasn't found.
		 */
		getAttrib : function(e, n, dv) {
			var v, t = this;

			e = t.get(e);

			if (!e || e.nodeType !== 1)
				return false;

			if (!is(dv))
				dv = '';

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(n)) {
				v = e.getAttribute("_mce_" + n);

				if (v)
					return v;
			}

			if (isIE && t.props[n]) {
				v = e[t.props[n]];
				v = v && v.nodeValue ? v.nodeValue : v;
			}

			if (!v)
				v = e.getAttribute(n, 2);

			// Check boolean attribs
			if (/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(n)) {
				if (e[t.props[n]] === true && v === '')
					return n;

				return v ? n : '';
			}

			// Inner input elements will override attributes on form elements
			if (e.nodeName === "FORM" && e.getAttributeNode(n))
				return e.getAttributeNode(n).nodeValue;

			if (n === 'style') {
				v = v || e.style.cssText;

				if (v) {
					v = t.serializeStyle(t.parseStyle(v), e.nodeName);

					if (t.settings.keep_values && !t._isRes(v))
						e.setAttribute('_mce_style', v);
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && n === "class" && v)
				v = v.replace(/(apple|webkit)\-[a-z\-]+/gi, '');

			// Handle IE issues
			if (isIE) {
				switch (n) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (v === 1)
							v = '';

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (v === '+0' || v === 20 || v === 0)
							v = '';

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (v === 0)
							v = '';

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (v === -1)
							v = '';

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (v === 32768 || v === 2147483647 || v === '32768')
							v = '';

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (v === 65535)
							return n;

						return dv;

					case 'shape':
						v = v.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (n.indexOf('on') === 0 && v)
							v = ('' + v).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1');
				}
			}

			return (v !== undefined && v !== null && v !== '') ? '' + v : dv;
		},

		/**
		 * Returns the absolute x, y position of a node. The position will be returned in a object with x, y fields.
		 *
		 * @method getPos
		 * @param {Element/String} n HTML element or element id to get x, y position from.
		 * @param {Element} ro Optional root element to stop calculations at.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		getPos : function(n, ro) {
			var t = this, x = 0, y = 0, e, d = t.doc, r;

			n = t.get(n);
			ro = ro || d.body;

			if (n) {
				// Use getBoundingClientRect on IE, Opera has it but it's not perfect
				if (isIE && !t.stdMode) {
					n = n.getBoundingClientRect();
					e = t.boxModel ? d.documentElement : d.body;
					x = t.getStyle(t.select('html')[0], 'borderWidth'); // Remove border
					x = (x == 'medium' || t.boxModel && !t.isIE6) && 2 || x;
					n.top += t.win.self != t.win.top ? 2 : 0; // IE adds some strange extra cord if used in a frameset

					return {x : n.left + e.scrollLeft - x, y : n.top + e.scrollTop - x};
				}

				r = n;
				while (r && r != ro && r.nodeType) {
					x += r.offsetLeft || 0;
					y += r.offsetTop || 0;
					r = r.offsetParent;
				}

				r = n.parentNode;
				while (r && r != ro && r.nodeType) {
					x -= r.scrollLeft || 0;
					y -= r.scrollTop || 0;
					r = r.parentNode;
				}
			}

			return {x : x, y : y};
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parseStyle
		 * @param {String} st Style value to parse for example: border:1px solid red;.
		 * @return {Object} Object representation of that style like {border : '1px solid red'}
		 */
		parseStyle : function(st) {
			var t = this, s = t.settings, o = {};

			if (!st)
				return o;

			function compress(p, s, ot) {
				var t, r, b, l;

				// Get values and check it it needs compressing
				t = o[p + '-top' + s];
				if (!t)
					return;

				r = o[p + '-right' + s];
				if (t != r)
					return;

				b = o[p + '-bottom' + s];
				if (r != b)
					return;

				l = o[p + '-left' + s];
				if (b != l)
					return;

				// Compress
				o[ot] = l;
				delete o[p + '-top' + s];
				delete o[p + '-right' + s];
				delete o[p + '-bottom' + s];
				delete o[p + '-left' + s];
			};

			function compress2(ta, a, b, c) {
				var t;

				t = o[a];
				if (!t)
					return;

				t = o[b];
				if (!t)
					return;

				t = o[c];
				if (!t)
					return;

				// Compress
				o[ta] = o[a] + ' ' + o[b] + ' ' + o[c];
				delete o[a];
				delete o[b];
				delete o[c];
			};

			st = st.replace(/&(#?[a-z0-9]+);/g, '&$1_MCE_SEMI_'); // Protect entities

			each(st.split(';'), function(v) {
				var sv, ur = [];

				if (v) {
					v = v.replace(/_MCE_SEMI_/g, ';'); // Restore entities
					v = v.replace(/url\([^\)]+\)/g, function(v) {ur.push(v);return 'url(' + ur.length + ')';});
					v = v.split(':');
					sv = tinymce.trim(v[1]);
					sv = sv.replace(/url\(([^\)]+)\)/g, function(a, b) {return ur[parseInt(b) - 1];});

					sv = sv.replace(/rgb\([^\)]+\)/g, function(v) {
						return t.toHex(v);
					});

					if (s.url_converter) {
						sv = sv.replace(/url\([\'\"]?([^\)\'\"]+)[\'\"]?\)/g, function(x, c) {
							return 'url(' + s.url_converter.call(s.url_converter_scope || t, t.decode(c), 'style', null) + ')';
						});
					}

					o[tinymce.trim(v[0]).toLowerCase()] = sv;
				}
			});

			compress("border", "", "border");
			compress("border", "-width", "border-width");
			compress("border", "-color", "border-color");
			compress("border", "-style", "border-style");
			compress("padding", "", "padding");
			compress("margin", "", "margin");
			compress2('border', 'border-width', 'border-style', 'border-color');

			if (isIE) {
				// Remove pointless border
				if (o.border == 'medium none')
					o.border = '';
			}

			return o;
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serializeStyle
		 * @param {Object} o Object to serialize as string for example: {border : '1px solid red'}
		 * @param {String} name Optional element name.
		 * @return {String} String representation of the style object for example: border: 1px solid red.
		 */
		serializeStyle : function(o, name) {
			var t = this, s = '';

			function add(v, k) {
				if (k && v) {
					// Remove browser specific styles like -moz- or -webkit-
					if (k.indexOf('-') === 0)
						return;

					switch (k) {
						case 'font-weight':
							// Opera will output bold as 700
							if (v == 700)
								v = 'bold';

							break;

						case 'color':
						case 'background-color':
							v = v.toLowerCase();
							break;
					}

					s += (s ? ' ' : '') + k + ': ' + v + ';';
				}
			};

			// Validate style output
			if (name && t._styles) {
				each(t._styles['*'], function(name) {
					add(o[name], name);
				});

				each(t._styles[name.toLowerCase()], function(name) {
					add(o[name], name);
				});
			} else
				each(o, add);

			return s;
		},

		/**
		 * Imports/loads the specified CSS file into the document bound to the class.
		 *
		 * @method loadCSS
		 * @param {String} u URL to CSS file to load.
		 */
		loadCSS : function(u) {
			var t = this, d = t.doc, head;

			if (!u)
				u = '';

			head = t.select('head')[0];

			each(u.split(','), function(u) {
				var link;

				if (t.files[u])
					return;

				t.files[u] = true;
				link = t.create('link', {rel : 'stylesheet', href : tinymce._addVer(u)});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by realcing the document ones a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && d.documentMode) {
					link.onload = function() {
						d.recalc();
						link.onload = null;
					};
				}

				head.appendChild(link);
			});
		},

		/**
		 * Adds a class to the specified element or elements.
		 *
		 * @method addClass
		 * @param {String/Element/Array} Element ID string or DOM element or array with elements or IDs.
		 * @param {String} c Class name to add to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 */
		addClass : function(e, c) {
			return this.run(e, function(e) {
				var o;

				if (!c)
					return 0;

				if (this.hasClass(e, c))
					return e.className;

				o = this.removeClass(e, c);

				return e.className = (o != '' ? (o + ' ') : '') + c;
			});
		},

		/**
		 * Removes a class from the specified element or elements.
		 *
		 * @method removeClass
		 * @param {String/Element/Array} Element ID string or DOM element or array with elements or IDs.
		 * @param {String} c Class name to remove to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 */
		removeClass : function(e, c) {
			var t = this, re;

			return t.run(e, function(e) {
				var v;

				if (t.hasClass(e, c)) {
					if (!re)
						re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");

					v = e.className.replace(re, ' ');
					v = tinymce.trim(v != ' ' ? v : '');

					e.className = v;

					// Empty class attr
					if (!v)
						e.removeAttribute('class');

					return v;
				}

				return e.className;
			});
		},

		/**
		 * Returns true if the specified element has the specified class.
		 *
		 * @method hasClass
		 * @param {String/Element} n HTML element or element id string to check CSS class on.
		 * @param {String} c CSS class to check for.
		 * @return {Boolean} true/false if the specified element has the specified class.
		 */
		hasClass : function(n, c) {
			n = this.get(n);

			if (!n || !c)
				return false;

			return (' ' + n.className + ' ').indexOf(' ' + c + ' ') !== -1;
		},

		/**
		 * Shows the specified element(s) by ID by setting the "display" style.
		 *
		 * @method show
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to show.
		 */
		show : function(e) {
			return this.setStyle(e, 'display', 'block');
		},

		/**
		 * Hides the specified element(s) by ID by setting the "display" style.
		 *
		 * @method hide
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to hide.
		 */
		hide : function(e) {
			return this.setStyle(e, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @method isHidden
		 * @param {String/Element} e Id or element to check display state on.
		 * @return {Boolean} true/false if the element is hidden or not.
		 */
		isHidden : function(e) {
			e = this.get(e);

			return !e || e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element allready exists.
		 *
		 * @method uniqueId
		 * @param {String} p Optional prefix to add infront of all ids defaults to "mce_".
		 * @return {String} Unique id.
		 */
		uniqueId : function(p) {
			return (!p ? 'mce_' : p) + (this.counter++);
		},

		/**
		 * Sets the specified HTML content inside the element or elements. The HTML will first be processed this means
		 * URLs will get converted, hex color values fixed etc. Check processHTML for details.
		 *
		 * @method setHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set HTML inside.
		 * @param {String} h HTML content to set as inner HTML of the element.
		 */
		setHTML : function(e, h) {
			var t = this;

			return this.run(e, function(e) {
				var x, i, nl, n, p, x;

				h = t.processHTML(h);

				if (isIE) {
					function set() {
						// Remove all child nodes
						while (e.firstChild)
							e.firstChild.removeNode();

						try {
							// IE will remove comments from the beginning
							// unless you padd the contents with something
							e.innerHTML = '<br />' + h;
							e.removeChild(e.firstChild);
						} catch (ex) {
							// IE sometimes produces an unknown runtime error on innerHTML if it's an block element within a block element for example a div inside a p
							// This seems to fix this problem

							// Create new div with HTML contents and a BR infront to keep comments
							x = t.create('div');
							x.innerHTML = '<br />' + h;

							// Add all children from div to target
							each (x.childNodes, function(n, i) {
								// Skip br element
								if (i)
									e.appendChild(n);
							});
						}
					};

					// IE has a serious bug when it comes to paragraphs it can produce an invalid
					// DOM tree if contents like this <p><ul><li>Item 1</li></ul></p> is inserted
					// It seems to be that IE doesn't like a root block element placed inside another root block element
					if (t.settings.fix_ie_paragraphs)
						h = h.replace(/<p><\/p>|<p([^>]+)><\/p>|<p[^\/+]\/>/gi, '<p$1 _mce_keep="true">&nbsp;</p>');

					set();

					if (t.settings.fix_ie_paragraphs) {
						// Check for odd paragraphs this is a sign of a broken DOM
						nl = e.getElementsByTagName("p");
						for (i = nl.length - 1, x = 0; i >= 0; i--) {
							n = nl[i];

							if (!n.hasChildNodes()) {
								if (!n._mce_keep) {
									x = 1; // Is broken
									break;
								}

								n.removeAttribute('_mce_keep');
							}
						}
					}

					// Time to fix the madness IE left us
					if (x) {
						// So if we replace the p elements with divs and mark them and then replace them back to paragraphs
						// after we use innerHTML we can fix the DOM tree
						h = h.replace(/<p ([^>]+)>|<p>/ig, '<div $1 _mce_tmp="1">');
						h = h.replace(/<\/p>/g, '</div>');

						// Set the new HTML with DIVs
						set();

						// Replace all DIV elements with the _mce_tmp attibute back to paragraphs
						// This is needed since IE has a annoying bug see above for details
						// This is a slow process but it has to be done. :(
						if (t.settings.fix_ie_paragraphs) {
							nl = e.getElementsByTagName("DIV");
							for (i = nl.length - 1; i >= 0; i--) {
								n = nl[i];

								// Is it a temp div
								if (n._mce_tmp) {
									// Create new paragraph
									p = t.doc.createElement('p');

									// Copy all attributes
									n.cloneNode(false).outerHTML.replace(/([a-z0-9\-_]+)=/gi, function(a, b) {
										var v;

										if (b !== '_mce_tmp') {
											v = n.getAttribute(b);

											if (!v && b === 'class')
												v = n.className;

											p.setAttribute(b, v);
										}
									});

									// Append all children to new paragraph
									for (x = 0; x<n.childNodes.length; x++)
										p.appendChild(n.childNodes[x].cloneNode(true));

									// Replace div with new paragraph
									n.swapNode(p);
								}
							}
						}
					}
				} else
					e.innerHTML = h;

				return h;
			});
		},

		/**
		 * Processes the HTML by replacing strong, em, del in gecko since it doesn't support them
		 * properly in a RTE environment. It also converts any URLs in links and images and places
		 * a converted value into a separate attribute with the mce prefix like _mce_src or _mce_href.
		 *
		 * @method processHTML
		 * @param {String} h HTML to process.
		 * @return {String} Processed HTML code.
		 */
		processHTML : function(h) {
			var t = this, s = t.settings, codeBlocks = [];

			if (!s.process_html)
				return h;

			if (isIE) {
				h = h.replace(/&apos;/g, '&#39;'); // IE can't handle apos
				h = h.replace(/\s+(disabled|checked|readonly|selected)\s*=\s*[\"\']?(false|0)[\"\']?/gi, ''); // IE doesn't handle default values correct
			}

			// Fix some issues
			h = h.replace(/<a( )([^>]+)\/>|<a\/>/gi, '<a$1$2></a>'); // Force open

			// Store away src and href in _mce_src and mce_href since browsers mess them up
			if (s.keep_values) {
				// Wrap scripts and styles in comments for serialization purposes
				if (/<script|noscript|style/i.test(h)) {
					function trim(s) {
						// Remove prefix and suffix code for element
						s = s.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n');
						s = s.replace(/^[\r\n]*|[\r\n]*$/g, '');
						s = s.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g, '');
						s = s.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g, '');

						return s;
					};

					// Wrap the script contents in CDATA and keep them from executing
					h = h.replace(/<script([^>]+|)>([\s\S]*?)<\/script>/gi, function(v, attribs, text) {
						// Force type attribute
						if (!attribs)
							attribs = ' type="text/javascript"';

						// Convert the src attribute of the scripts
						attribs = attribs.replace(/src=\"([^\"]+)\"?/i, function(a, url) {
							if (s.url_converter)
								url = t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(url), 'src', 'script'));

							return '_mce_src="' + url + '"';
						});

						// Wrap text contents
						if (tinymce.trim(text)) {
							codeBlocks.push(trim(text));
							text = '<!--\nMCE_SCRIPT:' + (codeBlocks.length - 1) + '\n// -->';
						}

						return '<mce:script' + attribs + '>' + text + '</mce:script>';
					});

					// Wrap style elements
					h = h.replace(/<style([^>]+|)>([\s\S]*?)<\/style>/gi, function(v, attribs, text) {
						// Wrap text contents
						if (text) {
							codeBlocks.push(trim(text));
							text = '<!--\nMCE_SCRIPT:' + (codeBlocks.length - 1) + '\n-->';
						}

						return '<mce:style' + attribs + '>' + text + '</mce:style><style ' + attribs + ' _mce_bogus="1">' + text + '</style>';
					});

					// Wrap noscript elements
					h = h.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g, function(v, attribs, text) {
						return '<mce:noscript' + attribs + '><!--' + t.encode(text).replace(/--/g, '&#45;&#45;') + '--></mce:noscript>';
					});
				}

				h = h.replace(/<!\[CDATA\[([\s\S]+)\]\]>/g, '<!--[CDATA[$1]]-->');

				// This function processes the attributes in the HTML string to force boolean
				// attributes to the attr="attr" format and convert style, src and href to _mce_ versions
				function processTags(html) {
					return html.replace(tagRegExp, function(match, elm_name, attrs, end) {
						return '<' + elm_name + attrs.replace(attrRegExp, function(match, name, value, val2, val3) {
							var mceValue;

							name = name.toLowerCase();
							value = value || val2 || val3 || "";

							// Treat boolean attributes
							if (boolAttrs[name]) {
								// false or 0 is treated as a missing attribute
								if (value === 'false' || value === '0')
									return;

								return name + '="' + name + '"';
							}

							// Is attribute one that needs special treatment
							if (mceAttribs[name] && attrs.indexOf('_mce_' + name) == -1) {
								mceValue = t.decode(value);

								// Convert URLs to relative/absolute ones
								if (s.url_converter && (name == "src" || name == "href"))
									mceValue = s.url_converter.call(s.url_converter_scope || t, mceValue, name, elm_name);

								// Process styles lowercases them and compresses them
								if (name == 'style')
									mceValue = t.serializeStyle(t.parseStyle(mceValue), name);

								return name + '="' + value + '"' + ' _mce_' + name + '="' + t.encode(mceValue) + '"';
							}

							return match;
						}) + end + '>';
					});
				};

				h = processTags(h);

				// Restore script blocks
				h = h.replace(/MCE_SCRIPT:([0-9]+)/g, function(val, idx) {
					return codeBlocks[idx];
				});
			}

			return h;
		},

		/**
		 * Returns the outer HTML of an element.
		 *
		 * @method getOuterHTML
		 * @param {String/Element} e Element ID or element object to get outer HTML from.
		 * @return {String} Outer HTML string.
		 */
		getOuterHTML : function(e) {
			var d;

			e = this.get(e);

			if (!e)
				return null;

			if (e.outerHTML !== undefined)
				return e.outerHTML;

			d = (e.ownerDocument || this.doc).createElement("body");
			d.appendChild(e.cloneNode(true));

			return d.innerHTML;
		},

		/**
		 * Sets the specified outer HTML on a element or elements.
		 *
		 * @method setOuterHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set outer HTML on.
		 * @param {Object} h HTML code to set as outer value for the element.
		 * @param {Document} d Optional document scope to use in this process defaults to the document of the DOM class.
		 */
		setOuterHTML : function(e, h, d) {
			var t = this;

			function setHTML(e, h, d) {
				var n, tp;

				tp = d.createElement("body");
				tp.innerHTML = h;

				n = tp.lastChild;
				while (n) {
					t.insertAfter(n.cloneNode(true), e);
					n = n.previousSibling;
				}

				t.remove(e);
			};

			return this.run(e, function(e) {
				e = t.get(e);

				// Only set HTML on elements
				if (e.nodeType == 1) {
					d = d || e.ownerDocument || t.doc;

					if (isIE) {
						try {
							// Try outerHTML for IE it sometimes produces an unknown runtime error
							if (isIE && e.nodeType == 1)
								e.outerHTML = h;
							else
								setHTML(e, h, d);
						} catch (ex) {
							// Fix for unknown runtime error
							setHTML(e, h, d);
						}
					} else
						setHTML(e, h, d);
				}
			});
		},

		/**
		 * Entity decode a string, resolves any HTML entities like &aring;.
		 *
		 * @method decode
		 * @param {String} s String to decode entities on.
		 * @return {String} Entity decoded string.
		 */
		decode : function(s) {
			var e, n, v;

			// Look for entities to decode
			if (/&[\w#]+;/.test(s)) {
				// Decode the entities using a div element not super efficient but less code
				e = this.doc.createElement("div");
				e.innerHTML = s;
				n = e.firstChild;
				v = '';

				if (n) {
					do {
						v += n.nodeValue;
					} while (n = n.nextSibling);
				}

				return v || s;
			}

			return s;
		},

		/**
		 * Entity encodes a string, encodes the most common entities <>"& into entities.
		 *
		 * @method encode
		 * @param {String} s String to encode with entities.
		 * @return {String} Entity encoded string.
		 */
		encode : function(str) {
			return ('' + str).replace(encodeCharsRe, function(chr) {
				return encodedChars[chr];
			});
		},

		/**
		 * Inserts a element after the reference element.
		 *
		 * @method insertAfter
		 * @param {Element} Element to insert after the reference.
		 * @param {Element/String/Array} r Reference element, element id or array of elements to insert after.
		 * @return {Element/Array} Element that got added or an array with elements. 
		 */
		insertAfter : function(n, r) {
			var t = this;

			r = t.get(r);

			return this.run(n, function(n) {
				var p, ns;

				p = r.parentNode;
				ns = r.nextSibling;

				if (ns)
					p.insertBefore(n, ns);
				else
					p.appendChild(n);

				return n;
			});
		},

		/**
		 * Returns true/false if the specified element is a block element or not.
		 *
		 * @method isBlock
		 * @param {Node} n Element/Node to check.
		 * @return {Boolean} True/False state if the node is a block element or not.
		 */
		isBlock : function(n) {
			if (n.nodeType && n.nodeType !== 1)
				return false;

			n = n.nodeName || n;

			return blockRe.test(n);
		},

		/**
		 * Replaces the specified element or elements with the specified element, the new element will
		 * be cloned if multiple inputs elements are passed.
		 *
		 * @method replace
		 * @param {Element} n New element to replace old ones with.
		 * @param {Element/String/Array} o Element DOM node, element id or array of elements or ids to replace.
		 * @param {Boolean} k Optional keep children state, if set to true child nodes from the old object will be added to new ones.
		 */
		replace : function(n, o, k) {
			var t = this;

			if (is(o, 'array'))
				n = n.cloneNode(true);

			return t.run(o, function(o) {
				if (k) {
					each(tinymce.grep(o.childNodes), function(c) {
						n.appendChild(c);
					});
				}

				// Fix IE psuedo leak for elements since replacing elements if fairly common
				// Will break parentNode for some unknown reason
				if (t.fixPsuedoLeaks && o.nodeType === 1) {
					o.parentNode.insertBefore(n, o);
					t.remove(o);
					return n;
				}

				return o.parentNode.replaceChild(n, o);
			});
		},

		/**
		 * Renames the specified element to a new name and keep it's attributes and children.
		 *
		 * @method rename
		 * @param {Element} elm Element to rename.
		 * @param {String} name Name of the new element.
		 * @return New element or the old element if it needed renaming.
		 */
		rename : function(elm, name) {
			var t = this, newElm;

			if (elm.nodeName != name.toUpperCase()) {
				// Rename block element
				newElm = t.create(name);

				// Copy attribs to new block
				each(t.getAttribs(elm), function(attr_node) {
					t.setAttrib(newElm, attr_node.nodeName, t.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				t.replace(newElm, elm, 1);
			}

			return newElm || elm;
		},

		/**
		 * Find the common ancestor of two elements. This is a shorter method than using the DOM Range logic.
		 *
		 * @method findCommonAncestor
		 * @param {Element} a Element to find common ancestor of.
		 * @param {Element} b Element to find common ancestor of.
		 * @return {Element} Common ancestor element of the two input elements.
		 */
		findCommonAncestor : function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe)
					pe = pe.parentNode;

				if (ps == pe)
					break;

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument)
				return a.ownerDocument.documentElement;

			return ps;
		},

		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} s RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex : function(s) {
			var c = /^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(s);

			function hex(s) {
				s = parseInt(s).toString(16);

				return s.length > 1 ? s : '0' + s; // 0 -> 00
			};

			if (c) {
				s = '#' + hex(c[1]) + hex(c[2]) + hex(c[3]);

				return s;
			}

			return s;
		},

		/**
		 * Returns a array of all single CSS classes in the document. A single CSS class is a simple
		 * rule like ".class" complex ones like "div td.class" will not be added to output.
		 *
		 * @method getClasses
		 * @return {Array} Array with class objects each object has a class field might be other fields in the future.
		 */
		getClasses : function() {
			var t = this, cl = [], i, lo = {}, f = t.settings.class_filter, ov;

			if (t.classes)
				return t.classes;

			function addClasses(s) {
				// IE style imports
				each(s.imports, function(r) {
					addClasses(r);
				});

				each(s.cssRules || s.rules, function(r) {
					// Real type or fake it on IE
					switch (r.type || 1) {
						// Rule
						case 1:
							if (r.selectorText) {
								each(r.selectorText.split(','), function(v) {
									v = v.replace(/^\s*|\s*$|^\s\./g, "");

									// Is internal or it doesn't contain a class
									if (/\.mce/.test(v) || !/\.[\w\-]+$/.test(v))
										return;

									// Remove everything but class name
									ov = v;
									v = v.replace(/.*\.([a-z0-9_\-]+).*/i, '$1');

									// Filter classes
									if (f && !(v = f(v, ov)))
										return;

									if (!lo[v]) {
										cl.push({'class' : v});
										lo[v] = 1;
									}
								});
							}
							break;

						// Import
						case 3:
							addClasses(r.styleSheet);
							break;
					}
				});
			};

			try {
				each(t.doc.styleSheets, addClasses);
			} catch (ex) {
				// Ignore
			}

			if (cl.length > 0)
				t.classes = cl;

			return cl;
		},

		/**
		 * Executes the specified function on the element by id or dom element node or array of elements/id.
		 *
		 * @method run
		 * @param {String/Element/Array} Element ID or DOM element object or array with ids or elements.
		 * @param {function} f Function to execute for each item.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {Object/Array} Single object or array with objects depending on multiple input or not.
		 */
		run : function(e, f, s) {
			var t = this, o;

			if (t.doc && typeof(e) === 'string')
				e = t.get(e);

			if (!e)
				return false;

			s = s || this;
			if (!e.nodeType && (e.length || e.length === 0)) {
				o = [];

				each(e, function(e, i) {
					if (e) {
						if (typeof(e) == 'string')
							e = t.doc.getElementById(e);

						o.push(f.call(s, e, i));
					}
				});

				return o;
			}

			return f.call(s, e);
		},

		/**
		 * Returns an NodeList with attributes for the element.
		 *
		 * @method getAttribs
		 * @param {HTMLElement/string} n Element node or string id to get attributes from.
		 * @return {NodeList} NodeList with attributes.
		 */
		getAttribs : function(n) {
			var o;

			n = this.get(n);

			if (!n)
				return [];

			if (isIE) {
				o = [];

				// Object will throw exception in IE
				if (n.nodeName == 'OBJECT')
					return n.attributes;

				// IE doesn't keep the selected attribute if you clone option elements
				if (n.nodeName === 'OPTION' && this.getAttrib(n, 'selected'))
					o.push({specified : 1, nodeName : 'selected'});

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				n.cloneNode(false).outerHTML.replace(/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi, '').replace(/[\w:\-]+/gi, function(a) {
					o.push({specified : 1, nodeName : a});
				});

				return o;
			}

			return n.attributes;
		},

		/**
		 * Destroys all internal references to the DOM to solve IE leak issues.
		 *
		 * @method destroy
		 */
		destroy : function(s) {
			var t = this;

			if (t.events)
				t.events.destroy();

			t.win = t.doc = t.root = t.events = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		/**
		 * Created a new DOM Range object. This will use the native DOM Range API if it's
		 * available if it's not it will fallback to the custom TinyMCE implementation.
		 *
		 * @method createRng
		 * @return {DOMRange} DOM Range object.
		 */
		createRng : function() {
			var d = this.doc;

			return d.createRange ? d.createRange() : new tinymce.dom.Range(this);
		},

		/**
		 * Returns the index of the specified node within it's parent.
		 *
		 * @param {Node} node Node to look for.
		 * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
		 * @return {Number} Index of the specified node.
		 */
		nodeIndex : function(node, normalized) {
			var idx = 0, lastNode, nodeType;

			if (node) {
				for (node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
					nodeType = node.nodeType;

					// Text nodes needs special treatment if the normalized argument is specified
					if (normalized && nodeType == 3) {
						// Checks if the current node has contents and that the last node is a non text node or empty
						if (node.nodeValue.length > 0 && (lastNode.nodeType != nodeType || lastNode.nodeValue.length === 0))
							idx++;
					} else
						idx++;

					lastNode = node;
				}
			}

			return idx;
		},

		/**
		 * Splits an element into two new elements and places the specified split
		 * element or element between the new ones. For example splitting the paragraph at the bold element in
		 * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>. 
		 *
		 * @method split
		 * @param {Element} pe Parent element to split.
		 * @param {Element} e Element to split at.
		 * @param {Element} re Optional replacement element to replace the split element by.
		 * @return {Element} Returns the split element or the replacement element if that is specified.
		 */
		split : function(pe, e, re) {
			var t = this, r = t.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents, this makes sense
			// but we don't want that in our code since it serves no purpose for the end user
			// For example if this is chopped:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim of empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trim(node) {
				var i, children = node.childNodes;

				if (node.nodeType == 1 && node.getAttribute('_mce_type') == 'bookmark')
					return;

				for (i = children.length - 1; i >= 0; i--)
					trim(children[i]);

				if (node.nodeType != 9) {
					// Keep non whitespace text nodes
					if (node.nodeType == 3 && node.nodeValue.length > 0)
						return;

					if (node.nodeType == 1) {
						// If the only child is a bookmark then move it up
						children = node.childNodes;
						if (children.length == 1 && children[0] && children[0].nodeType == 1 && children[0].getAttribute('_mce_type') == 'bookmark')
							node.parentNode.insertBefore(children[0], node);

						// Keep non empty elements or img, hr etc
						if (children.length || /^(br|hr|input|img)$/i.test(node.nodeName))
							return;
					}

					t.remove(node);
				}

				return node;
			};

			if (pe && e) {
				// Get before chunk
				r.setStart(pe.parentNode, t.nodeIndex(pe));
				r.setEnd(e.parentNode, t.nodeIndex(e));
				bef = r.extractContents();

				// Get after chunk
				r = t.createRng();
				r.setStart(e.parentNode, t.nodeIndex(e) + 1);
				r.setEnd(pe.parentNode, t.nodeIndex(pe) + 1);
				aft = r.extractContents();

				// Insert before chunk
				pa = pe.parentNode;
				pa.insertBefore(trim(bef), pe);

				// Insert middle chunk
				if (re)
					pa.replaceChild(re, e);
				else
					pa.insertBefore(e, pe);

				// Insert after chunk
				pa.insertBefore(trim(aft), pe);
				t.remove(pe);

				return re || e;
			}
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method bind
		 * @param {Element/Document/Window/Array/String} o Object or element id string to add event handler to or an array of elements/ids/documents.
		 * @param {String} n Name of event handler to add for example: click.
		 * @param {function} f Function to execute when the event occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 */
		bind : function(target, name, func, scope) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.add(target, name, func, scope || this);
		},

		/**
		 * Removes the specified event handler by name and function from a element or collection of elements.
		 *
		 * @method unbind
		 * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
		 * @param {String} n Event handler name like for example: "click"
		 * @param {function} f Function to remove.
		 * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
		 */
		unbind : function(target, name, func) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.remove(target, name, func);
		},

		// #ifdef debug

		dumpRng : function(r) {
			return 'startContainer: ' + r.startContainer.nodeName + ', startOffset: ' + r.startOffset + ', endContainer: ' + r.endContainer.nodeName + ', endOffset: ' + r.endOffset;
		},

		// #endif

		_findSib : function(node, selector, name) {
			var t = this, f = selector;

			if (node) {
				// If expression make a function of it using is
				if (is(f, 'string')) {
					f = function(node) {
						return t.is(node, selector);
					};
				}

				// Loop all siblings
				for (node = node[name]; node; node = node[name]) {
					if (f(node))
						return node;
				}
			}

			return null;
		},

		_isRes : function(c) {
			// Is live resizble element
			return /^(top|left|bottom|right|width|height)/i.test(c) || /;\s*(top|left|bottom|right|width|height)/i.test(c);
		}

		/*
		walk : function(n, f, s) {
			var d = this.doc, w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(s || this, n);
			} else
				tinymce.walk(n, f, 'childNodes', s);
		}
		*/

		/*
		toRGB : function(s) {
			var c = /^\s*?#([0-9A-F]{2})([0-9A-F]{1,2})([0-9A-F]{2})?\s*?$/.exec(s);

			if (c) {
				// #FFF -> #FFFFFF
				if (!is(c[3]))
					c[3] = c[2] = c[1];

				return "rgb(" + parseInt(c[1], 16) + "," + parseInt(c[2], 16) + "," + parseInt(c[3], 16) + ")";
			}

			return s;
		}
		*/
	});

	/**
	 * Instance of DOMUtils for the current document.
	 *
	 * @property DOM
	 * @member tinymce
	 * @type tinymce.dom.DOMUtils
	 */
	tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
})(tinymce);
