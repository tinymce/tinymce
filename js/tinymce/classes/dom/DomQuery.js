/**
 * DomQuery.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * Some of this logic is based on jQuery code that is released under
 * MIT license that grants us to sublicense it under LGPL.
 *
 * @ignore-file
 */

/**
 * @class tinymce.dom.DomQuery
 */
define("tinymce/dom/DomQuery", [
	"tinymce/dom/EventUtils",
	"tinymce/dom/Sizzle"
], function(EventUtils, Sizzle) {
	var doc = document, push = Array.prototype.push, slice = Array.prototype.slice;
	var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
	var Event = EventUtils.Event;

	function isDefined(obj) {
		return typeof obj !== "undefined";
	}

	function isString(obj) {
		return typeof obj === "string";
	}

	function createFragment(html) {
		var frag, node, container;

		container = doc.createElement("div");
		frag = doc.createDocumentFragment();
		container.innerHTML = html;

		while ((node = container.firstChild)) {
			frag.appendChild(node);
		}

		return frag;
	}

	function domManipulate(targetNodes, sourceItem, callback) {
		var i;

		if (typeof sourceItem === "string") {
			sourceItem = createFragment(sourceItem);
		} else if (sourceItem.length) {
			for (i = 0; i < sourceItem.length; i++) {
				domManipulate(targetNodes, sourceItem[i], callback);
			}

			return targetNodes;
		}

		i = targetNodes.length;
		while (i--) {
			callback.call(targetNodes[i], sourceItem.parentNode ? sourceItem : sourceItem);
		}

		return targetNodes;
	}

	function hasClass(node, className) {
		return node && className && (' ' + node.className + ' ').indexOf(' ' + className + ' ') !== -1;
	}

	/**
	 * Makes a map object out of a string that gets separated by a delimiter.
	 *
	 * @method makeMap
	 * @param {String} items Item string to split.
	 * @param {Object} map Optional object to add items to.
	 * @return {Object} name/value object with items as keys.
	 */
	function makeMap(items, map) {
		var i;

		items = items || [];

		if (typeof(items) == "string") {
			items = items.split(' ');
		}

		map = map || {};

		i = items.length;
		while (i--) {
			map[items[i]] = {};
		}

		return map;
	}

	var numericCssMap = makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom');

	function DomQuery(selector, context) {
		/*eslint new-cap:0 */
		return new DomQuery.fn.init(selector, context);
	}

	/**
	 * Extends the specified object with another object.
	 *
	 * @method extend
	 * @param {Object} target Object to extend.
	 * @param {Object..} obj Multiple objects to extend with.
	 * @return {Object} Same as target, the extended object.
	 */
	function extend(target) {
		var args = arguments, arg, i, key;

		for (i = 1; i < args.length; i++) {
			arg = args[i];

			for (key in arg) {
				target[key] = arg[key];
			}
		}

		return target;
	}

	/**
	 * Converts the specified object into a real JavaScript array.
	 *
	 * @method toArray
	 * @param {Object} obj Object to convert into array.
	 * @return {Array} Array object based in input.
	 */
	function toArray(obj) {
		var array = [], i, l;

		for (i = 0, l = obj.length; i < l; i++) {
			array[i] = obj[i];
		}

		return array;
	}

	/**
	 * Returns the index of the specified item inside the array.
	 *
	 * @method inArray
	 * @param {Object} item Item to look for.
	 * @param {Array} array Array to look for item in.
	 * @return {Number} Index of the item or -1.
	 */
	function inArray(item, array) {
		var i;

		if (array.indexOf) {
			return array.indexOf(item);
		}

		i = array.length;
		while (i--) {
			if (array[i] === item) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Returns true/false if the specified object is an array.
	 *
	 * @method isArray
	 * @param {Object} obj Object to check if it's an array.
	 * @return {Boolean} true/false if the input object is array or not.
	 */
	var isArray = Array.isArray || function(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	};

	var whiteSpaceRegExp = /^\s*|\s*$/g;

	function trim(str) {
		return (str === null || str === undefined) ? '' : ("" + str).replace(whiteSpaceRegExp, '');
	}

	/**
	 * Executes the callback function for each item in array/object. If you return false in the
	 * callback it will break the loop.
	 *
	 * @method each
	 * @param {Object} obj Object to iterate.
	 * @param {function} callback Callback function to execute for each item.
	 */
	function each(obj, callback) {
		var length, key, i, undef, value;

		if (obj) {
			length = obj.length;

			if (length === undef) {
				// Loop object items
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						value = obj[key];
						if (callback.call(value, value, key) === false) {
							break;
						}
					}
				}
			} else {
				// Loop array items
				for (i = 0; i < length; i++) {
					value = obj[i];
					if (callback.call(value, value, key) === false) {
						break;
					}
				}
			}
		}

		return obj;
	}

	DomQuery.fn = DomQuery.prototype = {
		constructor: DomQuery,
		selector: "",
		length: 0,

		init: function(selector, context) {
			var self = this, match, node;

			if (!selector) {
				return self;
			}

			if (selector.nodeType) {
				self.context = self[0] = selector;
				self.length = 1;

				return self;
			}

			if (isString(selector)) {
				if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
					match = [null, selector, null];
				} else {
					match = rquickExpr.exec(selector);
				}

				if (match) {
					if (match[1]) {
						node = createFragment(selector).firstChild;
						while (node) {
							this.add(node);
							node = node.nextSibling;
						}
					} else {
						node = doc.getElementById(match[2]);

						if (node.id !== match[2]) {
							return self.find(selector);
						}

						self.length = 1;
						self[0] = node;
					}
				} else {
					return DomQuery(context || document).find(selector);
				}
			} else {
				this.add(selector);
			}

			return self;
		},

		toArray: function() {
			return toArray(this);
		},

		add: function(items) {
			var self = this;

			// Force single item into array
			if (!isArray(items)) {
				if (items instanceof DomQuery) {
					self.add(items.toArray());
				} else {
					push.call(self, items);
				}
			} else {
				push.apply(self, items);
			}

			return self;
		},

		attr: function(name, value) {
			var self = this;

			if (typeof name === "object") {
				each(name, function(value, name) {
					self.attr(name, value);
				});
			} else if (isDefined(value)) {
				this.each(function() {
					if (this.nodeType === 1) {
						this.setAttribute(name, value);
					}
				});
			} else {
				return self[0] && self[0].nodeType === 1 ? self[0].getAttribute(name) : undefined;
			}

			return self;
		},

		css: function(name, value) {
			var self = this;

			if (typeof name === "object") {
				each(name, function(value, name) {
					self.css(name, value);
				});
			} else {
				// Camelcase it, if needed
				name = name.replace(/-(\D)/g, function(a, b) {
					return b.toUpperCase();
				});

				if (isDefined(value)) {
					// Default px suffix on these
					if (typeof(value) === 'number' && !numericCssMap[name]) {
						value += 'px';
					}

					self.each(function() {
						var style = this.style;

						// IE specific opacity
						if (name === "opacity" && this.runtimeStyle && typeof(this.runtimeStyle.opacity) === "undefined") {
							style.filter = value === '' ? '' : "alpha(opacity=" + (value * 100) + ")";
						}

						try {
							style[name] = value;
						} catch (ex) {
							// Ignore
						}
					});
				} else {
					return self[0] ? self[0].style[name] : undefined;
				}
			}

			return self;
		},

		remove: function() {
			var self = this, node, i = this.length;

			while (i--) {
				node = self[i];
				Event.clean(node);

				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}

			return this;
		},

		empty: function() {
			var self = this, node, i = this.length;

			while (i--) {
				node = self[i];
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
			}

			return this;
		},

		html: function(value) {
			var self = this, i;

			if (isDefined(value)) {
				i = self.length;
				while (i--) {
					self[i].innerHTML = value;
				}

				return self;
			}

			return self[0] ? self[0].innerHTML : '';
		},

		text: function(value) {
			var self = this, i;

			if (isDefined(value)) {
				i = self.length;
				while (i--) {
					self[i].innerText = self[0].textContent = value;
				}

				return self;
			}

			return self[0] ? self[0].innerText || self[0].textContent : '';
		},

		append: function() {
			return domManipulate(this, arguments, function(node) {
				if (this.nodeType === 1) {
					this.appendChild(node);
				}
			});
		},

		prepend: function() {
			return domManipulate(this, arguments, function(node) {
				if (this.nodeType === 1) {
					this.insertBefore(node, this.firstChild);
				}
			});
		},

		before: function() {
			var self = this;

			if (self[0] && self[0].parentNode) {
				return domManipulate(self, arguments, function(node) {
					this.parentNode.insertBefore(node, this.nextSibling);
				});
			}

			return self;
		},

		after: function() {
			var self = this;

			if (self[0] && self[0].parentNode) {
				return domManipulate(self, arguments, function(node) {
					this.parentNode.insertBefore(node, this);
				});
			}

			return self;
		},

		appendTo: function(val) {
			DomQuery(val).append(this);

			return this;
		},

		addClass: function(className) {
			return this.toggleClass(className, true);
		},

		removeClass: function(className) {
			return this.toggleClass(className, false);
		},

		toggleClass: function(className, state) {
			var self = this;

			if (className.indexOf(' ') !== -1) {
				each(className.split(' '), function() {
					self.toggleClass(this, state);
				});
			} else {
				self.each(function(node) {
					var existingClassName;

					if (hasClass(node, className) !== state) {
						existingClassName = node.className;

						if (state) {
							node.className += existingClassName ? ' ' + className : className;
						} else {
							node.className = trim((" " + existingClassName + " ").replace(' ' + className + ' ', ' '));
						}
					}
				});
			}

			return self;
		},

		hasClass: function(className) {
			return hasClass(this[0], className);
		},

		each: function(callback) {
			return each(this, callback);
		},

		on: function(name, callback) {
			return this.each(function() {
				Event.bind(this, name, callback);
			});
		},

		off: function(name, callback) {
			return this.each(function() {
				Event.unbind(this, name, callback);
			});
		},

		show: function() {
			return this.css('display', '');
		},

		hide: function() {
			return this.css('display', 'none');
		},

		slice: function() {
			return new DomQuery(slice.apply(this, arguments));
		},

		eq: function(index) {
			return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
		},

		first: function() {
			return this.eq(0);
		},

		last: function() {
			return this.eq(-1);
		},

		replaceWith: function(content) {
			var self = this;

			if (self[0]) {
				self[0].parentNode.replaceChild(DomQuery(content)[0], self[0]);
			}

			return self;
		},

		wrap: function(wrapper) {
			wrapper = DomQuery(wrapper)[0];

			return this.each(function() {
				var self = this, newWrapper = wrapper.cloneNode(false);
				self.parentNode.insertBefore(newWrapper, self);
				newWrapper.appendChild(self);
			});
		},

		unwrap: function() {
			return this.each(function() {
				var self = this, node = self.firstChild, currentNode;

				while (node) {
					currentNode = node;
					node = node.nextSibling;
					self.parentNode.insertBefore(currentNode, self);
				}
			});
		},

		clone: function() {
			var result = [];

			this.each(function() {
				result.push(this.cloneNode(true));
			});

			return DomQuery(result);
		},

		find: function(selector) {
			var i, l, ret = [];

			for (i = 0, l = this.length; i < l; i++) {
				DomQuery.find(selector, this[i], ret);
			}

			return DomQuery(ret);
		},

		push: push,
		sort: [].sort,
		splice: [].splice
	};

	// Static members
	extend(DomQuery, {
		extend: extend,
		toArray: toArray,
		inArray: inArray,
		isArray: isArray,
		each: each,
		trim: trim,
		makeMap: makeMap,

		// Sizzle
		find: Sizzle,
		expr: Sizzle.selectors,
		unique: Sizzle.uniqueSort,
		text: Sizzle.getText,
		isXMLDoc: Sizzle.isXML,
		contains: Sizzle.contains,
		filter: function(expr, elems, not) {
			if (not) {
				expr = ":not(" + expr + ")";
			}

			if (elems.length === 1) {
				elems = DomQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [];
			} else {
				elems = DomQuery.find.matches(expr, elems);
			}

			return elems;
		}
	});

	function dir(el, prop, until) {
		var matched = [], cur = el[prop];

		while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !DomQuery(cur).is(until))) {
			if (cur.nodeType === 1) {
				matched.push(cur);
			}

			cur = cur[prop];
		}

		return matched;
	}

	function sibling(n, el, siblingName, nodeType) {
		var r = [];

		for(; n; n = n[siblingName]) {
			if ((!nodeType || n.nodeType === nodeType) && n !== el) {
				r.push(n);
			}
		}

		return r;
	}

	each({
		parent: function(node) {
			var parent = node.parentNode;

			return parent && parent.nodeType !== 11 ? parent : null;
		},

		parents: function(node) {
			return dir(node, "parentNode");
		},

		parentsUntil: function(node, until) {
			return dir(node, "parentNode", until);
		},

		next: function(node) {
			return sibling(node, 'nextSibling', 1);
		},

		prev: function(node) {
			return sibling(node, 'previousSibling', 1);
		},

		nextNodes: function(node) {
			return sibling(node, 'nextSibling');
		},

		prevNodes: function(node) {
			return sibling(node, 'previousSibling');
		},

		children: function(node) {
			return sibling(node.firstChild, 'nextSibling', 1);
		},

		contents: function(node) {
			return toArray((node.nodeName === "iframe" ? node.contentDocument || node.contentWindow.document : node).childNodes);
		}
	}, function(name, fn){
		DomQuery.fn[name] = function(selector) {
			var self = this, result;

			if (self.length > 1) {
				throw new Error("DomQuery only supports traverse functions on a single node.");
			}

			if (self[0]) {
				result = fn(self[0], selector);
			}

			result = DomQuery(result);

			if (selector && name !== "parentsUntil") {
				return result.filter(selector);
			}

			return result;
		};
	});

	DomQuery.fn.filter = function(selector) {
		return DomQuery.filter(selector);
	};

	DomQuery.fn.is = function(selector) {
		return !!selector && this.filter(selector).length > 0;
	};

	DomQuery.fn.init.prototype = DomQuery.fn;

	return DomQuery;
});