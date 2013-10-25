/**
 * DOMUtils.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for various DOM manipulation and retrieval functions.
 *
 * @class tinymce.dom.DOMUtils
 * @example
 * // Add a class to an element by id in the page
 * tinymce.DOM.addClass('someid', 'someclass');
 *
 * // Add a class to an element by id inside the editor
 * tinymce.activeEditor.dom.addClass('someid', 'someclass');
 */
define("tinymce/dom/DOMUtils", [
	"tinymce/dom/Sizzle",
	"tinymce/html/Styles",
	"tinymce/dom/EventUtils",
	"tinymce/dom/TreeWalker",
	"tinymce/dom/Range",
	"tinymce/html/Entities",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Sizzle, Styles, EventUtils, TreeWalker, Range, Entities, Env, Tools) {
	// Shorten names
	var each = Tools.each, is = Tools.is, grep = Tools.grep, trim = Tools.trim, extend = Tools.extend;
	var isWebKit = Env.webkit, isIE = Env.ie;
	var simpleSelectorRe = /^([a-z0-9],?)+$/i;
	var whiteSpaceRegExp = /^[ \t\r\n]*$/;
	var numericCssMap = Tools.makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', ' ');

	/**
	 * Constructs a new DOMUtils instance. Consult the Wiki for more details on settings etc for this class.
	 *
	 * @constructor
	 * @method DOMUtils
	 * @param {Document} d Document reference to bind the utility class to.
	 * @param {settings} s Optional settings collection.
	 */
	function DOMUtils(doc, settings) {
		var self = this, blockElementsMap;

		self.doc = doc;
		self.win = window;
		self.files = {};
		self.counter = 0;
		self.stdMode = !isIE || doc.documentMode >= 8;
		self.boxModel = !isIE || doc.compatMode == "CSS1Compat" || self.stdMode;
		self.hasOuterHTML = "outerHTML" in doc.createElement("a");
		this.boundEvents = [];

		self.settings = settings = extend({
			keep_values: false,
			hex_colors: 1
		}, settings);

		self.schema = settings.schema;
		self.styles = new Styles({
			url_converter: settings.url_converter,
			url_converter_scope: settings.url_converter_scope
		}, settings.schema);

		self.fixDoc(doc);
		self.events = settings.ownEvents ? new EventUtils(settings.proxy) : EventUtils.Event;
		blockElementsMap = settings.schema ? settings.schema.getBlockElements() : {};

		/**
		 * Returns true/false if the specified element is a block element or not.
		 *
		 * @method isBlock
		 * @param {Node/String} node Element/Node to check.
		 * @return {Boolean} True/False state if the node is a block element or not.
		 */
		self.isBlock = function(node) {
			// Fix for #5446
			if (!node) {
				return false;
			}

			// This function is called in module pattern style since it might be executed with the wrong this scope
			var type = node.nodeType;

			// If it's a node then check the type and use the nodeName
			if (type) {
				return !!(type === 1 && blockElementsMap[node.nodeName]);
			}

			return !!blockElementsMap[node];
		};
	}

	DOMUtils.prototype = {
		root: null,
		props: {
			"for": "htmlFor",
			"class": "className",
			className: "className",
			checked: "checked",
			disabled: "disabled",
			maxlength: "maxLength",
			readonly: "readOnly",
			selected: "selected",
			value: "value",
			id: "id",
			name: "name",
			type: "type"
		},

		fixDoc: function(doc) {
			var settings = this.settings, name;

			if (isIE && settings.schema) {
				// Add missing HTML 4/5 elements to IE
				('abbr article aside audio canvas ' +
				'details figcaption figure footer ' +
				'header hgroup mark menu meter nav ' +
				'output progress section summary ' +
				'time video').replace(/\w+/g, function(name) {
					doc.createElement(name);
				});

				// Create all custom elements
				for (name in settings.schema.getCustomElements()) {
					doc.createElement(name);
				}
			}
		},

		clone: function(node, deep) {
			var self = this, clone, doc;

			// TODO: Add feature detection here in the future
			if (!isIE || node.nodeType !== 1 || deep) {
				return node.cloneNode(deep);
			}

			doc = self.doc;

			// Make a HTML5 safe shallow copy
			if (!deep) {
				clone = doc.createElement(node.nodeName);

				// Copy attribs
				each(self.getAttribs(node), function(attr) {
					self.setAttrib(clone, attr.nodeName, self.getAttrib(node, attr.nodeName));
				});

				return clone;
			}
/*
			// Setup HTML5 patched document fragment
			if (!self.frag) {
				self.frag = doc.createDocumentFragment();
				self.fixDoc(self.frag);
			}

			// Make a deep copy by adding it to the document fragment then removing it this removed the :section
			clone = doc.createElement('div');
			self.frag.appendChild(clone);
			clone.innerHTML = node.outerHTML;
			self.frag.removeChild(clone);
*/
			return clone.firstChild;
		},

		/**
		 * Returns the root node of the document. This is normally the body but might be a DIV. Parents like getParent will not
		 * go above the point of this root node.
		 *
		 * @method getRoot
		 * @return {Element} Root element for the utility class.
		 */
		getRoot: function() {
			var self = this;

			return self.get(self.settings.root_element) || self.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @method getViewPort
		 * @param {Window} win Optional window to get viewport of.
		 * @return {Object} Viewport object with fields x, y, w and h.
		 */
		getViewPort: function(win) {
			var doc, rootElm;

			win = !win ? this.win : win;
			doc = win.document;
			rootElm = this.boxModel ? doc.documentElement : doc.body;

			// Returns viewport size excluding scrollbars
			return {
				x: win.pageXOffset || rootElm.scrollLeft,
				y: win.pageYOffset || rootElm.scrollTop,
				w: win.innerWidth || rootElm.clientWidth,
				h: win.innerHeight || rootElm.clientHeight
			};
		},

		/**
		 * Returns the rectangle for a specific element.
		 *
		 * @method getRect
		 * @param {Element/String} elm Element object or element ID to get rectangle from.
		 * @return {object} Rectangle for specified element object with x, y, w, h fields.
		 */
		getRect: function(elm) {
			var self = this, pos, size;

			elm = self.get(elm);
			pos = self.getPos(elm);
			size = self.getSize(elm);

			return {
				x: pos.x, y: pos.y,
				w: size.w, h: size.h
			};
		},

		/**
		 * Returns the size dimensions of the specified element.
		 *
		 * @method getSize
		 * @param {Element/String} elm Element object or element ID to get rectangle from.
		 * @return {object} Rectangle for specified element object with w, h fields.
		 */
		getSize: function(elm) {
			var self = this, w, h;

			elm = self.get(elm);
			w = self.getStyle(elm, 'width');
			h = self.getStyle(elm, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1) {
				w = 0;
			}

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1) {
				h = 0;
			}

			return {
				w: parseInt(w, 10) || elm.offsetWidth || elm.clientWidth,
				h: parseInt(h, 10) || elm.offsetHeight || elm.clientHeight
			};
		},

		/**
		 * Returns a node by the specified selector function. This function will
		 * loop through all parent nodes and call the specified function for each node.
		 * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
		 * and the node it found will be returned.
		 *
		 * @method getParent
		 * @param {Node/String} node DOM node to search parents on or ID string.
		 * @param {function} selector Selection function or CSS selector to execute on each node.
		 * @param {Node} root Optional root element, never go below this point.
		 * @return {Node} DOM Node or null if it wasn't found.
		 */
		getParent: function(node, selector, root) {
			return this.getParents(node, selector, root, false);
		},

		/**
		 * Returns a node list of all parents matching the specified selector function or pattern.
		 * If the function then returns true indicating that it has found what it was looking for and that node will be collected.
		 *
		 * @method getParents
		 * @param {Node/String} node DOM node to search parents on or ID string.
		 * @param {function} selector Selection function to execute on each node or CSS pattern.
		 * @param {Node} root Optional root element, never go below this point.
		 * @return {Array} Array of nodes or null if it wasn't found.
		 */
		getParents: function(node, selector, root, collect) {
			var self = this, selectorVal, result = [];

			node = self.get(node);
			collect = collect === undefined;

			// Default root on inline mode
			root = root || (self.getRoot().nodeName != 'BODY' ? self.getRoot().parentNode : null);

			// Wrap node name as func
			if (is(selector, 'string')) {
				selectorVal = selector;

				if (selector === '*') {
					selector = function(node) {return node.nodeType == 1;};
				} else {
					selector = function(node) {
						return self.is(node, selectorVal);
					};
				}
			}

			while (node) {
				if (node == root || !node.nodeType || node.nodeType === 9) {
					break;
				}

				if (!selector || selector(node)) {
					if (collect) {
						result.push(node);
					} else {
						return node;
					}
				}

				node = node.parentNode;
			}

			return collect ? result : null;
		},

		/**
		 * Returns the specified element by ID or the input element if it isn't a string.
		 *
		 * @method get
		 * @param {String/Element} n Element id to look for or element to just pass though.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get: function(elm) {
			var name;

			if (elm && this.doc && typeof(elm) == 'string') {
				name = elm;
				elm = this.doc.getElementById(elm);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (elm && elm.id !== name) {
					return this.doc.getElementsByName(name)[1];
				}
			}

			return elm;
		},

		/**
		 * Returns the next node that matches selector or function
		 *
		 * @method getNext
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Next node item matching the selector or null if it wasn't found.
		 */
		getNext: function(node, selector) {
			return this._findSib(node, selector, 'nextSibling');
		},

		/**
		 * Returns the previous node that matches selector or function
		 *
		 * @method getPrev
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Previous node item matching the selector or null if it wasn't found.
		 */
		getPrev: function(node, selector) {
			return this._findSib(node, selector, 'previousSibling');
		},

		// #ifndef jquery

		/**
		 * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
		 * This function is optimized for the most common patterns needed in TinyMCE but it also performs well enough
		 * on more complex patterns.
		 *
		 * @method select
		 * @param {String} selector CSS level 3 pattern to select/find elements by.
		 * @param {Object} scope Optional root element/scope element to search in.
		 * @return {Array} Array with all matched elements.
		 * @example
		 * // Adds a class to all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
		 *
		 * // Adds a class to all spans that have the test class in the currently active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('span.test'), 'someclass')
		 */
		select: function(selector, scope) {
			var self = this;

			//Sizzle.selectors.cacheLength = 0;
			return Sizzle(selector, self.get(scope) || self.get(self.settings.root_element) || self.doc, []);
		},

		/**
		 * Returns true/false if the specified element matches the specified css pattern.
		 *
		 * @method is
		 * @param {Node/NodeList} elm DOM node to match or an array of nodes to match.
		 * @param {String} selector CSS pattern to match the element against.
		 */
		is: function(elm, selector) {
			var i;

			// If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
			if (elm.length === undefined) {
				// Simple all selector
				if (selector === '*') {
					return elm.nodeType == 1;
				}

				// Simple selector just elements
				if (simpleSelectorRe.test(selector)) {
					selector = selector.toLowerCase().split(/,/);
					elm = elm.nodeName.toLowerCase();

					for (i = selector.length - 1; i >= 0; i--) {
						if (selector[i] == elm) {
							return true;
						}
					}

					return false;
				}
			}

			// Is non element
			if (elm.nodeType && elm.nodeType != 1) {
				return false;
			}

			return Sizzle.matches(selector, elm.nodeType ? [elm] : elm).length > 0;
		},

		// #endif

		/**
		 * Adds the specified element to another element or elements.
		 *
		 * @method add
		 * @param {String/Element/Array} parentElm Element id string, DOM node element or array of ids or elements to add to.
		 * @param {String/Element} name Name of new element to add or existing element to add.
		 * @param {Object} attrs Optional object collection with arguments to add to the new element(s).
		 * @param {String} html Optional inner HTML contents to add for each element.
		 * @return {Element/Array} Element that got created, or an array of created elements if multiple input elements
		 * were passed in.
		 * @example
		 * // Adds a new paragraph to the end of the active editor
		 * tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), 'p', {title: 'my title'}, 'Some content');
		 */
		add: function(parentElm, name, attrs, html, create) {
			var self = this;

			return this.run(parentElm, function(parentElm) {
				var newElm;

				newElm = is(name, 'string') ? self.doc.createElement(name) : name;
				self.setAttribs(newElm, attrs);

				if (html) {
					if (html.nodeType) {
						newElm.appendChild(html);
					} else {
						self.setHTML(newElm, html);
					}
				}

				return !create ? parentElm.appendChild(newElm) : newElm;
			});
		},

		/**
		 * Creates a new element.
		 *
		 * @method create
		 * @param {String} name Name of new element.
		 * @param {Object} attrs Optional object name/value collection with element attributes.
		 * @param {String} html Optional HTML string to set as inner HTML of the element.
		 * @return {Element} HTML DOM node element that got created.
		 * @example
		 * // Adds an element where the caret/selection is in the active editor
		 * var el = tinymce.activeEditor.dom.create('div', {id: 'test', 'class': 'myclass'}, 'some content');
		 * tinymce.activeEditor.selection.setNode(el);
		 */
		create: function(name, attrs, html) {
			return this.add(this.doc.createElement(name), name, attrs, html, 1);
		},

		/**
		 * Creates HTML string for element. The element will be closed unless an empty inner HTML string is passed in.
		 *
		 * @method createHTML
		 * @param {String} name Name of new element.
		 * @param {Object} attrs Optional object name/value collection with element attributes.
		 * @param {String} html Optional HTML string to set as inner HTML of the element.
		 * @return {String} String with new HTML element, for example: <a href="#">test</a>.
		 * @example
		 * // Creates a html chunk and inserts it at the current selection/caret location
		 * tinymce.activeEditor.selection.setContent(tinymce.activeEditor.dom.createHTML('a', {href: 'test.html'}, 'some line'));
		 */
		createHTML: function(name, attrs, html) {
			var outHtml = '', key;

			outHtml += '<' + name;

			for (key in attrs) {
				if (attrs.hasOwnProperty(key) && attrs[key] !== null) {
					outHtml += ' ' + key + '="' + this.encode(attrs[key]) + '"';
				}
			}

			// A call to tinymce.is doesn't work for some odd reason on IE9 possible bug inside their JS runtime
			if (typeof(html) != "undefined") {
				return outHtml + '>' + html + '</' + name + '>';
			}

			return outHtml + ' />';
		},

		/**
		 * Creates a document fragment out of the specified HTML string.
		 *
		 * @method createFragment
		 * @param {String} html Html string to create fragment from.
		 * @return {DocumentFragment} Document fragment node.
		 */
		createFragment: function(html) {
			var frag, node, doc = this.doc, container;

			container = doc.createElement("div");
			frag = doc.createDocumentFragment();

			if (html) {
				container.innerHTML = html;
			}

			while ((node = container.firstChild)) {
				frag.appendChild(node);
			}

			return frag;
		},

		/**
		 * Removes/deletes the specified element(s) from the DOM.
		 *
		 * @method remove
		 * @param {String/Element/Array} node ID of element or DOM element object or array containing multiple elements/ids.
		 * @param {Boolean} keep_children Optional state to keep children or not. If set to true all children will be
		 * placed at the location of the removed element.
		 * @return {Element/Array} HTML DOM element that got removed, or an array of removed elements if multiple input elements
		 * were passed in.
		 * @example
		 * // Removes all paragraphs in the active editor
		 * tinymce.activeEditor.dom.remove(tinymce.activeEditor.dom.select('p'));
		 *
		 * // Removes an element by id in the document
		 * tinymce.DOM.remove('mydiv');
		 */
		remove: function(node, keep_children) {
			return this.run(node, function(node) {
				var child, parent = node.parentNode;

				if (!parent) {
					return null;
				}

				if (keep_children) {
					while ((child = node.firstChild)) {
						// IE 8 will crash if you don't remove completely empty text nodes
						if (!isIE || child.nodeType !== 3 || child.nodeValue) {
							parent.insertBefore(child, node);
						} else {
							node.removeChild(child);
						}
					}
				}

				return parent.removeChild(node);
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
		 * @example
		 * // Sets a style value on all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.setStyle(tinymce.activeEditor.dom.select('p'), 'background-color', 'red');
		 *
		 * // Sets a style value to an element by id in the current document
		 * tinymce.DOM.setStyle('mydiv', 'background-color', 'red');
		 */
		setStyle: function(elm, name, value) {
			return this.run(elm, function(elm) {
				var self = this, style, key;

				if (name) {
					if (typeof(name) === 'string') {
						style = elm.style;

						// Camelcase it, if needed
						name = name.replace(/-(\D)/g, function(a, b) {
							return b.toUpperCase();
						});

						// Default px suffix on these
						if (typeof(value) === 'number' && !numericCssMap[name]) {
							value += 'px';
						}

						// IE specific opacity
						if (name === "opacity" && elm.runtimeStyle && typeof(elm.runtimeStyle.opacity) === "undefined") {
							style.filter = value === '' ? '' : "alpha(opacity=" + (value * 100) + ")";
						}

						if (name == "float") {
							// Old IE vs modern browsers
							name = "cssFloat" in elm.style ? "cssFloat" : "styleFloat";
						}

						try {
							style[name] = value;
						} catch (ex) {
							// Ignore IE errors
						}

						// Force update of the style data
						if (self.settings.update_styles) {
							elm.removeAttribute('data-mce-style');
						}
					} else {
						for (key in name) {
							self.setStyle(elm, key, name[key]);
						}
					}
				}
			});
		},

		/**
		 * Returns the current style or runtime/computed value of an element.
		 *
		 * @method getStyle
		 * @param {String/Element} elm HTML element or element id string to get style from.
		 * @param {String} name Style name to return.
		 * @param {Boolean} computed Computed style.
		 * @return {String} Current style or computed style value of an element.
		 */
		getStyle: function(elm, name, computed) {
			elm = this.get(elm);

			if (!elm) {
				return;
			}

			// W3C
			if (this.doc.defaultView && computed) {
				// Remove camelcase
				name = name.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(elm, null).getPropertyValue(name);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			name = name.replace(/-(\D)/g, function(a, b) {
				return b.toUpperCase();
			});

			if (name == 'float') {
				name = isIE ? 'styleFloat' : 'cssFloat';
			}

			// IE & Opera
			if (elm.currentStyle && computed) {
				return elm.currentStyle[name];
			}

			return elm.style ? elm.style[name] : undefined;
		},

		/**
		 * Sets multiple styles on the specified element(s).
		 *
		 * @method setStyles
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set styles on.
		 * @param {Object} o Name/Value collection of style items to add to the element(s).
		 * @example
		 * // Sets styles on all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.setStyles(tinymce.activeEditor.dom.select('p'), {'background-color': 'red', 'color': 'green'});
		 *
		 * // Sets styles to an element by id in the current document
		 * tinymce.DOM.setStyles('mydiv', {'background-color': 'red', 'color': 'green'});
		 */
		setStyles: function(elm, styles) {
			this.setStyle(elm, styles);
		},

		css: function(elm, name, value) {
			this.setStyle(elm, name, value);
		},

		/**
		 * Removes all attributes from an element or elements.
		 *
		 * @method removeAllAttribs
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to remove attributes from.
		 */
		removeAllAttribs: function(e) {
			return this.run(e, function(e) {
				var i, attrs = e.attributes;
				for (i = attrs.length - 1; i >= 0; i--) {
					e.removeAttributeNode(attrs.item(i));
				}
			});
		},

		/**
		 * Sets the specified attribute of an element or elements.
		 *
		 * @method setAttrib
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attribute on.
		 * @param {String} n Name of attribute to set.
		 * @param {String} v Value to set on the attribute - if this value is falsy like null, 0 or '' it will remove the attribute instead.
		 * @example
		 * // Sets class attribute on all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setAttrib(tinymce.activeEditor.dom.select('p'), 'class', 'myclass');
		 *
		 * // Sets class attribute on a specific element in the current page
		 * tinymce.dom.setAttrib('mydiv', 'class', 'myclass');
		 */
		setAttrib: function(e, n, v) {
			var t = this;

			// What's the point
			if (!e || !n) {
				return;
			}

			return this.run(e, function(e) {
				var s = t.settings;
				var originalValue = e.getAttribute(n);
				if (v !== null) {
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
								if (v) {
									e.setAttribute('data-mce-style', v, 2);
								} else {
									e.removeAttribute('data-mce-style', 2);
								}
							}

							e.style.cssText = v;
							break;

						case "class":
							e.className = v || ''; // Fix IE null bug
							break;

						case "src":
						case "href":
							if (s.keep_values) {
								if (s.url_converter) {
									v = s.url_converter.call(s.url_converter_scope || t, v, n, e);
								}

								t.setAttrib(e, 'data-mce-' + n, v, 2);
							}

							break;

						case "shape":
							e.setAttribute('data-mce-style', v);
							break;
					}
				}
				if (is(v) && v !== null && v.length !== 0) {
					e.setAttribute(n, '' + v, 2);
				} else {
					e.removeAttribute(n, 2);
				}

				// fire onChangeAttrib event for attributes that have changed
				if (originalValue != v && s.onSetAttrib) {
					s.onSetAttrib({attrElm: e, attrName: n, attrValue: v});
				}
			});
		},

		/**
		 * Sets two or more specified attributes of an element or elements.
		 *
		 * @method setAttribs
		 * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set attributes on.
		 * @param {Object} attrs Name/Value collection of attribute items to add to the element(s).
		 * @example
		 * // Sets class and title attributes on all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setAttribs(tinymce.activeEditor.dom.select('p'), {'class': 'myclass', title: 'some title'});
		 *
		 * // Sets class and title attributes on a specific element in the current page
		 * tinymce.DOM.setAttribs('mydiv', {'class': 'myclass', title: 'some title'});
		 */
		setAttribs: function(elm, attrs) {
			var self = this;

			return this.run(elm, function(elm) {
				each(attrs, function(value, name) {
					self.setAttrib(elm, name, value);
				});
			});
		},

		/**
		 * Returns the specified attribute by name.
		 *
		 * @method getAttrib
		 * @param {String/Element} elm Element string id or DOM element to get attribute from.
		 * @param {String} name Name of attribute to get.
		 * @param {String} defaultVal Optional default value to return if the attribute didn't exist.
		 * @return {String} Attribute value string, default value or null if the attribute wasn't found.
		 */
		getAttrib: function(elm, name, defaultVal) {
			var value, self = this, undef;

			elm = self.get(elm);

			if (!elm || elm.nodeType !== 1) {
				return defaultVal === undef ? false : defaultVal;
			}

			if (!is(defaultVal)) {
				defaultVal = '';
			}

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(name)) {
				value = elm.getAttribute("data-mce-" + name);

				if (value) {
					return value;
				}
			}

			if (isIE && self.props[name]) {
				value = elm[self.props[name]];
				value = value && value.nodeValue ? value.nodeValue : value;
			}

			if (!value) {
				value = elm.getAttribute(name, 2);
			}

			// Check boolean attribs
			if (/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(name)) {
				if (elm[self.props[name]] === true && value === '') {
					return name;
				}

				return value ? name : '';
			}

			// Inner input elements will override attributes on form elements
			if (elm.nodeName === "FORM" && elm.getAttributeNode(name)) {
				return elm.getAttributeNode(name).nodeValue;
			}

			if (name === 'style') {
				value = value || elm.style.cssText;

				if (value) {
					value = self.serializeStyle(self.parseStyle(value), elm.nodeName);

					if (self.settings.keep_values) {
						elm.setAttribute('data-mce-style', value);
					}
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && name === "class" && value) {
				value = value.replace(/(apple|webkit)\-[a-z\-]+/gi, '');
			}

			// Handle IE issues
			if (isIE) {
				switch (name) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (value === 1) {
							value = '';
						}

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (value === '+0' || value === 20 || value === 0) {
							value = '';
						}

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (value === 0) {
							value = '';
						}

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (value === -1) {
							value = '';
						}

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (value === 32768 || value === 2147483647 || value === '32768') {
							value = '';
						}

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (value === 65535) {
							return name;
						}

						return defaultVal;

					case 'shape':
						value = value.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (name.indexOf('on') === 0 && value) {
							value = ('' + value).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1');
						}
				}
			}

			return (value !== undef && value !== null && value !== '') ? '' + value : defaultVal;
		},

		/**
		 * Returns the absolute x, y position of a node. The position will be returned in an object with x, y fields.
		 *
		 * @method getPos
		 * @param {Element/String} elm HTML element or element id to get x, y position from.
		 * @param {Element} rootElm Optional root element to stop calculations at.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		getPos: function(elm, rootElm) {
			var self = this, x = 0, y = 0, offsetParent, doc = self.doc, pos;

			elm = self.get(elm);
			rootElm = rootElm || doc.body;

			if (elm) {
				// Use getBoundingClientRect if it exists since it's faster than looping offset nodes
				if (rootElm === doc.body && elm.getBoundingClientRect) {
					pos = elm.getBoundingClientRect();
					rootElm = self.boxModel ? doc.documentElement : doc.body;

					// Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
					// Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
					x = pos.left + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - rootElm.clientTop;
					y = pos.top + (doc.documentElement.scrollTop || doc.body.scrollTop) - rootElm.clientLeft;

					return {x: x, y: y};
				}

				offsetParent = elm;
				while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
					x += offsetParent.offsetLeft || 0;
					y += offsetParent.offsetTop || 0;
					offsetParent = offsetParent.offsetParent;
				}

				offsetParent = elm.parentNode;
				while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
					x -= offsetParent.scrollLeft || 0;
					y -= offsetParent.scrollTop || 0;
					offsetParent = offsetParent.parentNode;
				}
			}

			return {x: x, y: y};
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non-hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parseStyle
		 * @param {String} cssText Style value to parse, for example: border:1px solid red;.
		 * @return {Object} Object representation of that style, for example: {border: '1px solid red'}
		 */
		parseStyle: function(cssText) {
			return this.styles.parse(cssText);
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serializeStyle
		 * @param {Object} styles Object to serialize as string, for example: {border: '1px solid red'}
		 * @param {String} name Optional element name.
		 * @return {String} String representation of the style object, for example: border: 1px solid red.
		 */
		serializeStyle: function(styles, name) {
			return this.styles.serialize(styles, name);
		},

		/**
		 * Adds a style element at the top of the document with the specified cssText content.
		 *
		 * @method addStyle
		 * @param {String} cssText CSS Text style to add to top of head of document.
		 */
		addStyle: function(cssText) {
			var self = this, doc = self.doc, head, styleElm;

			// Prevent inline from loading the same styles twice
			if (self !== DOMUtils.DOM && doc === document) {
				var addedStyles = DOMUtils.DOM.addedStyles;

				addedStyles = addedStyles || [];
				if (addedStyles[cssText]) {
					return;
				}

				addedStyles[cssText] = true;
				DOMUtils.DOM.addedStyles = addedStyles;
			}

			// Create style element if needed
			styleElm = doc.getElementById('mceDefaultStyles');
			if (!styleElm) {
				styleElm = doc.createElement('style');
				styleElm.id = 'mceDefaultStyles';
				styleElm.type = 'text/css';

				head = doc.getElementsByTagName('head')[0];
				if (head.firstChild) {
					head.insertBefore(styleElm, head.firstChild);
				} else {
					head.appendChild(styleElm);
				}
			}

			// Append style data to old or new style element
			if (styleElm.styleSheet) {
				styleElm.styleSheet.cssText += cssText;
			} else {
				styleElm.appendChild(doc.createTextNode(cssText));
			}
		},

		/**
		 * Imports/loads the specified CSS file into the document bound to the class.
		 *
		 * @method loadCSS
		 * @param {String} u URL to CSS file to load.
		 * @example
		 * // Loads a CSS file dynamically into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css');
		 *
		 * // Loads a CSS file into the currently active editor instance
		 * tinymce.activeEditor.dom.loadCSS('somepath/some.css');
		 *
		 * // Loads a CSS file into an editor instance by id
		 * tinymce.get('someid').dom.loadCSS('somepath/some.css');
		 *
		 * // Loads multiple CSS files into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css,somepath/someother.css');
		 */
		loadCSS: function(url) {
			var self = this, doc = self.doc, head;

			// Prevent inline from loading the same CSS file twice
			if (self !== DOMUtils.DOM && doc === document) {
				DOMUtils.DOM.loadCSS(url);
				return;
			}

			if (!url) {
				url = '';
			}

			head = doc.getElementsByTagName('head')[0];

			each(url.split(','), function(url) {
				var link;

				if (self.files[url]) {
					return;
				}

				self.files[url] = true;
				link = self.create('link', {rel: 'stylesheet', href: url});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by recalcing the document once a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && doc.documentMode && doc.recalc) {
					link.onload = function() {
						if (doc.recalc) {
							doc.recalc();
						}

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
		 * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
		 * @param {String} cls Class name to add to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 * @example
		 * // Adds a class to all paragraphs in the active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'myclass');
		 *
		 * // Adds a class to a specific element in the current page
		 * tinymce.DOM.addClass('mydiv', 'myclass');
		 */
		addClass: function(elm, cls) {
			return this.run(elm, function(elm) {
				var clsVal;

				if (!cls) {
					return 0;
				}

				if (this.hasClass(elm, cls)) {
					return elm.className;
				}

				clsVal = this.removeClass(elm, cls);
				elm.className = clsVal = (clsVal !== '' ? (clsVal + ' ') : '') + cls;

				return clsVal;
			});
		},

		/**
		 * Removes a class from the specified element or elements.
		 *
		 * @method removeClass
		 * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
		 * @param {String} cls Class name to remove from each element.
		 * @return {String/Array} String of remaining class name(s), or an array of strings if multiple input elements
		 * were passed in.
		 * @example
		 * // Removes a class from all paragraphs in the active editor
		 * tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('p'), 'myclass');
		 *
		 * // Removes a class from a specific element in the current page
		 * tinymce.DOM.removeClass('mydiv', 'myclass');
		 */
		removeClass: function(elm, cls) {
			var self = this, re;

			return self.run(elm, function(elm) {
				var val;

				if (self.hasClass(elm, cls)) {
					if (!re) {
						re = new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g");
					}

					val = elm.className.replace(re, ' ');
					val = trim(val != ' ' ? val : '');

					elm.className = val;

					// Empty class attr
					if (!val) {
						elm.removeAttribute('class');
						elm.removeAttribute('className');
					}

					return val;
				}

				return elm.className;
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
		hasClass: function(elm, cls) {
			elm = this.get(elm);

			if (!elm || !cls) {
				return false;
			}

			return (' ' + elm.className + ' ').indexOf(' ' + cls + ' ') !== -1;
		},

		/**
		 * Toggles the specified class on/off.
		 *
		 * @method toggleClass
		 * @param {Element} elm Element to toggle class on.
		 * @param {[type]} cls Class to toggle on/off.
		 * @param {[type]} state Optional state to set.
		 */
		toggleClass: function(elm, cls, state) {
			state = state === undefined ? !this.hasClass(elm, cls) : state;

			if (this.hasClass(elm, cls) !== state) {
				if (state) {
					this.addClass(elm, cls);
				} else {
					this.removeClass(elm, cls);
				}
			}
		},

		/**
		 * Shows the specified element(s) by ID by setting the "display" style.
		 *
		 * @method show
		 * @param {String/Element/Array} elm ID of DOM element or DOM element or array with elements or IDs to show.
		 */
		show: function(elm) {
			return this.setStyle(elm, 'display', 'block');
		},

		/**
		 * Hides the specified element(s) by ID by setting the "display" style.
		 *
		 * @method hide
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to hide.
		 * @example
		 * // Hides an element by id in the document
		 * tinymce.DOM.hide('myid');
		 */
		hide: function(elm) {
			return this.setStyle(elm, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @method isHidden
		 * @param {String/Element} e Id or element to check display state on.
		 * @return {Boolean} true/false if the element is hidden or not.
		 */
		isHidden: function(elm) {
			elm = this.get(elm);

			return !elm || elm.style.display == 'none' || this.getStyle(elm, 'display') == 'none';
		},

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element already exists.
		 *
		 * @method uniqueId
		 * @param {String} prefix Optional prefix to add in front of all ids - defaults to "mce_".
		 * @return {String} Unique id.
		 */
		uniqueId: function(prefix) {
			return (!prefix ? 'mce_' : prefix) + (this.counter++);
		},

		/**
		 * Sets the specified HTML content inside the element or elements. The HTML will first be processed. This means
		 * URLs will get converted, hex color values fixed etc. Check processHTML for details.
		 *
		 * @method setHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set HTML inside of.
		 * @param {String} h HTML content to set as inner HTML of the element.
		 * @example
		 * // Sets the inner HTML of all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setHTML(tinymce.activeEditor.dom.select('p'), 'some inner html');
		 *
		 * // Sets the inner HTML of an element by id in the document
		 * tinymce.DOM.setHTML('mydiv', 'some inner html');
		 */
		setHTML: function(element, html) {
			var self = this;

			return self.run(element, function(element) {
				if (isIE) {
					// Remove all child nodes, IE keeps empty text nodes in DOM
					while (element.firstChild) {
						element.removeChild(element.firstChild);
					}

					try {
						// IE will remove comments from the beginning
						// unless you padd the contents with something
						element.innerHTML = '<br />' + html;
						element.removeChild(element.firstChild);
					} catch (ex) {
						// IE sometimes produces an unknown runtime error on innerHTML if it's a block element
						// within a block element for example a div inside a p
						// This seems to fix this problem

						// Create new div with HTML contents and a BR in front to keep comments
						var newElement = self.create('div');
						newElement.innerHTML = '<br />' + html;

						// Add all children from div to target
						each (grep(newElement.childNodes), function(node, i) {
							// Skip br element
							if (i && element.canHaveHTML) {
								element.appendChild(node);
							}
						});
					}
				} else {
					element.innerHTML = html;
				}

				return html;
			});
		},

		/**
		 * Returns the outer HTML of an element.
		 *
		 * @method getOuterHTML
		 * @param {String/Element} elm Element ID or element object to get outer HTML from.
		 * @return {String} Outer HTML string.
		 * @example
		 * tinymce.DOM.getOuterHTML(editorElement);
		 * tinymce.activeEditor.getOuterHTML(tinymce.activeEditor.getBody());
		 */
		getOuterHTML: function(elm) {
			var doc, self = this;

			elm = self.get(elm);

			if (!elm) {
				return null;
			}

			if (elm.nodeType === 1 && self.hasOuterHTML) {
				return elm.outerHTML;
			}

			doc = (elm.ownerDocument || self.doc).createElement("body");
			doc.appendChild(elm.cloneNode(true));

			return doc.innerHTML;
		},

		/**
		 * Sets the specified outer HTML on an element or elements.
		 *
		 * @method setOuterHTML
		 * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set outer HTML on.
		 * @param {Object} html HTML code to set as outer value for the element.
		 * @param {Document} doc Optional document scope to use in this process - defaults to the document of the DOM class.
		 * @example
		 * // Sets the outer HTML of all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setOuterHTML(tinymce.activeEditor.dom.select('p'), '<div>some html</div>');
		 *
		 * // Sets the outer HTML of an element by id in the document
		 * tinymce.DOM.setOuterHTML('mydiv', '<div>some html</div>');
		 */
		setOuterHTML: function(elm, html, doc) {
			var self = this;

			return self.run(elm, function(elm) {
				function set() {
					var node, tempElm;

					tempElm = doc.createElement("body");
					tempElm.innerHTML = html;

					node = tempElm.lastChild;
					while (node) {
						self.insertAfter(node.cloneNode(true), elm);
						node = node.previousSibling;
					}

					self.remove(elm);
				}

				// Only set HTML on elements
				if (elm.nodeType == 1) {
					doc = doc || elm.ownerDocument || self.doc;

					if (isIE) {
						try {
							// Try outerHTML for IE it sometimes produces an unknown runtime error
							if (elm.nodeType == 1 && self.hasOuterHTML) {
								elm.outerHTML = html;
							} else {
								set();
							}
						} catch (ex) {
							// Fix for unknown runtime error
							set();
						}
					} else {
						set();
					}
				}
			});
		},

		/**
		 * Entity decodes a string. This method decodes any HTML entities, such as &aring;.
		 *
		 * @method decode
		 * @param {String} s String to decode entities on.
		 * @return {String} Entity decoded string.
		 */
		decode: Entities.decode,

		/**
		 * Entity encodes a string. This method encodes the most common entities, such as <>"&.
		 *
		 * @method encode
		 * @param {String} text String to encode with entities.
		 * @return {String} Entity encoded string.
		 */
		encode: Entities.encodeAllRaw,

		/**
		 * Inserts an element after the reference element.
		 *
		 * @method insertAfter
		 * @param {Element} node Element to insert after the reference.
		 * @param {Element/String/Array} reference_node Reference element, element id or array of elements to insert after.
		 * @return {Element/Array} Element that got added or an array with elements.
		 */
		insertAfter: function(node, reference_node) {
			reference_node = this.get(reference_node);

			return this.run(node, function(node) {
				var parent, nextSibling;

				parent = reference_node.parentNode;
				nextSibling = reference_node.nextSibling;

				if (nextSibling) {
					parent.insertBefore(node, nextSibling);
				} else {
					parent.appendChild(node);
				}

				return node;
			});
		},

		/**
		 * Replaces the specified element or elements with the new element specified. The new element will
		 * be cloned if multiple input elements are passed in.
		 *
		 * @method replace
		 * @param {Element} newElm New element to replace old ones with.
		 * @param {Element/String/Array} oldELm Element DOM node, element id or array of elements or ids to replace.
		 * @param {Boolean} k Optional keep children state, if set to true child nodes from the old object will be added to new ones.
		 */
		replace: function(newElm, oldElm, keepChildren) {
			var self = this;

			return self.run(oldElm, function(oldElm) {
				if (is(oldElm, 'array')) {
					newElm = newElm.cloneNode(true);
				}

				if (keepChildren) {
					each(grep(oldElm.childNodes), function(node) {
						newElm.appendChild(node);
					});
				}

				return oldElm.parentNode.replaceChild(newElm, oldElm);
			});
		},

		/**
		 * Renames the specified element and keeps its attributes and children.
		 *
		 * @method rename
		 * @param {Element} elm Element to rename.
		 * @param {String} name Name of the new element.
		 * @return {Element} New element or the old element if it needed renaming.
		 */
		rename: function(elm, name) {
			var self = this, newElm;

			if (elm.nodeName != name.toUpperCase()) {
				// Rename block element
				newElm = self.create(name);

				// Copy attribs to new block
				each(self.getAttribs(elm), function(attr_node) {
					self.setAttrib(newElm, attr_node.nodeName, self.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				self.replace(newElm, elm, 1);
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
		findCommonAncestor: function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe) {
					pe = pe.parentNode;
				}

				if (ps == pe) {
					break;
				}

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument) {
				return a.ownerDocument.documentElement;
			}

			return ps;
		},

		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} rgbVal RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex: function(rgbVal) {
			return this.styles.toHex(Tools.trim(rgbVal));
		},

		/**
		 * Executes the specified function on the element by id or dom element node or array of elements/id.
		 *
		 * @method run
		 * @param {String/Element/Array} Element ID or DOM element object or array with ids or elements.
		 * @param {function} f Function to execute for each item.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {Object/Array} Single object, or an array of objects if multiple input elements were passed in.
		 */
		run: function(elm, func, scope) {
			var self = this, result;

			if (typeof(elm) === 'string') {
				elm = self.get(elm);
			}

			if (!elm) {
				return false;
			}

			scope = scope || this;
			if (!elm.nodeType && (elm.length || elm.length === 0)) {
				result = [];

				each(elm, function(elm, i) {
					if (elm) {
						if (typeof(elm) == 'string') {
							elm = self.get(elm);
						}

						result.push(func.call(scope, elm, i));
					}
				});

				return result;
			}

			return func.call(scope, elm);
		},

		/**
		 * Returns a NodeList with attributes for the element.
		 *
		 * @method getAttribs
		 * @param {HTMLElement/string} elm Element node or string id to get attributes from.
		 * @return {NodeList} NodeList with attributes.
		 */
		getAttribs: function(elm) {
			var attrs;

			elm = this.get(elm);

			if (!elm) {
				return [];
			}

			if (isIE) {
				attrs = [];

				// Object will throw exception in IE
				if (elm.nodeName == 'OBJECT') {
					return elm.attributes;
				}

				// IE doesn't keep the selected attribute if you clone option elements
				if (elm.nodeName === 'OPTION' && this.getAttrib(elm, 'selected')) {
					attrs.push({specified: 1, nodeName: 'selected'});
				}

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				var attrRegExp = /<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi;
				elm.cloneNode(false).outerHTML.replace(attrRegExp, '').replace(/[\w:\-]+/gi, function(a) {
					attrs.push({specified: 1, nodeName: a});
				});

				return attrs;
			}

			return elm.attributes;
		},

		/**
		 * Returns true/false if the specified node is to be considered empty or not.
		 *
		 * @example
		 * tinymce.DOM.isEmpty(node, {img: true});
		 * @method isEmpty
		 * @param {Object} elements Optional name/value object with elements that are automatically treated as non-empty elements.
		 * @return {Boolean} true/false if the node is empty or not.
		 */
		isEmpty: function(node, elements) {
			var self = this, i, attributes, type, walker, name, brCount = 0;

			node = node.firstChild;
			if (node) {
				walker = new TreeWalker(node, node.parentNode);
				elements = elements || self.schema ? self.schema.getNonEmptyElements() : null;

				do {
					type = node.nodeType;

					if (type === 1) {
						// Ignore bogus elements
						if (node.getAttribute('data-mce-bogus')) {
							continue;
						}

						// Keep empty elements like <img />
						name = node.nodeName.toLowerCase();
						if (elements && elements[name]) {
							// Ignore single BR elements in blocks like <p><br /></p> or <p><span><br /></span></p>
							if (name === 'br') {
								brCount++;
								continue;
							}

							return false;
						}

						// Keep elements with data-bookmark attributes or name attribute like <a name="1"></a>
						attributes = self.getAttribs(node);
						i = node.attributes.length;
						while (i--) {
							name = node.attributes[i].nodeName;
							if (name === "name" || name === 'data-mce-bookmark') {
								return false;
							}
						}
					}

					// Keep comment nodes
					if (type == 8) {
						return false;
					}

					// Keep non whitespace text nodes
					if ((type === 3 && !whiteSpaceRegExp.test(node.nodeValue))) {
						return false;
					}
				} while ((node = walker.next()));
			}

			return brCount <= 1;
		},

		/**
		 * Creates a new DOM Range object. This will use the native DOM Range API if it's
		 * available. If it's not, it will fall back to the custom TinyMCE implementation.
		 *
		 * @method createRng
		 * @return {DOMRange} DOM Range object.
		 * @example
		 * var rng = tinymce.DOM.createRng();
		 * alert(rng.startContainer + "," + rng.startOffset);
		 */
		createRng: function() {
			var doc = this.doc;

			return doc.createRange ? doc.createRange() : new Range(this);
		},

		/**
		 * Returns the index of the specified node within its parent.
		 *
		 * @method nodeIndex
		 * @param {Node} node Node to look for.
		 * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
		 * @return {Number} Index of the specified node.
		 */
		nodeIndex: function(node, normalized) {
			var idx = 0, lastNodeType, lastNode, nodeType;

			if (node) {
				for (lastNodeType = node.nodeType, node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
					nodeType = node.nodeType;

					// Normalize text nodes
					if (normalized && nodeType == 3) {
						if (nodeType == lastNodeType || !node.nodeValue.length) {
							continue;
						}
					}
					idx++;
					lastNodeType = nodeType;
				}
			}

			return idx;
		},

		/**
		 * Splits an element into two new elements and places the specified split
		 * element or elements between the new ones. For example splitting the paragraph at the bold element in
		 * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>.
		 *
		 * @method split
		 * @param {Element} parentElm Parent element to split.
		 * @param {Element} splitElm Element to split at.
		 * @param {Element} replacementElm Optional replacement element to replace the split element with.
		 * @return {Element} Returns the split element or the replacement element if that is specified.
		 */
		split: function(parentElm, splitElm, replacementElm) {
			var self = this, r = self.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents - this makes sense
			// but we don't want that in our code since it serves no purpose for the end user
			// For example splitting this html at the bold element:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim off empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trimNode(node) {
				var i, children = node.childNodes, type = node.nodeType;

				function surroundedBySpans(node) {
					var previousIsSpan = node.previousSibling && node.previousSibling.nodeName == 'SPAN';
					var nextIsSpan = node.nextSibling && node.nextSibling.nodeName == 'SPAN';
					return previousIsSpan && nextIsSpan;
				}

				if (type == 1 && node.getAttribute('data-mce-type') == 'bookmark') {
					return;
				}

				for (i = children.length - 1; i >= 0; i--) {
					trimNode(children[i]);
				}

				if (type != 9) {
					// Keep non whitespace text nodes
					if (type == 3 && node.nodeValue.length > 0) {
						// If parent element isn't a block or there isn't any useful contents for example "<p>   </p>"
						// Also keep text nodes with only spaces if surrounded by spans.
						// eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
						var trimmedLength = trim(node.nodeValue).length;
						if (!self.isBlock(node.parentNode) || trimmedLength > 0 || trimmedLength === 0 && surroundedBySpans(node)) {
							return;
						}
					} else if (type == 1) {
						// If the only child is a bookmark then move it up
						children = node.childNodes;

						// TODO fix this complex if
						if (children.length == 1 && children[0] && children[0].nodeType == 1 &&
							children[0].getAttribute('data-mce-type') == 'bookmark') {
							node.parentNode.insertBefore(children[0], node);
						}

						// Keep non empty elements or img, hr etc
						if (children.length || /^(br|hr|input|img)$/i.test(node.nodeName)) {
							return;
						}
					}

					self.remove(node);
				}

				return node;
			}

			if (parentElm && splitElm) {
				// Get before chunk
				r.setStart(parentElm.parentNode, self.nodeIndex(parentElm));
				r.setEnd(splitElm.parentNode, self.nodeIndex(splitElm));
				bef = r.extractContents();

				// Get after chunk
				r = self.createRng();
				r.setStart(splitElm.parentNode, self.nodeIndex(splitElm) + 1);
				r.setEnd(parentElm.parentNode, self.nodeIndex(parentElm) + 1);
				aft = r.extractContents();

				// Insert before chunk
				pa = parentElm.parentNode;
				pa.insertBefore(trimNode(bef), parentElm);

				// Insert middle chunk
				if (replacementElm) {
					pa.replaceChild(replacementElm, splitElm);
				} else {
					pa.insertBefore(splitElm, parentElm);
				}

				// Insert after chunk
				pa.insertBefore(trimNode(aft), parentElm);
				self.remove(parentElm);

				return replacementElm || splitElm;
			}
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method bind
		 * @param {Element/Document/Window/Array} target Target element to bind events to.
		 * handler to or an array of elements/ids/documents.
		 * @param {String} name Name of event handler to add, for example: click.
		 * @param {function} func Function to execute when the event occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 */
		bind: function(target, name, func, scope) {
			var self = this;

			if (Tools.isArray(target)) {
				var i = target.length;

				while (i--) {
					target[i] = self.bind(target[i], name, func, scope);
				}

				return target;
			}

			// Collect all window/document events bound by editor instance
			if (self.settings.collect && (target === self.doc || target === self.win)) {
				self.boundEvents.push([target, name, func, scope]);
			}

			return self.events.bind(target, name, func, scope || self);
		},

		/**
		 * Removes the specified event handler by name and function from an element or collection of elements.
		 *
		 * @method unbind
		 * @param {Element/Document/Window/Array} target Target element to unbind events on.
		 * @param {String} name Event handler name, for example: "click"
		 * @param {function} func Function to remove.
		 * @return {bool/Array} Bool state of true if the handler was removed, or an array of states if multiple input elements
		 * were passed in.
		 */
		unbind: function(target, name, func) {
			var self = this, i;

			if (Tools.isArray(target)) {
				i = target.length;

				while (i--) {
					target[i] = self.unbind(target[i], name, func);
				}

				return target;
			}

			// Remove any bound events matching the input
			if (self.boundEvents && (target === self.doc || target === self.win)) {
				i = self.boundEvents.length;

				while (i--) {
					var item = self.boundEvents[i];

					if (target == item[0] && (!name || name == item[1]) && (!func || func == item[2])) {
						this.events.unbind(item[0], item[1], item[2]);
					}
				}
			}

			return this.events.unbind(target, name, func);
		},

		/**
		 * Fires the specified event name with object on target.
		 *
		 * @method fire
		 * @param {Node/Document/Window} target Target element or object to fire event on.
		 * @param {String} name Name of the event to fire.
		 * @param {Object} evt Event object to send.
		 * @return {Event} Event object.
		 */
		fire: function(target, name, evt) {
			return this.events.fire(target, name, evt);
		},

		// Returns the content editable state of a node
		getContentEditable: function(node) {
			var contentEditable;

			// Check type
			if (node.nodeType != 1) {
				return null;
			}

			// Check for fake content editable
			contentEditable = node.getAttribute("data-mce-contenteditable");
			if (contentEditable && contentEditable !== "inherit") {
				return contentEditable;
			}

			// Check for real content editable
			return node.contentEditable !== "inherit" ? node.contentEditable : null;
		},

		/**
		 * Destroys all internal references to the DOM to solve IE leak issues.
		 *
		 * @method destroy
		 */
		destroy: function() {
			var self = this;

			// Unbind all events bound to window/document by editor instance
			if (self.boundEvents) {
				var i = self.boundEvents.length;

				while (i--) {
					var item = self.boundEvents[i];
					this.events.unbind(item[0], item[1], item[2]);
				}

				self.boundEvents = null;
			}

			// Restore sizzle document to window.document
			// Since the current document might be removed producing "Permission denied" on IE see #6325
			if (Sizzle.setDocument) {
				Sizzle.setDocument();
			}

			self.win = self.doc = self.root = self.events = self.frag = null;
		},

		// #ifdef debug

		dumpRng: function(r) {
			return (
				'startContainer: ' + r.startContainer.nodeName +
				', startOffset: ' + r.startOffset +
				', endContainer: ' + r.endContainer.nodeName +
				', endOffset: ' + r.endOffset
			);
		},

		// #endif

		_findSib: function(node, selector, name) {
			var self = this, func = selector;

			if (node) {
				// If expression make a function of it using is
				if (typeof(func) == 'string') {
					func = function(node) {
						return self.is(node, selector);
					};
				}

				// Loop all siblings
				for (node = node[name]; node; node = node[name]) {
					if (func(node)) {
						return node;
					}
				}
			}

			return null;
		}
	};

	/**
	 * Instance of DOMUtils for the current document.
	 *
	 * @static
	 * @property DOM
	 * @type tinymce.dom.DOMUtils
	 * @example
	 * // Example of how to add a class to some element by id
	 * tinymce.DOM.addClass('someid', 'someclass');
	 */
	DOMUtils.DOM = new DOMUtils(document);

	return DOMUtils;
});
