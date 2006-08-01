/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

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
TinyMCE_Engine.prototype.getElementByAttributeValue = function(n, e, a, v) {
	return (n = this.getElementsByAttributeValue(n, e, a, v)).length == 0 ? null : n[0];
};

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
TinyMCE_Engine.prototype.getElementsByAttributeValue = function(n, e, a, v) {
	var i, nl = n.getElementsByTagName(e), o = new Array();

	for (i=0; i<nl.length; i++) {
		if (tinyMCE.getAttrib(nl[i], a).indexOf(v) != -1)
			o[o.length] = nl[i];
	}

	return o;
};

/**
 * Returns true/false if the specified node is a block element or not.
 *
 * @param {HTMLNode} n Node to verify.
 * @return true/false if the specified node is a block element or not.
 * @type boolean
 */
TinyMCE_Engine.prototype.isBlockElement = function(n) {
	return n != null && n.nodeType == 1 && this.blockRegExp.test(n.nodeName);
};

/**
 * Returns the first block element parent of the specified node.
 *
 * @param {HTMLNode} n Node get parent block element for.
 * @return First block element parent of the specified node or null if it wasn't found.
 * @type HTMLElement
 */
TinyMCE_Engine.prototype.getParentBlockElement = function(n) {
	while (n) {
		if (this.isBlockElement(n))
			return n;

		n = n.parentNode;
	}

	return null;
};

/**
 * Inserts a node after the specific node.
 *
 * @param {HTMLNode} n New node to insert.
 * @param {HTMLNode} r Reference node to insert after.
 */
TinyMCE_Engine.prototype.insertAfter = function(n, r){
	if (r.nextSibling)
		r.parentNode.insertBefore(n, r.nextSibling);
	else
		r.parentNode.appendChild(n);
};

/**
 * Sets the innerHTML property of a element, this function also
 * fixes a MSIE bug where the first comment is removed.
 *
 * @param {HTMLElement} e Element to insert HTML in.
 * @param {string} h HTML code to insert into innerHTML.
 */
