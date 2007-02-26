/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**#@+
 * @member TinyMCE_Engine
 * @method
 */
tinyMCE.add(TinyMCE_Engine, {
	/**
	 * Creates a HTML tag by name and attributes array. This will XML encode all attribute values.
	 *
	 * @param {string} tn Tag name to create.
	 * @param {Array} a Optional name/Value array of attributes.
	 * @param {string} h Optional inner HTML of new tag, raw HTML code.
	 */
	createTagHTML : function(tn, a, h) {
		var o = '', f = tinyMCE.xmlEncode, n;

		o = '<' + tn;

		if (a) {
			for (n in a) {
				if (typeof(a[n]) != 'function' && a[n] != null)
					o += ' ' + f(n) + '="' + f('' + a[n]) + '"';
			}
		}

		o += !h ? ' />' : '>' + h + '</' + tn + '>';

		return o;
	},

	/**
	 * Creates a tag by name and attributes array. This will create a DOM node out of the specified
	 * data.
	 *
	 * @param {string} d Document to create DOM node in.
	 * @param {string} tn Tag name to create.
	 * @param {Array} a Optional name/Value array of attributes.
	 * @param {string} h Optional inner HTML of new tag, raw HTML code.
	 */
	createTag : function(d, tn, a, h) {
		var o = d.createElement(tn), n;

		if (a) {
			for (n in a) {
				if (typeof(a[n]) != 'function' && a[n] != null)
					tinyMCE.setAttrib(o, n, a[n]);
			}
		}

		if (h)
			o.innerHTML = h;

		return o;
	},

	/**
	 * Returns a element by a specific attribute and it's value.
	 *
	 * @param {HTMLElement} n Element to search in.
	 * @param {string} e Element name to search for.
	 * @param {string} a Attribute name to search for.
	 * @param {string} v Attribute value to search for.
	 * @return HTML element that matched the criterias or null on failure.
	 * @type HTMLElement
	 */
	getElementByAttributeValue : function(n, e, a, v) {
		return (n = this.getElementsByAttributeValue(n, e, a, v)).length === 0 ? null : n[0];
	},

	/**
	 * Returns a element array by a specific attribute and it's value.
	 *
	 * @param {HTMLElement} n Element to search in.
	 * @param {string} e Element name to search for.
	 * @param {string} a Attribute name to search for.
	 * @param {string} v Attribute value to search for.
	 * @return HTML element array that matched the criterias or null on failure.
	 * @type Array
	 */
	getElementsByAttributeValue : function(n, e, a, v) {
		var i, nl = n.getElementsByTagName(e), o = [];

		for (i=0; i<nl.length; i++) {
			if (tinyMCE.getAttrib(nl[i], a).indexOf(v) != -1)
				o[o.length] = nl[i];
		}

		return o;
	},

	/**
	 * Returns true/false if the specified node is a block element or not.
	 *
	 * @param {HTMLNode} n Node to verify.
	 * @return true/false if the specified node is a block element or not.
	 * @type boolean
	 */
	isBlockElement : function(n) {
		return n != null && n.nodeType == 1 && this.blockRegExp.test(n.nodeName);
	},

	/**
	 * Returns the first block element parent of the specified node.
	 *
	 * @param {HTMLNode} n Node get parent block element for.
	 * @param {HTMLNode} r Optional root element, never go below this point.
	 * @return First block element parent of the specified node or null if it wasn't found.
	 * @type HTMLElement
	 */
	getParentBlockElement : function(n, r) {
		return this.getParentNode(n, function(n) {
			return tinyMCE.isBlockElement(n);
		}, r);

		return null;
	},

	/**
	 * Inserts a node after the specific node.
	 *
	 * @param {HTMLNode} n New node to insert.
	 * @param {HTMLNode} r Reference node to insert after.
	 */
	insertAfter : function(n, r){
		if (r.nextSibling)
			r.parentNode.insertBefore(n, r.nextSibling);
		else
			r.parentNode.appendChild(n);
	},

	/**
	 * Sets the innerHTML property of a element, this function also
	 * fixes a MSIE bug where the first comment is removed.
	 *
	 * @param {HTMLElement} e Element to insert HTML in.
	 * @param {string} h HTML code to insert into innerHTML.
	 */
	setInnerHTML : function(e, h) {
		var i, nl, n;

		// Convert all strong/em to b/i in Gecko
		if (tinyMCE.isGecko) {
			h = h.replace(/<embed([^>]*)>/gi, '<tmpembed$1>');
			h = h.replace(/<em([^>]*)>/gi, '<i$1>');
			h = h.replace(/<tmpembed([^>]*)>/gi, '<embed$1>');
			h = h.replace(/<strong([^>]*)>/gi, '<b$1>');
			h = h.replace(/<\/strong>/gi, '</b>');
			h = h.replace(/<\/em>/gi, '</i>');
		}

		if (tinyMCE.isRealIE) {
			// Since MSIE handles invalid HTML better that valid XHTML we
			// need to make some things invalid. <hr /> gets converted to <hr>.
			h = h.replace(/\s\/>/g, '>');

			// Since MSIE auto generated emtpy P tags some times we must tell it to keep the real ones
			h = h.replace(/<p([^>]*)>\u00A0?<\/p>/gi, '<p$1 mce_keep="true">&nbsp;</p>'); // Keep empty paragraphs
			h = h.replace(/<p([^>]*)>\s*&nbsp;\s*<\/p>/gi, '<p$1 mce_keep="true">&nbsp;</p>'); // Keep empty paragraphs
			h = h.replace(/<p([^>]*)>\s+<\/p>/gi, '<p$1 mce_keep="true">&nbsp;</p>'); // Keep empty paragraphs

			// Remove first comment
			e.innerHTML = tinyMCE.uniqueTag + h;
			e.firstChild.removeNode(true);

			// Remove weird auto generated empty paragraphs unless it's supposed to be there
			nl = e.getElementsByTagName("p");
			for (i=nl.length-1; i>=0; i--) {
				n = nl[i];

				if (n.nodeName == 'P' && !n.hasChildNodes() && !n.mce_keep)
					n.parentNode.removeChild(n);
			}
		} else {
			h = this.fixGeckoBaseHREFBug(1, e, h);
			e.innerHTML = h;
			this.fixGeckoBaseHREFBug(2, e, h);
		}
	},

	/**
	 * Returns the outer HTML of a element, this uses the outerHTML
	 * property in MSIE and Opera and a workaround for Gecko.
	 *
	 * @param {HTMLElement} e HTML element to get outerHTML from.
	 * @return HTML content string.
	 * @type string
	 */
	getOuterHTML : function(e) {
		var d;

		if (tinyMCE.isIE)
			return e.outerHTML;

		d = e.ownerDocument.createElement("body");
		d.appendChild(e.cloneNode(true));

		return d.innerHTML;
	},

	/**
	 * Sets the outer HTML of a element, this uses the outerHTML
	 * property in MSIE and Opera and a workaround for Gecko.
	 *
	 * @param {HTMLElement} e HTML element to set outerHTML on.
	 * @param {string} h HTML string to set in property.
	 * @param {DOMDocument} d Optional document instance (Required in old IE versions).
	 */
	setOuterHTML : function(e, h, d) {
		var d = typeof(d) == "undefined" ? e.ownerDocument : d, i, nl, t;

		if (tinyMCE.isIE && e.nodeType == 1)
			e.outerHTML = h;
		else {
			t = d.createElement("body");
			t.innerHTML = h;

			for (i=0, nl=t.childNodes; i<nl.length; i++)
				e.parentNode.insertBefore(nl[i].cloneNode(true), e);

			e.parentNode.removeChild(e);
		}
	},

	/**
	 * Returns a element by id, this will also search the form names to match the id.
	 *
	 * @param {string} id Id of element.
	 * @param {DOMDocument} d Optional document.
	 * @return HTML element that matches the id.
	 * @type HTMLElement
	 */
	_getElementById : function(id, d) {
		var e, i, j, f;

		if (typeof(d) == "undefined")
			d = document;

		e = d.getElementById(id);
		if (!e) {
			f = d.forms;

			for (i=0; i<f.length; i++) {
				for (j=0; j<f[i].elements.length; j++) {
					if (f[i].elements[j].name == id) {
						e = f[i].elements[j];
						break;
					}
				}
			}
		}

		return e;
	},

	/**
	 * Returns a array of nodes selected retrived from the child nodes of the specified node.
	 *
	 * @param {HTMLNode} n Node to get children from.
	 * @param {Array} na Array to fill with children.
	 * @param {int} t Node type to get.
	 * @param {string} nn Node name of items to retrive.
	 * @return Node array.
	 * @type Array
	 * @deprecated
	 */
	getNodeTree : function(n, na, t, nn) {
		return this.selectNodes(n, function(n) {
			return (!t || n.nodeType == t) && (!nn || n.nodeName == nn);
		}, na ? na : []);
	},

	/**
	 * Returns the parent element of the specified node based on the search criteria.
	 *
	 * @param {HTMLNode} node Node to get parent element of.
	 * @param {string} na Comma separated list of element names to get.
	 * @param {function} f Optional function to call for each node, if it returns true the node is valid.
	 * @param {HTMLNode} r Optional root element, never go below this point.
	 * @return HTMLElement or null based on search criteras.
	 * @type HTMLElement
	 */
	getParentElement : function(n, na, f, r) {
		var re = na ? new RegExp('^(' + na.toUpperCase().replace(/,/g, '|') + ')$') : 0, v;

		// Compatiblity with old scripts where f param was a attribute string
		if (f && typeof(f) == 'string')
			return this.getParentElement(n, na, function(no) {return tinyMCE.getAttrib(no, f) !== '';});

		return this.getParentNode(n, function(n) {
			return ((n.nodeType == 1 && !re) || (re && re.test(n.nodeName))) && (!f || f(n));
		}, r);
	},

	/**
	 * Returns a node by the specified selector function. This function will
	 * loop through all parent nodes and call the specified function for each node.
	 * If the function then returns true it will stop the execution and return that node.
	 *
	 * @param {DOMNode} n HTML node to search parents on.
	 * @param {function} f Selection function to execute on each node.
	 * @param {HTMLNode} r Optional root element, never go below this point.
	 * @return DOMNode or null if it wasn't found.
	 * @type DOMNode
	 */
	getParentNode : function(n, f, r) {
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
	 * Returns the attribute value of a element or the default value if it wasn't found.
	 *
	 * @param {HTMLElement} elm HTML element to get attribute from.
	 * @param {string} name Attribute name to retrive.
	 * @param {string} dv Optional default value to return, this value defaults to a empty string.
	 * @return Attribute value or default value if it wasn't found in element.
	 * @type string
	 */
	getAttrib : function(elm, name, dv) {
		var v;

		if (typeof(dv) == "undefined")
			dv = "";

		// Not a element
		if (!elm || elm.nodeType != 1)
			return dv;

		try {
			v = elm.getAttribute(name, 0);
		} catch (ex) {
			// IE 7 may cast exception on invalid attributes
			v = elm.getAttribute(name, 2);
		}

		// Try className for class attrib
		if (name == "class" && !v)
			v = elm.className;

		// Workaround for a issue with Firefox 1.5rc2+
		if (tinyMCE.isGecko && name == "src" && elm.src != null && elm.src !== '')
			v = elm.src;

		// Workaround for a issue with Firefox 1.5rc2+
		if (tinyMCE.isGecko && name == "href" && elm.href != null && elm.href !== '')
			v = elm.href;

		if (name == "http-equiv" && tinyMCE.isIE)
			v = elm.httpEquiv;

		if (name == "style" && !tinyMCE.isOpera)
			v = elm.style.cssText;

		return (v && v !== '') ? v : dv;
	},

	/**
	 * Sets the attribute value for a specific attribute.
	 *
	 * @param {HTMLElement} el HTML element to set attribute on.
	 * @param {string} name Attribute name to set.
	 * @param {string} va Attribute value to set.
	 * @param {boolean} fix Optional fix value state, if true only number data will be accepted.
	 */
	setAttrib : function(el, name, va, fix) {
		if (typeof(va) == "number" && va != null)
			va = "" + va;

		if (fix) {
			if (va === null)
				va = "";

			va = va.replace(/[^0-9%]/g, '');
		}

		if (name == "style")
			el.style.cssText = va;

		if (name == "class")
			el.className = va;

		if (va != null && va !== '' && va != -1)
			el.setAttribute(name, va);
		else
			el.removeAttribute(name);
	},

	/**
	 * Sets a style attribute item value.
	 *
	 * @param {HTMLElement} e HTML element to set style attribute item on.
	 * @param {string} n Style item name to set.
	 * @param {string} v Style item value to set.
	 */
	setStyleAttrib : function(e, n, v) {
		e.style[n] = v;

		// Style attrib deleted in IE
		if (tinyMCE.isIE && v === null || v === '') {
			v = tinyMCE.serializeStyle(tinyMCE.parseStyle(e.style.cssText));
			e.style.cssText = v;
			e.setAttribute("style", v);
		}
	},

	/**
	 * Switches the CSS class of the specified element. This method also caches the
	 * elements in a lookup table for performance. This should only be used for TinyMCE main UI controls
	 * like buttons or select elements.
	 *
	 * @param {HTMLElement} ei Element to set CSS class on.
	 * @param {string} c CSS class to set.
	 */
	switchClass : function(ei, c) {
		var e;

		if (tinyMCE.switchClassCache[ei])
			e = tinyMCE.switchClassCache[ei];
		else
			e = tinyMCE.switchClassCache[ei] = document.getElementById(ei);

		if (e) {
			// Keep tile mode
			if (tinyMCE.settings.button_tile_map && e.className && e.className.indexOf('mceTiledButton') === 0)
				c = 'mceTiledButton ' + c;

			e.className = c;
		}
	},

	/**
	 * Returns the absolute x, y position of a node. The position will be returned in a object with
	 * two properties absLeft and absTop.
	 *
	 * @param {HTMLNode} n HTML element to get x, y position from.
	 * @param {HTMLNode} cn Optional HTML element to to stop position calcualtion by.
	 * @return Absolute position of the specified element.
	 * @type TinyMCE_ElementPosition
	 */
	getAbsPosition : function(n, cn) {
		var l = 0, t = 0;

		while (n && n != cn) {
			l += n.offsetLeft;
			t += n.offsetTop;
			n = n.offsetParent;
		}

		return {absLeft : l, absTop : t};
	},

	/**
	 * Finds any previous element by name. This will loop through the siblings
	 * inorder to find the specified element by name. If the element wasn't found
	 * it will return a null value. 
	 *
	 * @param {HTMLNode} e HTML node to search from.
	 * @param {string} n Comma separated list of element names to search for.
	 * @return HTML Element or null if it wasn't found.
	 * @type HTMLElement 
	 */
	prevNode : function(e, n) {
		var a = n.split(','), i;

		while ((e = e.previousSibling) != null) {
			for (i=0; i<a.length; i++) {
				if (e.nodeName == a[i])
					return e;
			}
		}

		return null;
	},

	/**
	 * Finds any element after the current one by name. This will loop through the siblings
	 * inorder to find the specified element by name. If the element wasn't found
	 * it will return a null value. 
	 *
	 * @param {HTMLNode} e HTML node to search from.
	 * @param {string} n Comma separated list of element names to search for.
	 * @return HTML Element or null if it wasn't found.
	 * @type HTMLElement 
	 */
	nextNode : function(e, n) {
		var a = n.split(','), i;

		while ((e = e.nextSibling) != null) {
			for (i=0; i<a.length; i++) {
				if (e.nodeName == a[i])
					return e;
			}
		}

		return null;
	},

	/**
	 * Returns a array of elements when the specified function matches a node.
	 *
	 * @param {DOMNode} n Node to select children from.
	 * @param {string} na Element name(s) to search for separated by commas.
	 * @param {function} f Function that returns true/false if the node is to be added or not.
	 * @return Array with selected elements.
	 * @type Array
	 */
	selectElements : function(n, na, f) {
		var i, a = [], nl, x;

		for (x=0, na = na.split(','); x<na.length; x++)
			for (i=0, nl = n.getElementsByTagName(na[x]); i<nl.length; i++)
				(!f || f(nl[i])) && a.push(nl[i]);

		return a;
	},

	/**
	 * Returns a array of nodes when the specified function matches a node.
	 *
	 * @param {DOMNode} n Node to select children from.
	 * @param {function} f Function that returns true/false if the node is to be added or not.
	 * @param {Array} a Optional array to fill with nodes.
	 * @return Array with selected nodes.
	 * @type Array
	 */
	selectNodes : function(n, f, a) {
		var i;

		if (!a)
			a = [];

		if (f(n))
			a[a.length] = n;

		if (n.hasChildNodes()) {
			for (i=0; i<n.childNodes.length; i++)
				tinyMCE.selectNodes(n.childNodes[i], f, a);
		}

		return a;
	},

	/**
	 * Adds a CSS class to the specified element. It will remove any previous item with the same name
	 * so adding a class that already exists will move it to the end.
	 *
	 * @param {HTMLElement} e HTML element to add CSS class to.
	 * @param {string] c CSS class to add to HTML element.
	 * @param {boolean] b Optional parameter, if set to true, class will be added to the beginning.
	 * @return Returns the new class attribute value.
	 * @type string
	 */
	addCSSClass : function(e, c, b) {
		var o = this.removeCSSClass(e, c);
		return e.className = b ? c + (o !== '' ? (' ' + o) : '') : (o !== '' ? (o + ' ') : '') + c;
	},

	/**
	 * Removes the specified CSS class from the element.
	 *
	 * @param {HTMLElement} e HTML element to remove CSS class to.
	 * @param {string] c CSS class to remove to HTML element.
	 * @return Returns the new class attribute value.
	 * @type string
	 */
	removeCSSClass : function(e, c) {
		c = e.className.replace(new RegExp("(^|\\s+)" + c + "(\\s+|$)"), ' ');
		return e.className = c != ' ' ? c : '';
	},

	/**
	 * Returns true if the specified element has the specified class.
	 *
	 * @param {HTMLElement} n HTML element to check CSS class on.
	 * @param {string] c CSS class to check for.
	 * @return true/false if the specified element has the specified class.
	 * @type bool
	 */
	hasCSSClass : function(n, c) {
		return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
	},

	/**
	 * Renames the specified element to the specified name.
	 *
	 * @param {HTMLElement} e Element to rename.
	 * @param {string} n New name of the element.
	 * @param {DOMDocument} d Optional document reference.
	 */
	renameElement : function(e, n, d) {
		var ne, i, ar;

		d = typeof(d) == "undefined" ? tinyMCE.selectedInstance.getDoc() : d;

		if (e) {
			ne = d.createElement(n);

			ar = e.attributes;
			for (i=ar.length-1; i>-1; i--) {
				if (ar[i].specified && ar[i].nodeValue)
					ne.setAttribute(ar[i].nodeName.toLowerCase(), ar[i].nodeValue);
			}

			ar = e.childNodes;
			for (i=0; i<ar.length; i++)
				ne.appendChild(ar[i].cloneNode(true));

			e.parentNode.replaceChild(ne, e);
		}
	},

	/**
	 * Returns the viewport of the specificed window instance.
	 *
	 * @param {Window} w Window to get viewport of.
	 * @return Viewport object with fields top, left, width and height.
	 * @type Object
	 */
	getViewPort : function(w) {
		var d = w.document, m = d.compatMode == 'CSS1Compat', b = d.body, de = d.documentElement;

		return {
			left : w.pageXOffset || (m ? de.scrollLeft : b.scrollLeft),
			top : w.pageYOffset || (m ? de.scrollTop : b.scrollTop),
			width : w.innerWidth || (m ? de.clientWidth : b.clientWidth),
			height : w.innerHeight || (m ? de.clientHeight : b.clientHeight)
		};
	},

	/**
	 * Returns the current runtime/computed style value of a element.
	 *
	 * @param {Element} n HTML element to get style from.
	 * @param {string} na Style name to return.
	 * @param {string} d Optional default value.
	 * @return {string} Current runtime/computed style value of a element.
	 */
	getStyle : function(n, na, d) {
		if (!n)
			return false;

		// Gecko
		if (tinyMCE.isGecko && n.ownerDocument.defaultView) {
			try {
				return n.ownerDocument.defaultView.getComputedStyle(n, null).getPropertyValue(na);
			} catch (n) {
				// Old safari might fail
				return null;
			}
		}

		// Camelcase it, if needed
		na = na.replace(/-(\D)/g, function(a, b){
			return b.toUpperCase();
		});

		// IE & Opera
		if (n.currentStyle)
			return n.currentStyle[na];

		return false;
	}

	/**#@-*/
});
