/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, is = tinymce.is;
	var isWebKit = tinymce.isWebKit, isIE = tinymce.isIE;

	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		listeners : {},
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,

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

		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @param {Window} w Optional window to get viewport of.
		 * @return {Object} Viewport object with fields top, left, width and height.
		 */
		getViewPort : function(w) {
			var d, b;

			w = !w ? window : w;
			d = w.document;
			b = this.boxModel ? d.documentElement : d.body;

			return {
				x : w.pageXOffset || b.scrollLeft,
				y : w.pageYOffset || b.scrollTop,
				w : w.innerWidth || b.clientWidth,
				h : w.innerHeight || b.clientHeight
			};
		},

		/**
		 * Returns a rectangle instance for a specific element.
		 *
		 * @param {Element} e Element to get rectange from.
		 * @return {object} Rectange instance for specified element.
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
		 * If the function then returns true it will stop the execution and return that node.
		 *
		 * @param {Node} n HTML node to search parents on.
		 * @param {function} f Selection function to execute on each node.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Node} DOMNode or null if it wasn't found.
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
		 * Returns the specified element by id.
		 *
		 * @param {string} n Element id to look for.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get : function(e) {
			if (typeof(e) == 'string')
				return this.doc.getElementById(e);

			return e;
		},

		walk : function(n, f, s) {
			var d = this.doc, w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(s || this, n);
			} else
				tinymce.walk(n, 'childNodes', f, s);
		},

		// #if !jquery

		/**
		 * #id
		 * p
		 * p, div
		 * p.class
		 * div p
		 * p[@id=3]
		 * p#id
		 */
		select : function(p, s) {
			var o = [], r = [], i, t = this, pl, ru, pu, x, u, xp;

			s = !s ? t.doc : t.get(s);

			// Simplest rule "tag"
			if (/^([a-z0-9]+)$/.test(p))
				return s.getElementsByTagName(p);

			// Parse pattern into rules
			for (i=0, pl=p.split(','); i<pl.length; i++) {
				ru = [];
				xp = '.';

				for (x=0, pu=pl[i].split(' '); x<pu.length; x++) {
					u = pu[x];

					if (u != '') {
						u = u.match(/^([\w\\]+)?(?:#([\w\\]+))?(?:\.([\w\\\.]+))?(?:\[\@([\w\\]+)([\^\$\*!]?=)([\w\\]+)\])?(?:\:([\w\\]+))?/i);

						// Build xpath if supported
						if (document.evaluate) {
							xp += u[1] ? '//' + u[1] : '//*';

							// Id
							if (u[2])
								xp += "[@id='" + u[2] + "']";

							// Class
							if (u[3]) {
								each(u[3].split('.'), function(i, n) {
									xp += "[@class = '" + n + "' or contains(concat(' ', @class, ' '), ' " + n + " ')]";
								});
							}

							// Attr
							if (u[4]) {
								// Comparators
								if (u[5]) {
									if (u[5] == '^=')
										xp += "[starts-with(@" + u[4] + ",'" + u[6] + "')]";
									else if (u[5] == '$=')
										xp += "[contains(concat(@" + u[4] + ",'\0'),'" + u[6] + "\0')]";
									else if (u[5] == '*=')
										xp += "[contains(@" + u[4] + ",'" + u[6] + "')]";
									else if (u[5] == '!=')
										xp += "[@" + u[4] + "!='" + u[6] + "']";
								} else
									xp += "[@" + u[4] + "='" + u[6] + "']";
							}

							//console.debug(u);
						} else
							ru.push({ tag : u[1], id : u[2], cls : u[3] ? new RegExp('\\b' + u[3].replace(/\./g, '|') + '\\b') : null, attr : u[4], val : u[5] });
					}
				}

				//console.debug(xp);

				if (xp.length > 1)
					ru.xpath = xp;

				r.push(ru);
			}

			// Used by IE since it doesn't support XPath
			function find(e, rl, p) {
				var nl, i, n, ru = rl[p];

				for (i=0, nl = e.getElementsByTagName(!ru.tag ? '*' : ru.tag); i<nl.length; i++) {
					n = nl[i];

					if (ru.id && n.id != ru.id)
						continue;

					if (ru.cls && !ru.cls.test(n.className))
						continue;

					if (ru.attr && t.getAttrib(n, ru.attr) != ru.val)
						continue;

					if (p < rl.length - 1)
						find(n, rl, p + 1);
					else
						o.push(n);
				}
			};

			// Find elements based on rules
			for (i=0; i<r.length; i++) {
				if (r[i].xpath) {
					ru = this.doc.evaluate(r[i].xpath, s, null, 4, null);

					while (u = ru.iterateNext())
						o.push(u);
				} else
					find(s, r[i], 0);
			}

			return o;
		},

		// #endif

		add : function(p, n, a, h) {
			var t = this, e, k;

			p = typeof(p) == 'string' ? t.get(p) : p;
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

			return p ? p.appendChild(e) : e;
		},

		addAll : function(te, ne) {
			var i, n, t = this;

			te = t.get(te);

			if (is(ne, 'string'))
				te.appendChild(t.doc.createTextNode(ne));
			else if (ne.length) {
				te = te.appendChild(t.create(ne[0], ne[1]));

				for (i=2; i<ne.length; i++)
					t.addAll(te, ne[i]);
			}
		},

		create : function(n, a, h) {
			return this.add(0, n, a, h);
		},

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

		remove : function(n, k) {
			var p;

			n = this.get(n);

			if (!n)
				return null;

			p = n.parentNode;

			if (!p)
				return null;

			if (k) {
				each (n.childNodes, function(c) {
					p.insertBefore(c.cloneNode(true), n);
				});
			}

			return p.removeChild(n);
		},

		/**
		 * Sets the CSS style value on a HTML element. The name can be a camelcase string
		 * or the CSS style name like background-color.
		 *
		 * @param {Element} n HTML element to set CSS style value on.
		 * @param {string} na Name of the style value to set.
		 * @param {string} v Value to set on the style.
		 */
		setStyle : function(n, na, v){
			var s, i;

			if (!n)
				return false;

			n = typeof(n) == 'string' ? n.split(',') : [n];

			for (i=0; i<n.length; i++) {
				s = this.get(n[i]);

				if (!s)
					continue;

				s = s.style;

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
							s.filter = "alpha(opacity=" + (v * 100) + ")";

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
			}
		},

		/**
		 * Returns the current style or runtime/computed value of a element.
		 *
		 * @param {Element} n HTML element to get style from.
		 * @param {string} na Style name to return.
		 * @param {string} c Computed style.
		 * @return {string} Current style or computed style value of a element.
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

		setStyles : function(e, o) {
			var t = this;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});
		},

		setAttrib : function(e, n, v) {
			var t = this, s = t.settings;

			e = t.get(e);

			if (!e)
				return 0;

			switch (n) {
				case "style":
					if (s.keep_values)
						e.setAttribute('mce_style', v, 2);

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

			if (v !== null && v.length !== 0)
				e.setAttribute(n, '' + v, 2);
			else
				e.removeAttribute(n, 2);

			return 1;
		},

		setAttribs : function(e, o) {
			var t = this;

			each(o, function(v, n) {
				t.setAttrib(e, n, v);
			});
		},

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
		 * Returns the absolute x, y position of a node. The position will be returned in a Point object.
		 *
		 * @param {Node} n HTML element to get x, y position from.
		 * @return {object} Absolute position of the specified element.
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

				return {x : n.left + e.scrollLeft - x, y : n.top + e.scrollTop - x};
			}

			while (n) {
				x += n.offsetLeft || 0;
				y += n.offsetTop || 0;
				n = n.offsetParent;
			}

			return {x : x, y : y};
		},

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

		addClass : function(e, c, b) {
			var o;

			e = this.get(e);

			if (!e || !c)
				return 0;

			o = this.removeClass(e, c);

			return e.className = b ? c + (o != '' ? (' ' + o) : '') : (o != '' ? (o + ' ') : '') + c;
		},

		removeClass : function(e, c) {
			e = this.get(e);

			if (!e)
				return 0;

			c = e.className.replace(new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g"), ' ');

			return e.className = c != ' ' ? c : '';
		},

		/**
		 * Replaces the specified class with a new one.
		 *
		 * @param {Element} e HTML element to replace CSS class in.
		 * @param {string] o CSS class to remove from HTML element.
		 * @param {string] n New CSS class to add to HTML element.
		 */
		replaceClass : function(e, o, n) {
			e = this.get(e);

			if (e)
				e.className = (e.className + '').replace(new RegExp('\\b' + o + '\\b', 'g'), n);
		},

		// #if !jquery

		/**
		 * Returns true if the specified element has the specified class.
		 *
		 * @param {Element} n HTML element to check CSS class on.
		 * @param {string] c CSS class to check for.
		 * @return {bool} true/false if the specified element has the specified class.
		 */
		hasClass : function(n, c) {
			n = this.get(n);

			if (!n || !c)
				return false;

			return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
		},

		// #endif

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element allreay exists.
		 *
		 * @param {string} p Optional prefix to add infront of all ids.
		 * @return {string} Unique id.
		 */
		uniqueId : function(p) {
			return (!p ? 'mce_' : p) + (this.counter++);
		},

		/**
		 * Shows the specified element by ID by setting the "display" style.
		 *
		 * @param {string} e ID of DOM element to show.
		 */
		show : function(e) {
			this.setStyle(e, 'display', 'block');
		},

		/**
		 * Hides the specified element by ID by setting the "display" style.
		 *
		 * @param {string} id ID of DOM element to hide.
		 */
		hide : function(e) {
			this.setStyle(e, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @param {string} id Id of element to check.
		 * @return {bool} true/false if the element is hidden or not.
		 */
		isHidden : function(e) {
			e = this.get(e);

			return e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		setHTML : function(e, h) {
			var t = this;

			e = t.get(e);
			h = t.processHTML(h);

			if (isIE) {
				// Fix for IE bug, first node comments gets stripped
				e.innerHTML = '<br />' + h;
				e.removeChild(e.firstChild);
			} else
				e.innerHTML = h;

			return h;
		},

		/**
		 * Processes the HTML by replacing strong, em, del in gecko since it doesn't support them
		 * properly in a RTE environment. It also converts any URLs in links and images and places
		 * a converted value into a separate attribute with the mce prefix like mce_src or mce_href.
		 *
		 * @param {string} h HTML to process.
		 * @return {string} Processed HTML code.
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

		setOuterHTML : function(e, h, d) {
			var n, t = this, tp;

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
		},

		decode : function(s) {
			var e = document.createElement("div");

			e.innerHTML = s;

			return !e.firstChild ? s : e.firstChild.nodeValue;
		},

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

		insertAfter : function(n, r) {
			var p, t = this, ns;

			n = t.get(n);
			r = t.get(r);

			p = r.parentNode;
			ns = r.nextSibling;

			if (ns)
				p.insertBefore(n, ns);
			else
				p.appendChild(n);

			return n;
		},

		isBlock : function(n) {
			if (n.nodeType && n.nodeType !== 1)
				return false;

			n = n.nodeName || n;

			return /^(H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|FORM|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(n);
		},

		replace : function(n, o, k) {
			n = this.get(n);
			o = this.get(o);

			if (k) {
				each (o.childNodes, function(c) {
					n.appendChild(c.cloneNode(true));
				});
			}

			return o.parentNode.replaceChild(n, o);
		},

		toHex : function(s, k) {
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
		}

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

	// Setup page DOM
	tinymce.DOM = new tinymce.dom.DOMUtils(document);
})();