TinyMCE_Engine.prototype.setInnerHTML = function(e, h) {
	var i, nl, n;

	if (tinyMCE.isMSIE && !tinyMCE.isOpera) {
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
};

/**
 * Returns the outer HTML of a element, this uses the outerHTML
 * property in MSIE and Opera and a workaround for Gecko.
 *
 * @param {HTMLElement} e HTML element to get outerHTML from.
 * @return HTML content string.
 * @type string
 */
TinyMCE_Engine.prototype.getOuterHTML = function(e) {
	if (tinyMCE.isMSIE)
		return e.outerHTML;

	var d = e.ownerDocument.createElement("body");
	d.appendChild(e);
	return d.innerHTML;
};

/**
 * Sets the outer HTML of a element, this uses the outerHTML
 * property in MSIE and Opera and a workaround for Gecko.
 *
 * @param {HTMLElement} e HTML element to set outerHTML on.
 * @param {string} h HTML string to set in property.
 */
TinyMCE_Engine.prototype.setOuterHTML = function(e, h) {
	var d, i, nl;

	if (tinyMCE.isMSIE)
		e.outerHTML = h;
	else {
		var d = e.ownerDocument.createElement("body");
		d.innerHTML = h;

		for (i=0, nl=d.childNodes; i<nl.length; i++)
			e.parentNode.insertBefore(nl[i], e);

		e.parentNode.removeChild(e);
	}
};

/**
 * Returns a element by id, this will also search the form names to match the id.
 *
 * @param {string} id Id of element.
 * @param {DOMDocument} d Optional document.
 * @return HTML element that matches the id.
 * @type HTMLElement
 */
TinyMCE_Engine.prototype._getElementById = function(id, d) {
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
};

/**
 * Returns a array of nodes selected retrived from the child nodes of the specified node.
 *
 * @param {HTMLNode} n Node to get children from.
 * @param {Array} na Array to fill with children.
 * @param {int} t Node type to get.
 * @param {string} nn Node name of items to retrive.
 * @return Node array.
 * @type Array
 */
TinyMCE_Engine.prototype.getNodeTree = function(n, na, t, nn) {
	var i;

	if (typeof(t) == "undefined" || n.nodeType == t && (typeof(nn) == "undefined" || n.nodeName == nn))
		na[na.length] = n;

	if (n.hasChildNodes()) {
		for (i=0; i<n.childNodes.length; i++)
			tinyMCE.getNodeTree(n.childNodes[i], na, t, nn);
	}

	return na;
};

/**
 * Returns the parent element of the specified node based on the search criteria.
 *
 * @param {HTMLNode} node Node to get parent element of.
 * @param {string} names Comma separated list of element names to get.
 * @param {string} attrib_name Optional attribute name to match.
 * @param {string} attrib_value Optional attribute value to match.
 * @return HTMLElement or null based on search criteras.
 * @type HTMLElement
 */
TinyMCE_Engine.prototype.getParentElement = function(node, names, attrib_name, attrib_value) {
	if (typeof(names) == "undefined") {
		if (node.nodeType == 1)
			return node;

		// Find parent node that is a element
		while ((node = node.parentNode) != null && node.nodeType != 1) ;

		return node;
	}

	if (node == null)
		return null;

	var namesAr = names.toUpperCase().split(',');

	do {
		for (var i=0; i<namesAr.length; i++) {
			if (node.nodeName == namesAr[i] || names == "*") {
				if (typeof(attrib_name) == "undefined")
					return node;
				else if (node.getAttribute(attrib_name)) {
					if (typeof(attrib_value) == "undefined") {
						if (node.getAttribute(attrib_name) != "")
							return node;
					} else if (node.getAttribute(attrib_name) == attrib_value)
						return node;
				}
			}
		}
	} while ((node = node.parentNode) != null);

	return null;
};

/**
 * Returns a node by the specified selector function. This function will
 * loop through all parent nodes and call the specified function for each node.
 * If the function then returns true it will stop the execution and return that node.
 *
 * @param {DOMNode} n HTML node to search parents on.
 * @param {function} f Selection function to execute on each node.
 * @return DOMNode or null if it wasn't found.
 * @type DOMNode
 */
TinyMCE_Engine.prototype.getParentNode = function(n, f) {
	while (n) {
		if (f(n))
			return n;

		n = n.parentNode;
	}

	return null;
};

/**
 * Returns the attribute value of a element or the default value if it wasn't found.
 *
 * @param {HTMLElement} elm HTML element to get attribute from.
 * @param {string} name Attribute name to retrive.
 * @param {string} default_value Optional default value to return, this value defaults to a empty string.
 * @return Attribute value or default value if it wasn't found in element.
 * @type string
 */
TinyMCE_Engine.prototype.getAttrib = function(elm, name, default_value) {
	if (typeof(default_value) == "undefined")
		default_value = "";

	// Not a element
	if (!elm || elm.nodeType != 1)
		return default_value;

	var v = elm.getAttribute(name);

	// Try className for class attrib
	if (name == "class" && !v)
		v = elm.className;

	// Workaround for a issue with Firefox 1.5rc2+
	if (tinyMCE.isGecko && name == "src" && elm.src != null && elm.src != "")
		v = elm.src;

	// Workaround for a issue with Firefox 1.5rc2+
	if (tinyMCE.isGecko && name == "href" && elm.href != null && elm.href != "")
		v = elm.href;

	if (name == "http-equiv" && tinyMCE.isMSIE)
		v = elm.httpEquiv;

	if (name == "style" && !tinyMCE.isOpera)
		v = elm.style.cssText;

	return (v && v != "") ? v : default_value;
};

/**
 * Sets the attribute value for a specific attribute.
 *
 * @param {HTMLElement} element HTML element to set attribute on.
 * @param {string} name Attribute name to set.
 * @param {string} value Attribute value to set.
 * @param {boolean} fix_value Optional fix value state, if true only number data will be accepted.
 */
TinyMCE_Engine.prototype.setAttrib = function(element, name, value, fix_value) {
	if (typeof(value) == "number" && value != null)
		value = "" + value;

	if (fix_value) {
		if (value == null)
			value = "";

		var re = new RegExp('[^0-9%]', 'g');
		value = value.replace(re, '');
	}

	if (name == "style")
		element.style.cssText = value;

	if (name == "class")
		element.className = value;

	if (value != null && value != "" && value != -1)
		element.setAttribute(name, value);
	else
		element.removeAttribute(name);
};

/**
 * Sets a style attribute item value.
 *
 * @param {HTMLElement} elm HTML element to set style attribute item on.
 * @param {string} name Style item name to set.
 * @param {string} value Style item value to set.
 */
TinyMCE_Engine.prototype.setStyleAttrib = function(elm, name, value) {
	eval('elm.style.' + name + '=value;');

	// Style attrib deleted
	if (tinyMCE.isMSIE && value == null || value == '') {
		var str = tinyMCE.serializeStyle(tinyMCE.parseStyle(elm.style.cssText));
		elm.style.cssText = str;
		elm.setAttribute("style", str);
	}
};

/**
 * Switches the CSS class of the specified element. This method also caches the
 * elements in a lookup table for performance. This should only be used for TinyMCE main UI controls
 * like buttons or select elements.
 *
 * @param {HTMLElement} ei Element to set CSS class on.
 * @param {string} c CSS class to set.
 */
TinyMCE_Engine.prototype.switchClass = function(ei, c) {
	var e;

	if (tinyMCE.switchClassCache[ei])
		e = tinyMCE.switchClassCache[ei];
	else
		e = tinyMCE.switchClassCache[ei] = document.getElementById(ei);

	if (e) {
		// Keep tile mode
		if (tinyMCE.settings.button_tile_map && e.className && e.className.indexOf('mceTiledButton') == 0)
			c = 'mceTiledButton ' + c;

		e.className = c;
	}
};

/**
 * Returns the absolute x, y position of a node. The position will be returned in a object with
 * two properties absLeft and absTop.
 *
 * @param {HTMLNode} n HTML element to get x, y position from.
 * @param {HTMLNode} cn Optional HTML element to to stop position calcualtion by.
 * @return Absolute position of the specified element.
 * @type TinyMCE_ElementPosition
 */
TinyMCE_Engine.prototype.getAbsPosition = function(n, cn) {
	var p = {absLeft : 0, absTop : 0};

	while (n && n != cn) {
		p.absLeft += n.offsetLeft;
		p.absTop += n.offsetTop;
		n = n.offsetParent;
	}

	return p;
};

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
TinyMCE_Engine.prototype.prevNode = function(e, n) {
	var a = n.split(','), i;

	while ((e = e.previousSibling) != null) {
		for (i=0; i<a.length; i++) {
			if (e.nodeName == a[i])
				return e;
		}
	}

	return null;
};

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
TinyMCE_Engine.prototype.nextNode = function(e, n) {
	var a = n.split(','), i;

	while ((e = e.nextSibling) != null) {
		for (i=0; i<a.length; i++) {
			if (e.nodeName == a[i])
				return e;
		}
	}

	return null;
};

/**
 * Returns a array of nodes when the specified function matches a node.
 *
 * @param {DOMNode} n Node to select children from.
 * @param {function} f Function that returns true/false if the node is to be added or not.
 * @param {Array} a Optional array to fill with nodes.
 * @return Array with selected nodes.
 * @type Array
 */
TinyMCE_Engine.prototype.selectNodes = function(n, f, a) {
	var i;

	if (!a)
		a = new Array();

	if (f(n))
		a[a.length] = n;

	if (n.hasChildNodes()) {
		for (i=0; i<n.childNodes.length; i++)
			tinyMCE.selectNodes(n.childNodes[i], f, a);
	}

	return a;
};

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
TinyMCE_Engine.prototype.addCSSClass = function(e, c, b) {
	var o = this.removeCSSClass(e, c);

	return e.className = b ? c + (o != '' ? (' ' + o) : '') : (o != '' ? (o + ' ') : '') + c;
};

/**
 * Removes the specified CSS class from the element.
 *
 * @param {HTMLElement} e HTML element to remove CSS class to.
 * @param {string] c CSS class to remove to HTML element.
 * @return Returns the new class attribute value.
 * @type string
 */
TinyMCE_Engine.prototype.removeCSSClass = function(e, c) {
	var a = this.explode(' ', e.className), i;

	for (i=0; i<a.length; i++) {
		if (a[i] == c)
			a[i] = '';
	}

	return e.className = a.join(' ');
};

/**
 * Renames the specified element to the specified name.
 *
 * @param {HTMLElement} e Element to rename.
 * @param {string} n New name of the element.
 * @param {DOMDocument} d Optional document reference.
 */
TinyMCE_Engine.prototype.renameElement = function(e, n, d) {
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
};
