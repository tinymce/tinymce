/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, is = tinymce.is;
	var isWebKit = tinymce.isWebKit, isIE = tinymce.isIE;

	/**#@+
	 * @class Utility class for various DOM manipulation and retrival functions.
	 * @member tinymce.dom.DOMUtils
	 */
	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		listeners : {},
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,
		cache : {},
		idPattern : /^#[\w]+$/,
		elmPattern : /^[\w_*]+$/,
		elmClassPattern : /^([\w_]*)\.([\w_]+)$/,

		/**
		 * Constructs a new DOMUtils instance. Consult the Wiki for more details on settings etc for this class.
		 *
		 * @constructor
		 * @param {Document} d Document reference to bind the utility class to.
		 * @param {settings} s Optional settings collection.
		 */
		DOMUtils : function(d, s) {
			var t = this;

			t.doc = d;
			t.files = {};
			t.cssFlicker = false;
			t.counter = 0;
			t.boxModel = !tinymce.isIE || d.compatMode == "CSS1Compat"; 

			this.settings = tinymce.extend({
				keep_values : false,
				hex_colors : 1
			}, s);

			// Fix IE6SP2 flicker and check it failed for pre SP2
			if (tinymce.isIE6) {
				try {
					d.execCommand('BackgroundImageCache', false, true);
				} catch (e) {
					t.cssFlicker = true;
				}
			}

			tinymce.addUnload(function() {
				t.doc = t.root = null;
			});
		},

		/**#@+
		 * @method
		 */

		/**
		 * Returns the root node of the document this is normally the body but might be a DIV. Parents like getParent will not
		 * go above the point of this root node.
		 *
		 * @return {Element} Root element for the utility class.
		 */
		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @param {Window} w Optional window to get viewport of.
		 * @return {Object} Viewport object with fields x, y, w and h.
		 */
		getViewPort : function(w) {
			var d, b;

			w = !w ? window : w;
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
		 * @param {Element/String} e Element object or element ID to get rectange from.
		 * @return {object} Rectange for specified element object with x, y, w, h fields.
		 */
		getRect : function(e) {
			var p, t = this;

			e = t.get(e);
			p = t.getPos(e);

			return {
				x : p.x,
				y : p.y,
				w : parseInt(t.getStyle(e, 'width')) || e.offsetWidth || e.clientWidth,
				h : parseInt(t.getStyle(e, 'height')) || e.offsetHeight || e.clientHeight
			};
		},

		/**
		 * Returns a node by the specified selector function. This function will
		 * loop through all parent nodes and call the specified function for each node.
		 * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
		 * and the node it found will be returned.
		 *
		 * @param {Node/String} n DOM node to search parents on or ID string.
		 * @param {function} f Selection function to execute on each node.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Node} DOM Node or null if it wasn't found.
		 */
		getParent : function(n, f, r) {
			var na;

			n = this.get(n);

			// Wrap node name as func
			if (is(f, 'string')) {
				na = f.toUpperCase();

				f = function(n) {
					var s = false;

					// Any element
					if (n.nodeType == 1 && na === '*') {
						s = true;
						return false;
					}

					each(na.split(','), function(v) {
						if (n.nodeType == 1 && n.nodeName == v) {
							s = true;
							return false; // Break loop
						}
					});

					return s;
				};
			}

			while (n) {
				if (n == r)
					return null;

				if (f(n))
					return n;

				n = n.parentNode;
			}

			return null;
		},

		/**
		 * Returns the specified element by ID or the input element if it isn't a string.
		 *
		 * @param {String/Element} n Element id to look for or element to just pass though.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get : function(e) {
			if (typeof(e) == 'string')
				return this.doc.getElementById(e);

			return e;
		},

		// #if !jquery

		/**
		 * Selects specific elements by a CSS level 1 pattern. For example "div#a1 p.test".
		 * This function is optimized for the most common patterns needed in TinyMCE but it also performes good enough
		 * on more complex patterns.
		 *
		 * @param {String} p CSS level 1 pattern to select/find elements by.
		 * @param {Object} s Optional root element/scope element to search in.
		 * @return {Array} Array with all matched elements.
		 */
		select : function(pa, s) {
			var t = this, cs, c, pl, o = [], x, i, l, n;

			s = t.get(s) || t.doc;

			// Simple element pattern. For example: "p" or "*"
			if (t.elmPattern.test(pa)) {
				x = s.getElementsByTagName(pa);

				for (i = 0, l = x.length; i<l; i++)
					o.push(x[i]);

				return o;
			}

			// Simple class pattern. For example: "p.class" or ".class"
			if (t.elmClassPattern.test(pa)) {
				pl = t.elmClassPattern.exec(pa);
				x = s.getElementsByTagName(pl[1] || '*');
				c = ' ' + pl[2] + ' ';

				for (i = 0, l = x.length; i<l; i++) {
					n = x[i];

					if (n.className && (' ' + n.className + ' ').indexOf(c) !== -1)
						o.push(n);
				}

				return o;
			}

			function collect(n) {
				if (!n.mce_save) {
					n.mce_save = 1;
					o.push(n);
				}
			};

			function collectIE(n) {
				if (!n.getAttribute('mce_save')) {
					n.setAttribute('mce_save', '1');
					o.push(n);
				}
			};

			function find(n, f, r) {
				var i, l, nl = r.getElementsByTagName(n);

				for (i = 0, l = nl.length; i < l; i++)
					f(nl[i]);
			};

			each(pa.split(','), function(v, i) {
				v = tinymce.trim(v);

				// Simple element pattern, most common in TinyMCE
				if (t.elmPattern.test(v)) {
					each(s.getElementsByTagName(v), function(n) {
						collect(n);
					});

					return;
				}

				// Simple element pattern with class, fairly common in TinyMCE
				if (t.elmClassPattern.test(v)) {
					x = t.elmClassPattern.exec(v);

					each(s.getElementsByTagName(x[1]), function(n) {
						if (t.hasClass(n, x[2]))
							collect(n);
					});

					return;
				}

				if (!(cs = t.cache[pa])) {
					cs = 'x=(function(cf, s) {';
					pl = v.split(' ');

					each(pl, function(v) {
						var p = /^([\w\\*]+)?(?:#([\w\\]+))?(?:\.([\w\\\.]+))?(?:\[\@([\w\\]+)([\^\$\*!]?=)([\w\\]+)\])?(?:\:([\w\\]+))?/i.exec(v);

						// Find elements
						p[1] = p[1] || '*';
						cs += 'find("' + p[1] + '", function(n) {';

						// Check id
						if (p[2])
							cs += 'if (n.id !== "' + p[2] + '") return;';

						// Check classes
						if (p[3]) {
							cs += 'var c = " " + n.className + " ";';
							cs += 'if (';
							c = '';
							each(p[3].split('.'), function(v) {
								if (v)
									c += (c ? '||' : '') + 'c.indexOf(" ' + v + ' ") === -1';
							});
							cs += c + ') return;';
						}
					});

					cs += 'cf(n);';

					for (i = pl.length - 1; i >= 0; i--)
						cs += '}, ' + (i ? 'n' : 's') + ');';

					cs += '})';

					// Compile CSS pattern function
					t.cache[pa] = cs = eval(cs);
				}

				// Run selector function
				cs(isIE ? collectIE : collect, s);
			});

			// Cleanup
			each(o, function(n) {
				if (isIE)
					n.removeAttribute('mce_save');
				else
					delete n.mce_save;
			});

			return o;
		},

		// #endif

		/**
		 * Adds the specified element to another element or elements.
		 *
		 * @param {String/Element/Array} Element id string, DOM node element or array of id's or elements to add to.
		 * @param {String/Element} n Name of new element to add or existing element to add.
		 * @param {Object} a Optional object collection with arguments to add to the new element(s).
		 * @param {String} h Optional inner HTML contents to add for each element.
		 * @param {bool} c Optional internal state to indicate if it should create or add.
		 * @return {Element/Array} Element that got created or array with elements if multiple elements where passed.
		 */
		add : function(p, n, a, h, c) {
			var t = this;

			return this.run(p, function(p) {
				var e, k;

				e = is(n, 'string') ? t.doc.createElement(n) : n;

				if (a) {
					for (k in a) {
						if (a.hasOwnProperty(k) && !is(a[k], 'object'))
							t.setAttrib(e, k, '' + a[k]);
					}

					if (a.style && !is(a.style, 'string')) {
						each(a.style, function(v, n) {
							t.setStyle(e, n, v);
						});
					}
				}

				if (h) {
					if (h.nodeType)
						e.appendChild(h);
					else
						e.innerHTML = h;
				}

				return !c ? p.appendChild(e) : e;
			});
		},

		/**
		 * Creates a new element.
		 *
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

		// #if !jquery

		/**
		 * Removes/deletes the specified element(s) from the DOM.
		 *
		 * @param {String/Element/Array} n ID of element or DOM element object or array containing multiple elements/ids.
		 * @param {bool} k Optional state to keep children or not. If set to true all children will be placed at the location of the removed element.
		 * @return {Element/Array} HTML DOM element that got removed or array of elements depending on input.
		 */
		remove : function(n, k) {
			return this.run(n, function(n) {
				var p;

				p = n.parentNode;

				if (!p)
					return null;

				if (k) {
					each (n.childNodes, function(c) {
						p.insertBefore(c.cloneNode(true), n);
					});
				}

				return p.removeChild(n);
			});
		},

		/**
		 * Sets the CSS style value on a HTML element. The name can be a camelcase string
		 * or the CSS style name like background-color.
		 *
		 * @param {String/Element/Array} n HTML element/Element ID or Array of elements/ids to set CSS style value on.
		 * @param {String} na Name of the style value to set.
		 * @param {String} v Value to set on the style.
		 */
		setStyle : function(n, na, v) {
			return this.run(n, function(e) {
				var s, i;

				s = e.style;

				// Camelcase it, if needed
				na = na.replace(/-(\D)/g, function(a, b){
					return b.toUpperCase();
				});

				// Default px suffix on these
				if (this.pixelStyles.test(na) && (tinymce.is(v, 'number') || /^[\-0-9\.]+$/.test(v)))
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
						s['-moz-opacity'] = s['-khtml-opacity'] = v;
						break;

					case 'float':
						isIE ? s.styleFloat = v : s.cssFloat = v;
						break;
				}

				s[na] = v;
			});
		},

		/**
		 * Returns the current style or runtime/computed value of a element.
		 *
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
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set styles on.
		 * @param {Object} o Name/Value collection of style items to add to the element(s).
		 */
		setStyles : function(e, o) {
			var t = this;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});
		},

		/**
		 * Sets the specified attributes value of a element or elements.
		 *
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attribute on.
		 * @param {String} n Name of attribute to set.
		 * @param {String} v Value to set on the attribute of this value is falsy like null 0 or '' it will remove the attribute instead.
		 */
		setAttrib : function(e, n, v) {
			var t = this;

			return this.run(e, function(e) {
				var s = t.settings;

				switch (n) {
					case "style":
						if (s.keep_values) {
							if (v)
								e.setAttribute('mce_style', v, 2);
							else
								e.removeAttribute('mce_style', 2);
						}

						e.style.cssText = v;
						break;

					case "class":
						e.className = v;
						break;

					case "src":
					case "href":
						if (s.keep_values) {
							if (s.url_converter)
								v = s.url_converter.call(s.url_converter_scope || t, v, n, e);

							t.setAttrib(e, 'mce_' + n, v, 2);
						}

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
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attributes on.
		 * @param {Object} o Name/Value collection of attribute items to add to the element(s).
		 */
		setAttribs : function(e, o) {
			var t = this;

			each(o, function(v, n) {
				t.setAttrib(e, n, v);
			});
		},

		// #endif

		/**
		 * Returns the specified attribute by name.
		 *
		 * @param {String/Element} e Element string id or DOM element to get attribute from.
		 * @param {String} n Name of attribute to get.
		 * @param {String} dv Optional default value to return if the attribute didn't exist.
		 * @return {String} Attribute value string, default value or null if the attribute wasn't found.
		 */
		getAttrib : function(e, n, dv) {
			var v, t = this;

			e = t.get(e);

			if (!e)
				return false;

			if (!is(dv))
				dv = "";

			// Try the mce variant for these
			if (/^(src|href|style)$/.test(n)) {
				v = t.getAttrib(e, "mce_" + n);

				if (v)
					return v;
			}

			v = e.getAttribute(n, 2);

			if (!v) {
				switch (n) {
					case 'class':
						v = e.className;
						break;

					default:
						v = e.attributes[n];
						v = v && is(v.nodeValue) ? v.nodeValue : v;
				}
			}

			switch (n) {
				case 'style':
					v = v || e.style.cssText;

					if (v) {
						v = t.serializeStyle(t.parseStyle(v));

						if (t.settings.keep_values)
							e.setAttribute('mce_style', v);
					}

					break;
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && n == "class" && v)
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
						if (v === '+0')
							v = '';

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (v === -1)
							v = '';

						break;

					case 'tabindex':
						// IE returns 32768 as default value
						if (v === 32768)
							v = '';

						break;

					default:
						// IE has odd anonymous function for event attributes
						if (n.indexOf('on') === 0 && v)
							v = ('' + v).replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1');
				}
			}

			return (v && v != '') ? '' + v : dv;
		},

		/**
		 * Returns the absolute x, y position of a node. The position will be returned in a object with x, y fields.
		 *
		 * @param {Element/String} n HTML element or element id to get x, y position from.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		getPos : function(n) {
			var t = this, x = 0, y = 0, e, d = t.doc;

			n = t.get(n);

			// Use getBoundingClientRect on IE, Opera has it but it's not perfect
			if (n && isIE) {
				n = n.getBoundingClientRect();
				e = t.boxModel ? d.documentElement : d.body;
				x = t.getStyle(t.select('html')[0], 'borderWidth'); // Remove border
				x = (x == 'medium' || t.boxModel && !t.isIE6) && 2 || x;
				n.top += window.self != window.top ? 2 : 0; // IE adds some strange extra cord if used in a frameset

				return {x : n.left + e.scrollLeft - x, y : n.top + e.scrollTop - x};
			}

			while (n) {
				x += n.offsetLeft || 0;
				y += n.offsetTop || 0;
				n = n.offsetParent;
			}

			return {x : x, y : y};
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
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

			each(st.split(';'), function(v) {
				var sv;

				if (v) {
					v = v.split(':');
					sv = tinymce.trim(v[1]);

					sv = sv.replace(/rgb\([^\)]+\)/g, function(v) {
						return t.toHex(v);
					});

					if (s.url_converter) {
						sv = sv.replace(/url\([\'\"]?([^\)\'\"]+)\)/g, function(x, c) {
							return 'url(' + t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(c), 'style', null)) + ')';
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

			return o;
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @param {Object} o Object to serialize as string for example: {border : '1px solid red'}
		 * @return {String} String representation of the style object for example: border: 1px solid red.
		 */
		serializeStyle : function(o) {
			var s = '';

			each(o, function(v, k) {
				if (k && v) {
					switch (k) {
						case 'color':
						case 'background-color':
							v = v.toLowerCase();
							break;
					}

					s += (s ? ' ' : '') + k + ': ' + v + ';';
				}
			});

			return s;
		},

		/**
		 * Imports/loads the specified CSS file into the document bound to the class.
		 *
		 * @param {String} u URL to CSS file to load.
		 */
		loadCSS : function(u) {
			var t = this, d = this.doc;

			if (!u)
				u = '';

			each(u.split(','), function(u) {
				if (t.files[u])
					return;

				t.files[u] = true;

				if (!d.createStyleSheet)
					t.add(t.select('head')[0], 'link', {rel : 'stylesheet', href : u});
				else
					d.createStyleSheet(u);
			});
		},

		/**
		 * Adds a class to the specified element or elements.
		 *
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

		// #if !jquery

		/**
		 * Removes a class from the specified element or elements.
		 *
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

					return e.className = tinymce.trim(v != ' ' ? v : '');
				}

				return e.className;
			});
		},

		/**
		 * Returns true if the specified element has the specified class.
		 *
		 * @param {String/Element} n HTML element or element id string to check CSS class on.
		 * @param {String] c CSS class to check for.
		 * @return {bool} true/false if the specified element has the specified class.
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
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to show.
		 */
		show : function(e) {
			return this.setStyle(e, 'display', 'block');
		},

		/**
		 * Hides the specified element(s) by ID by setting the "display" style.
		 *
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to hide.
		 */
		hide : function(e) {
			return this.setStyle(e, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @param {String/Element} e Id or element to check display state on.
		 * @return {bool} true/false if the element is hidden or not.
		 */
		isHidden : function(e) {
			e = this.get(e);

			return e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		// #endif

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element allready exists.
		 *
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
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set HTML inside.
		 * @param {String} h HTML content to set as inner HTML of the element.
		 */
		setHTML : function(e, h) {
			var t = this;

			return this.run(e, function(e) {
				h = t.processHTML(h);

				if (isIE) {
					// Fix for IE bug, first node comments gets stripped
					e.innerHTML = '<br />' + h;
					e.removeChild(e.firstChild);
				} else
					e.innerHTML = h;

				return h;
			});
		},

		/**
		 * Processes the HTML by replacing strong, em, del in gecko since it doesn't support them
		 * properly in a RTE environment. It also converts any URLs in links and images and places
		 * a converted value into a separate attribute with the mce prefix like mce_src or mce_href.
		 *
		 * @param {String} h HTML to process.
		 * @return {String} Processed HTML code.
		 */
		processHTML : function(h) {
			var t = this, s = t.settings;

			// Convert strong and em to b and i in FF since it can't handle them
			if (tinymce.isGecko) {
				h = h.replace(/<(\/?)strong>|<strong( [^>]+)>/gi, '<$1b$2>');
				h = h.replace(/<(\/?)em>|<em( [^>]+)>/gi, '<$1i$2>');
			}

			// Store away src and href in mce_src and mce_href since browsers mess them up
			if (s.keep_values) {
				// Process all tags with src, href or style
				h = h.replace(/<([\w:]+) [^>]*(src|href|style)[^>]*>/gi, function(a, n) {
					function handle(m, b, c) {
						var u = c;

						// Tag already got a mce_ version
						if (a.indexOf('mce_' + b) != -1)
							return m;

						if (b == 'style') {
							// Why did I need this one?
							//if (isIE)
							//	u = t.serializeStyle(t.parseStyle(u));

							if (s.hex_colors) {
								u = u.replace(/rgb\([^\)]+\)/g, function(v) {
									return t.toHex(v);
								});
							}

							if (s.url_converter) {
								u = u.replace(/url\([\'\"]?([^\)\'\"]+)\)/g, function(x, c) {
									return 'url(' + t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(c), b, n)) + ')';
								});
							}
						} else {
							if (s.url_converter)
								u = t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(c), b, n));
						}

						return ' ' + b + '="' + c + '" mce_' + b + '="' + u + '"';
					};

					a = a.replace(/ (src|href|style)=[\"\']([^\"\']+)[\"\']/gi, handle); // W3C
					return a.replace(/ (src|href|style)=([^\s\"\'>]+)/gi, handle); // IE
				});
			}

			return h;
		},

		/**
		 * Returns the outer HTML of an element.
		 *
		 * @param {String/Element} e Element ID or element object to get outer HTML from.
		 * @return {String} Outer HTML string.
		 */
		getOuterHTML : function(e) {
			var d;

			e = this.get(e);

			if (!e)
				return null;

			if (isIE)
				return e.outerHTML;

			d = (e.ownerDocument || this.doc).createElement("body");
			d.appendChild(e.cloneNode(true));

			return d.innerHTML;
		},

		/**
		 * Sets the specified outer HTML on a element or elements.
		 *
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set outer HTML on.
		 * @param {Object} h HTML code to set as outer value for the element.
		 * @param {Document} d Optional document scope to use in this process defaults to the document of the DOM class.
		 */
		setOuterHTML : function(e, h, d) {
			var t = this;

			return this.run(e, function(e) {
				var n, tp;

				e = t.get(e);
				d = d || e.ownerDocument || t.doc;

				if (isIE && e.nodeType == 1)
					e.outerHTML = h;
				else {
					tp = d.createElement("body");
					tp.innerHTML = h;

					n = tp.firstChild;
					while (n) {
						t.insertAfter(n.cloneNode(true), e);
						n = n.nextSibling;
					}

					t.remove(e);
				}
			});
		},

		/**
		 * Entity decode a string, resolves any HTML entities like &aring;.
		 *
		 * @param {String} s String to decode entities on.
		 * @return {String} Entity decoded string.
		 */
		decode : function(s) {
			var e = document.createElement("div");

			e.innerHTML = s;

			return !e.firstChild ? s : e.firstChild.nodeValue;
		},

		/**
		 * Entity encodes a string, encodes the most common entities <>"& into entities.
		 *
		 * @param {String} s String to encode with entities.
		 * @return {String} Entity encoded string.
		 */
		encode : function(s) {
			return s ? ('' + s).replace(/[<>&\"]/g, function (c, b) {
				switch (c) {
					case '&':
						return '&amp;';

					case '"':
						return '&quot;';

					case '<':
						return '&lt;';

					case '>':
						return '&gt;';
				}

				return c;
			}) : s;
		},

		// #if !jquery

		/**
		 * Inserts a element after the reference element.
		 *
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

		// #endif

		/**
		 * Returns true/false if the specified element is a block element or not.
		 *
		 * @param {Node} n Element/Node to check.
		 * @return {bool} True/False state if the node is a block element or not.
		 */
		isBlock : function(n) {
			if (n.nodeType && n.nodeType !== 1)
				return false;

			n = n.nodeName || n;

			return /^(H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|FORM|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(n);
		},

		// #if !jquery

		/**
		 * Replaces the specified element or elements with the specified element, the new element will
		 * be cloned if multiple inputs elements are passed.
		 *
		 * @param {Element} n New element to replace old ones with.
		 * @param {Element/String/Array} o Element DOM node, element id or array of elements or ids to replace.
		 * @param {bool} k Optional keep children state, if set to true child nodes from the old object will be added to new ones.
		 */
		replace : function(n, o, k) {
			if (is(o, 'array'))
				n = n.cloneNode(true);

			return this.run(o, function(o) {
				if (k) {
					each(o.childNodes, function(c) {
						n.appendChild(c.cloneNode(true));
					});
				}

				return o.parentNode.replaceChild(n, o);
			});
		},

		// #endif

		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
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
		 * @return {Array} Array with class objects each object has a class field might be other fields in the future.
		 */
		getClasses : function() {
			var t = this, cl = [], i, lo = {};

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

									if (/^\.mce/.test(v) || !/^\.[\w\-]+$/.test(v))
										return;

									v = v.substring(1);
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
		 * @param {String/Element/Array} Element ID or DOM element object or array with ids or elements.
		 * @param {function} f Function to execute for each item.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {Object/Array} Single object or array with objects depending on multiple input or not.
		 */
		run : function(e, f, s) {
			var t = this, o;

			if (typeof(e) === 'string')
				e = t.doc.getElementById(e);

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

		/**#@-*/
	});

	// Setup page DOM
	tinymce.DOM = new tinymce.dom.DOMUtils(document);
})();
