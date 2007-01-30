/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

/**
 * This is the TinyMCE editor control instance class. A instance of this class will is made for each
 * converted text area.
 *
 * @constructor
 * @param {Array} settings Name/Value array of instance specific configuration settings.
 */
function TinyMCE_Control(settings) {
	var t, i, to, fu, p, x, fn, fu, pn, s = settings;

	this.undoRedoLevel = true;
	this.isTinyMCE_Control = true;

	// Default settings
	this.settings = s;
	this.settings['theme'] = tinyMCE.getParam("theme", "default");
	this.settings['width'] = tinyMCE.getParam("width", -1);
	this.settings['height'] = tinyMCE.getParam("height", -1);
	this.selection = new TinyMCE_Selection(this);
	this.undoRedo = new TinyMCE_UndoRedo(this);
	this.cleanup = new TinyMCE_Cleanup();
	this.shortcuts = new Array();
	this.hasMouseMoved = false;
	this.foreColor = this.backColor = "#999999";
	this.data = {};

	this.cleanup.init({
		valid_elements : s.valid_elements,
		extended_valid_elements : s.extended_valid_elements,
		valid_child_elements : s.valid_child_elements,
		entities : s.entities,
		entity_encoding : s.entity_encoding,
		debug : s.cleanup_debug,
		indent : s.apply_source_formatting,
		invalid_elements : s.invalid_elements,
		verify_html : s.verify_html,
		fix_content_duplication : s.fix_content_duplication,
		convert_fonts_to_spans : s.convert_fonts_to_spans
	});

	// Wrap old theme
	t = this.settings['theme'];
	if (!tinyMCE.hasTheme(t)) {
		fn = tinyMCE.callbacks;
		to = {};

		for (i=0; i<fn.length; i++) {
			if ((fu = window['TinyMCE_' + t + "_" + fn[i]]))
				to[fn[i]] = fu;
		}

		tinyMCE.addTheme(t, to);
	}

	// Wrap old plugins
	this.plugins = new Array();
	p = tinyMCE.getParam('plugins', '', true, ',');
	if (p.length > 0) {
		for (i=0; i<p.length; i++) {
			pn = p[i];

			if (pn.charAt(0) == '-')
				pn = pn.substring(1);

			if (!tinyMCE.hasPlugin(pn)) {
				fn = tinyMCE.callbacks;
				to = {};

				for (x=0; x<fn.length; x++) {
					if ((fu = window['TinyMCE_' + pn + "_" + fn[x]]))
						to[fn[x]] = fu;
				}

				tinyMCE.addPlugin(pn, to);
			}

			this.plugins[this.plugins.length] = pn; 
		}
	}
};

/**#@+
 * @member TinyMCE_Control
 */
TinyMCE_Control.prototype = {
	/**#@+
	 * @field
	 */

	/**
	 * Contains methods for handling the current instance selection.
	 *
	 * @type TinyMCE_Selection
	 */
	selection : null,

	/**
	 * Name/Value array containing all instance settings.
	 *
	 * @type Array
	 */
	settings : null,

	/**
	 * Cleanup engine reference, handles all XHTML serialization and cleanup.
	 *
	 * @type TinyMCE_Cleanup
	 */
	cleanup : null,

	/**#@+
	 * @method
	 */

	/**
	 * Get custom data storage object by name. The name should be for example the theme name or plugin name.
	 * The custom data storage can be used to store plugin/theme specific information on a editor instance. A empty
	 * object will be created automaticly the first time called.
	 *
	 * @param {String} na Name of data storate to retrive.
	 * @return Data storage object
	 * @type Object
	 */
	getData : function(na) {
		var o = this.data[na];

		if (!o)
			o = this.data[na] = {};

		return o;
	},

	/**
	 * Returns true/false if the instance has the current plugin available.
	 *
	 * @param {string} n Plugin name to check for.
	 * @return true/false if the instance has the current plugin available.
	 * @type boolean
	 */
	hasPlugin : function(n) {
		var i;

		for (i=0; i<this.plugins.length; i++) {
			if (this.plugins[i] == n)
				return true;
		}

		return false;
	},

	/**
	 * Adds a plugin to the editor instance. This will also add it globaly.
	 *
	 * @param {string} n Plugin name to check for.
	 * @param {TinyMCE_Plugin} n TinyMCE plugin instance.
	 */
	addPlugin : function(n, p) {
		if (!this.hasPlugin(n)) {
			tinyMCE.addPlugin(n, p);
			this.plugins[this.plugins.length] = n;
		}
	},

	/**
	 * Repaints the editarea in Gecko browsers. This method removes ghost resize handlers
	 * and other trailing graphics.
	 */
	repaint : function() {
		var s, b, ex;

		if (tinyMCE.isRealIE)
			return;

		try {
			s = this.selection;
			b = s.getBookmark(true);
			this.getBody().style.display = 'none';
			this.getDoc().execCommand('selectall', false, null);
			this.getSel().collapseToStart();
			this.getBody().style.display = 'block';
			s.moveToBookmark(b);
		} catch (ex) {
			// Ignore
		}
	},

	/**
	 * Switches the global TinyMCE settings to the current instance settings. This method is
	 * used to handle multiple configurations.
	 */
	switchSettings : function() {
		if (tinyMCE.configs.length > 1 && tinyMCE.currentConfig != this.settings['index']) {
			tinyMCE.settings = this.settings;
			tinyMCE.currentConfig = this.settings['index'];
		}
	},

	/**
	 * Selects this instance as the currently selected instance. This will also dispatch a selectInstance call to all
	 * themes, plugins and other listeners.
	 */
	select : function() {
		var oldInst = tinyMCE.selectedInstance;

		if (oldInst != this) {
			if (oldInst)
				oldInst.execCommand('mceEndTyping');

			tinyMCE.dispatchCallback(this, 'select_instance_callback', 'selectInstance', this, oldInst);
			tinyMCE.selectedInstance = this;
		}
	},

	/**
	 * Returns the body element of a editor instance.
	 *
	 * @return Body element of a editor instance.
	 * @type HTMLElement
	 */
	getBody : function() {
		return this.contentBody ? this.contentBody : this.getDoc().body;
	},

	/**
	 * Returns the DOM document of a editor instance.
	 *
	 * @return DOM document of a editor instance.
	 * @type DOMDocument
	 */
	getDoc : function() {
//		return this.contentDocument ? this.contentDocument : this.contentWindow.document; // Removed due to IE 5.5 ?
		return this.contentWindow.document;
	},

	/**
	 * Returns the window of a editor instance.
	 *
	 * @return Window of a editor instance.
	 * @type Window
	 */
	getWin : function() {
		return this.contentWindow;
	},

	/**
	 * Returns the container window of a editor instance. The container window is the window where the current instance lives in.
	 *
	 * @return container window of a editor instance.
	 * @type DOMDocument
	 */
	getContainerWin : function() {
		return this.containerWindow ? this.containerWindow : window;
	},

	/**
	 * Returns the viewport of the editor instance.
	 *
	 * @return Viewport object with fields top, left, width and height.
	 * @type Object
	 */
	getViewPort : function() {
		return tinyMCE.getViewPort(this.getWin());
	},

	/**
	 * Returns a node by the specified selector function. This function will
	 * loop through all parent nodes and call the specified function for each node.
	 * If the function then returns true it will stop the execution and return that node.
	 * This function will not go below the instance body element.
	 *
	 * @param {DOMNode} n HTML node to search parents on.
	 * @param {function} f Selection function to execute on each node.
	 * @return DOMNode or null if it wasn't found.
	 * @type DOMNode
	 */
	getParentNode : function(n, f) {
		return tinyMCE.getParentNode(n, f, this.getBody());
	},

	/**
	 * Returns the parent element of the specified node based on the search criteria.
	 * This method will not go below the point of the instance body.
	 *
	 * @param {HTMLNode} node Node to get parent element of.
	 * @param {string} na Comma separated list of element names to get.
	 * @param {function} f Optional function to call for each node, if it returns true the node is valid.
	 * @return HTMLElement or null based on search criteras.
	 * @type HTMLElement
	 */
	getParentElement : function(n, na, f) {
		return tinyMCE.getParentElement(n, na, f, this.getBody());
	},

	/**
	 * Returns the first block element parent of the specified node.
	 * This method will not go below the point of the instance body.
	 *
	 * @param {HTMLNode} n Node get parent block element for.
	 * @return First block element parent of the specified node or null if it wasn't found.
	 * @type HTMLElement
	 */
	getParentBlockElement : function(n) {
		return tinyMCE.getParentBlockElement(n, this.getBody());
	},

	/**
	 * Auto resizes the current editor instance to match the inner document size.
	 */
	resizeToContent : function() {
		var d = this.getDoc(), b = d.body, de = d.documentElement;

		this.iframeElement.style.height = (tinyMCE.isRealIE) ? b.scrollHeight : de.offsetHeight + 'px';
	},

	/**
	 * Adds a keyboard shortcut to a specific command. These shortcuts can for example be added
	 * at the initInstance callback of a plugin. The shortcut description can be a language variable name
	 * or a string describing the function. If you don't specify a command, the shortcut will simply be a blocker
	 * shortcut. This enables you to remove built in shortcuts or remove theme specific shortcuts from a plugin.<br />
	 * Example shortcut inst.addShortcut('ctrl,alt', 'k', 'mceSomeCommand', false, 'somevalue');
	 * Example blocker inst.addShortcut('ctrl,alt', 'k');
	 *
	 * @param {string} m List of shortcut modifiers keys, for example "ctrl,alt".
	 * @param {Object} k Shortcut key char for example "s" or a keycode value "13".
	 * @param {string} d Optional Shortcut description, this will be presented in the about dialog.
	 * @param {string} cmd Optional Command name to execute, for example mceLink or Bold.
	 * @param {boolean} ui Optional True/false state if a UI (dialog) should be presented or not.
	 * @param {Object} va Optional command value, this can be anything.
	 * @return true/false if the shortcut was added or not
	 * @type boolean
	 */
	addShortcut : function(m, k, d, cmd, ui, va) {
		var n = typeof(k) == "number", ie = tinyMCE.isIE, c, sc, i, scl = this.shortcuts;

		if (!tinyMCE.getParam('custom_shortcuts'))
			return false;

		m = m.toLowerCase();
		k = ie && !n ? k.toUpperCase() : k;
		c = n ? null : k.charCodeAt(0);
		d = d && d.indexOf('lang_') == 0 ? tinyMCE.getLang(d) : d;

		sc = {
			alt : m.indexOf('alt') != -1,
			ctrl : m.indexOf('ctrl') != -1,
			shift : m.indexOf('shift') != -1,
			charCode : c,
			keyCode : n ? k : (ie ? c : null),
			desc : d,
			cmd : cmd,
			ui : ui,
			val : va
		};

		for (i=0; i<scl.length; i++) {
			if (sc.alt == scl[i].alt && sc.ctrl == scl[i].ctrl && sc.shift == scl[i].shift
				&& sc.charCode == scl[i].charCode && sc.keyCode == scl[i].keyCode) {
				return false;
			}
		}

		scl[scl.length] = sc;

		return true;
	},

	/**
	 * Executes shortcuts based on the event information.
	 *
	 * @param {DOMEvent} e Keyboard event to handle.
	 * @return true/false if the shortcut was found and executed or not.
	 * @type boolean
	 */
	handleShortcut : function(e) {
		var i, s, o;

		// Normal key press, then ignore it
		if (!e.altKey && !e.ctrlKey)
			return false;

		s = this.shortcuts;

		for (i=0; i<s.length; i++) {
			o = s[i];

			if (o.alt == e.altKey && o.ctrl == e.ctrlKey && (o.keyCode == e.keyCode || o.charCode == e.charCode)) {
				if (o.cmd && (e.type == "keydown" || (e.type == "keypress" && !tinyMCE.isOpera)))
					tinyMCE.execCommand(o.cmd, o.ui, o.val);

				tinyMCE.cancelEvent(e);
				return true;
			}
		}

		return false;
	},

	/**
	 * Auto resets the design mode of the document if it gets lost.
	 * This is a Gecko specific function since it's a workaround for a bug where Gecko browsers
	 * loose the designMode state if the editor is hidden and shown in a tab or div.
	 */
	autoResetDesignMode : function() {
		// Add fix for tab/style.display none/block problems in Gecko
		if (!tinyMCE.isIE && this.isHidden() && tinyMCE.getParam('auto_reset_designmode'))
			eval('try { this.getDoc().designMode = "On"; this.useCSS = false; } catch(e) {}');
	},

	/**
	 * Returns if the instance is hidden or not. This is a Gecko specific function
	 * other browsers will always return false. This function is used to workaround the lost
	 * designMode bug in Gecko browsers.
	 *
	 * @return Returns if the instance is hidden or not.
	 * @type boolean
	 */
	isHidden : function() {
		var s;

		if (tinyMCE.isIE)
			return false;

		s = this.getSel();

		// Weird, wheres that cursor selection?
		return (!s || !s.rangeCount || s.rangeCount == 0);
	},

	/**
	 * Returns true/false if the editor instance is dirty or not. In other words if it has been modified
	 * or not.
	 *
	 * @return Editor instance dirty state.
	 * @type boolean
	 */
	isDirty : function() {
		// Is content modified and not in a submit procedure
		return tinyMCE.trim(this.startContent) != tinyMCE.trim(this.getBody().innerHTML) && !tinyMCE.isNotDirty;
	},

	/**
	 * ..
	 *
	 * @private
	 */
	_mergeElements : function(scmd, pa, ch, override) {
		if (scmd == "removeformat") {
			pa.className = "";
			pa.style.cssText = "";
			ch.className = "";
			ch.style.cssText = "";
			return;
		}

		var st = tinyMCE.parseStyle(tinyMCE.getAttrib(pa, "style"));
		var stc = tinyMCE.parseStyle(tinyMCE.getAttrib(ch, "style"));
		var className = tinyMCE.getAttrib(pa, "class");

		// Removed class adding due to bug #1478272
		className = tinyMCE.getAttrib(ch, "class");

		if (override) {
			for (var n in st) {
				if (typeof(st[n]) == 'function')
					continue;

				stc[n] = st[n];
			}
		} else {
			for (var n in stc) {
				if (typeof(stc[n]) == 'function')
					continue;

				st[n] = stc[n];
			}
		}

		tinyMCE.setAttrib(pa, "style", tinyMCE.serializeStyle(st));
		tinyMCE.setAttrib(pa, "class", tinyMCE.trim(className));
		ch.className = "";
		ch.style.cssText = "";
		ch.removeAttribute("class");
		ch.removeAttribute("style");
	},

	/**
	 * Sets the useCSS mode in Gecko browsers. This will also remove the build in
	 * inline table editing controls since they are buggy when it comes to col/rowspans.
	 *
	 * @param {boolean} b UseCSS state true/false.
	 * @private
	 */
	_setUseCSS : function(b) {
		var d = this.getDoc();

		try {d.execCommand("useCSS", false, !b);} catch (ex) {}
		try {d.execCommand("styleWithCSS", false, b);} catch (ex) {}

		if (!tinyMCE.getParam("table_inline_editing"))
			try {d.execCommand('enableInlineTableEditing', false, "false");} catch (ex) {}

		if (!tinyMCE.getParam("object_resizing"))
			try {d.execCommand('enableObjectResizing', false, "false");} catch (ex) {}
	},

	/**
	 * Executes a command on the current instance. These commands can be TinyMCE internal commands prefixed with "mce" or
	 * they can be build in browser commands such as "Bold". A compleate list of browser commands is available on MSDN or Mozilla.org.
	 * This function will dispatch the execCommand function on each plugin, theme or the execcommand_callback option if none of these
	 * return true it will handle the command as a internal browser command.
	 *
	 * @param {string} command Command name to execute, for example mceLink or Bold.
	 * @param {boolean} user_interface True/false state if a UI (dialog) should be presented or not.
	 * @param {mixed} value Optional command value, this can be anything.
	 */
	execCommand : function(command, user_interface, value) {
		var doc = this.getDoc(), win = this.getWin(), focusElm = this.getFocusElement();

		// Is not a undo specific command
		if (!new RegExp('mceStartTyping|mceEndTyping|mceBeginUndoLevel|mceEndUndoLevel|mceAddUndoLevel', 'gi').test(command))
			this.undoBookmark = null;

		// Mozilla issue
		if (!tinyMCE.isIE && !this.useCSS) {
			this._setUseCSS(false);
			this.useCSS = true;
		}

		//debug("command: " + command + ", user_interface: " + user_interface + ", value: " + value);
		this.contentDocument = doc; // <-- Strange, unless this is applied Mozilla 1.3 breaks

		// Don't dispatch key commands
		if (!/mceStartTyping|mceEndTyping/.test(command)) {
			if (tinyMCE.execCommandCallback(this, 'execcommand_callback', 'execCommand', this.editorId, this.getBody(), command, user_interface, value))
				return;
		}

		// Fix align on images
		if (focusElm && focusElm.nodeName == "IMG") {
			var align = focusElm.getAttribute('align');
			var img = command == "JustifyCenter" ? focusElm.cloneNode(false) : focusElm;

			switch (command) {
				case "JustifyLeft":
					if (align == 'left')
						img.removeAttribute('align');
					else
						img.setAttribute('align', 'left');

					// Remove the div
					var div = focusElm.parentNode;
					if (div && div.nodeName == "DIV" && div.childNodes.length == 1 && div.parentNode)
						div.parentNode.replaceChild(img, div);

					this.selection.selectNode(img);
					this.repaint();
					tinyMCE.triggerNodeChange();
					return;

				case "JustifyCenter":
					img.removeAttribute('align');

					// Is centered
					var div = tinyMCE.getParentElement(focusElm, "div");
					if (div && div.style.textAlign == "center") {
						// Remove div
						if (div.nodeName == "DIV" && div.childNodes.length == 1 && div.parentNode)
							div.parentNode.replaceChild(img, div);
					} else {
						// Add div
						var div = this.getDoc().createElement("div");
						div.style.textAlign = 'center';
						div.appendChild(img);
						focusElm.parentNode.replaceChild(div, focusElm);
					}

					this.selection.selectNode(img);
					this.repaint();
					tinyMCE.triggerNodeChange();
					return;

				case "JustifyRight":
					if (align == 'right')
						img.removeAttribute('align');
					else
						img.setAttribute('align', 'right');

					// Remove the div
					var div = focusElm.parentNode;
					if (div && div.nodeName == "DIV" && div.childNodes.length == 1 && div.parentNode)
						div.parentNode.replaceChild(img, div);

					this.selection.selectNode(img);
					this.repaint();
					tinyMCE.triggerNodeChange();
					return;
			}
		}

		if (tinyMCE.settings['force_br_newlines']) {
			var alignValue = "";

			if (doc.selection.type != "Control") {
				switch (command) {
						case "JustifyLeft":
							alignValue = "left";
							break;

						case "JustifyCenter":
							alignValue = "center";
							break;

						case "JustifyFull":
							alignValue = "justify";
							break;

						case "JustifyRight":
							alignValue = "right";
							break;
				}

				if (alignValue != "") {
					var rng = doc.selection.createRange();

					if ((divElm = tinyMCE.getParentElement(rng.parentElement(), "div")) != null)
						divElm.setAttribute("align", alignValue);
					else if (rng.pasteHTML && rng.htmlText.length > 0)
						rng.pasteHTML('<div align="' + alignValue + '">' + rng.htmlText + "</div>");

					tinyMCE.triggerNodeChange();
					return;
				}
			}
		}

		switch (command) {
			case "mceRepaint":
				this.repaint();
				return true;

			case "unlink":
				// Unlink if caret is inside link
				if (tinyMCE.isGecko && this.getSel().isCollapsed) {
					focusElm = tinyMCE.getParentElement(focusElm, 'A');

					if (focusElm)
						this.selection.selectNode(focusElm, false);
				}

				this.getDoc().execCommand(command, user_interface, value);

				tinyMCE.isGecko && this.getSel().collapseToEnd();

				tinyMCE.triggerNodeChange();

				return true;

			case "InsertUnorderedList":
			case "InsertOrderedList":
				this.getDoc().execCommand(command, user_interface, value);
				tinyMCE.triggerNodeChange();
				break;

			case "Strikethrough":
				this.getDoc().execCommand(command, user_interface, value);
				tinyMCE.triggerNodeChange();
				break;

			case "mceSelectNode":
				this.selection.selectNode(value);
				tinyMCE.triggerNodeChange();
				tinyMCE.selectedNode = value;
				break;

			case "FormatBlock":
				if (value == null || value == "") {
					var elm = tinyMCE.getParentElement(this.getFocusElement(), "p,div,h1,h2,h3,h4,h5,h6,pre,address,blockquote,dt,dl,dd,samp");

					if (elm)
						this.execCommand("mceRemoveNode", false, elm);
				} else {
					if (!this.cleanup.isValid(value))
						return true;

					if (tinyMCE.isGecko && new RegExp('<(div|blockquote|code|dt|dd|dl|samp)>', 'gi').test(value))
						value = value.replace(/[^a-z]/gi, '');

					if (tinyMCE.isIE && new RegExp('blockquote|code|samp', 'gi').test(value)) {
						var b = this.selection.getBookmark();
						this.getDoc().execCommand("FormatBlock", false, '<p>');
						tinyMCE.renameElement(tinyMCE.getParentBlockElement(this.getFocusElement()), value);
						this.selection.moveToBookmark(b);
					} else
						this.getDoc().execCommand("FormatBlock", false, value);
				}

				tinyMCE.triggerNodeChange();

				break;

			case "mceRemoveNode":
				if (!value)
					value = tinyMCE.getParentElement(this.getFocusElement());

				if (tinyMCE.isIE) {
					value.outerHTML = value.innerHTML;
				} else {
					var rng = value.ownerDocument.createRange();
					rng.setStartBefore(value);
					rng.setEndAfter(value);
					rng.deleteContents();
					rng.insertNode(rng.createContextualFragment(value.innerHTML));
				}

				tinyMCE.triggerNodeChange();

				break;

			case "mceSelectNodeDepth":
				var parentNode = this.getFocusElement();
				for (var i=0; parentNode; i++) {
					if (parentNode.nodeName.toLowerCase() == "body")
						break;

					if (parentNode.nodeName.toLowerCase() == "#text") {
						i--;
						parentNode = parentNode.parentNode;
						continue;
					}

					if (i == value) {
						this.selection.selectNode(parentNode, false);
						tinyMCE.triggerNodeChange();
						tinyMCE.selectedNode = parentNode;
						return;
					}

					parentNode = parentNode.parentNode;
				}

				break;

			case "mceSetStyleInfo":
			case "SetStyleInfo":
				var rng = this.getRng();
				var sel = this.getSel();
				var scmd = value['command'];
				var sname = value['name'];
				var svalue = value['value'] == null ? '' : value['value'];
				//var svalue = value['value'] == null ? '' : value['value'];
				var wrapper = value['wrapper'] ? value['wrapper'] : "span";
				var parentElm = null;
				var invalidRe = new RegExp("^BODY|HTML$", "g");
				var invalidParentsRe = tinyMCE.settings['merge_styles_invalid_parents'] != '' ? new RegExp(tinyMCE.settings['merge_styles_invalid_parents'], "gi") : null;

				// Whole element selected check
				if (tinyMCE.isIE) {
					// Control range
					if (rng.item)
						parentElm = rng.item(0);
					else {
						var pelm = rng.parentElement();
						var prng = doc.selection.createRange();
						prng.moveToElementText(pelm);

						if (rng.htmlText == prng.htmlText || rng.boundingWidth == 0) {
							if (invalidParentsRe == null || !invalidParentsRe.test(pelm.nodeName))
								parentElm = pelm;
						}
					}
				} else {
					var felm = this.getFocusElement();
					if (sel.isCollapsed || (new RegExp('td|tr|tbody|table', 'gi').test(felm.nodeName) && sel.anchorNode == felm.parentNode))
						parentElm = felm;
				}

				// Whole element selected
				if (parentElm && !invalidRe.test(parentElm.nodeName)) {
					if (scmd == "setstyle")
						tinyMCE.setStyleAttrib(parentElm, sname, svalue);

					if (scmd == "setattrib")
						tinyMCE.setAttrib(parentElm, sname, svalue);

					if (scmd == "removeformat") {
						parentElm.style.cssText = '';
						tinyMCE.setAttrib(parentElm, 'class', '');
					}

					// Remove style/attribs from all children
					var ch = tinyMCE.getNodeTree(parentElm, new Array(), 1);
					for (var z=0; z<ch.length; z++) {
						if (ch[z] == parentElm)
							continue;

						if (scmd == "setstyle")
							tinyMCE.setStyleAttrib(ch[z], sname, '');

						if (scmd == "setattrib")
							tinyMCE.setAttrib(ch[z], sname, '');

						if (scmd == "removeformat") {
							ch[z].style.cssText = '';
							tinyMCE.setAttrib(ch[z], 'class', '');
						}
					}
				} else {
					this._setUseCSS(false); // Bug in FF when running in fullscreen
					doc.execCommand("FontName", false, "#mce_temp_font#");
					var elementArray = tinyMCE.getElementsByAttributeValue(this.getBody(), "font", "face", "#mce_temp_font#");

					// Change them all
					for (var x=0; x<elementArray.length; x++) {
						elm = elementArray[x];
						if (elm) {
							var spanElm = doc.createElement(wrapper);

							if (scmd == "setstyle")
								tinyMCE.setStyleAttrib(spanElm, sname, svalue);

							if (scmd == "setattrib")
								tinyMCE.setAttrib(spanElm, sname, svalue);

							if (scmd == "removeformat") {
								spanElm.style.cssText = '';
								tinyMCE.setAttrib(spanElm, 'class', '');
							}

							if (elm.hasChildNodes()) {
								for (var i=0; i<elm.childNodes.length; i++)
									spanElm.appendChild(elm.childNodes[i].cloneNode(true));
							}

							spanElm.setAttribute("mce_new", "true");
							elm.parentNode.replaceChild(spanElm, elm);

							// Remove style/attribs from all children
							var ch = tinyMCE.getNodeTree(spanElm, new Array(), 1);
							for (var z=0; z<ch.length; z++) {
								if (ch[z] == spanElm)
									continue;

								if (scmd == "setstyle")
									tinyMCE.setStyleAttrib(ch[z], sname, '');

								if (scmd == "setattrib")
									tinyMCE.setAttrib(ch[z], sname, '');

								if (scmd == "removeformat") {
									ch[z].style.cssText = '';
									tinyMCE.setAttrib(ch[z], 'class', '');
								}
							}
						}
					}
				}

				// Cleaup wrappers
				var nodes = doc.getElementsByTagName(wrapper);
				for (var i=nodes.length-1; i>=0; i--) {
					var elm = nodes[i];
					var isNew = tinyMCE.getAttrib(elm, "mce_new") == "true";

					elm.removeAttribute("mce_new");

					// Is only child a element
					if (elm.childNodes && elm.childNodes.length == 1 && elm.childNodes[0].nodeType == 1) {
						//tinyMCE.debug("merge1" + isNew);
						this._mergeElements(scmd, elm, elm.childNodes[0], isNew);
						continue;
					}

					// Is I the only child
					if (elm.parentNode.childNodes.length == 1 && !invalidRe.test(elm.nodeName) && !invalidRe.test(elm.parentNode.nodeName)) {
						//tinyMCE.debug("merge2" + isNew + "," + elm.nodeName + "," + elm.parentNode.nodeName);
						if (invalidParentsRe == null || !invalidParentsRe.test(elm.parentNode.nodeName))
							this._mergeElements(scmd, elm.parentNode, elm, false);
					}
				}

				// Remove empty wrappers
				var nodes = doc.getElementsByTagName(wrapper);
				for (var i=nodes.length-1; i>=0; i--) {
					var elm = nodes[i];
					var isEmpty = true;

					// Check if it has any attribs
					var tmp = doc.createElement("body");
					tmp.appendChild(elm.cloneNode(false));

					// Is empty span, remove it
					tmp.innerHTML = tmp.innerHTML.replace(new RegExp('style=""|class=""', 'gi'), '');
					//tinyMCE.debug(tmp.innerHTML);
					if (new RegExp('<span>', 'gi').test(tmp.innerHTML)) {
						for (var x=0; x<elm.childNodes.length; x++) {
							if (elm.parentNode != null)
								elm.parentNode.insertBefore(elm.childNodes[x].cloneNode(true), elm);
						}

						elm.parentNode.removeChild(elm);
					}
				}

				// Re add the visual aids
				if (scmd == "removeformat")
					tinyMCE.handleVisualAid(this.getBody(), true, this.visualAid, this);

				tinyMCE.triggerNodeChange();

				break;

			case "FontName":
				if (value == null) {
					var s = this.getSel();

					// Find font and select it
					if (tinyMCE.isGecko && s.isCollapsed) {
						var f = tinyMCE.getParentElement(this.getFocusElement(), "font");

						if (f != null)
							this.selection.selectNode(f, false);
					}

					// Remove format
					this.getDoc().execCommand("RemoveFormat", false, null);

					// Collapse range if font was found
					if (f != null && tinyMCE.isGecko) {
						var r = this.getRng().cloneRange();
						r.collapse(true);
						s.removeAllRanges();
						s.addRange(r);
					}
				} else
					this.getDoc().execCommand('FontName', false, value);

				if (tinyMCE.isGecko)
					window.setTimeout('tinyMCE.triggerNodeChange(false);', 1);

				return;

			case "FontSize":
				this.getDoc().execCommand('FontSize', false, value);

				if (tinyMCE.isGecko)
					window.setTimeout('tinyMCE.triggerNodeChange(false);', 1);

				return;

			case "forecolor":
				value = value == null ? this.foreColor : value;
				value = tinyMCE.trim(value);
				value = value.charAt(0) != '#' ? (isNaN('0x' + value) ? value : '#' + value) : value;

				this.foreColor = value;
				this.getDoc().execCommand('forecolor', false, value);
				break;

			case "HiliteColor":
				value = value == null ? this.backColor : value;
				value = tinyMCE.trim(value);
				value = value.charAt(0) != '#' ? (isNaN('0x' + value) ? value : '#' + value) : value;
				this.backColor = value;

				if (tinyMCE.isGecko) {
					this._setUseCSS(true);
					this.getDoc().execCommand('hilitecolor', false, value);
					this._setUseCSS(false);
				} else
					this.getDoc().execCommand('BackColor', false, value);
				break;

			case "Cut":
			case "Copy":
			case "Paste":
				var cmdFailed = false;

				// Try executing command
				eval('try {this.getDoc().execCommand(command, user_interface, value);} catch (e) {cmdFailed = true;}');

				if (tinyMCE.isOpera && cmdFailed)
					alert('Currently not supported by your browser, use keyboard shortcuts instead.');

				// Alert error in gecko if command failed
				if (tinyMCE.isGecko && cmdFailed) {
					// Confirm more info
					if (confirm(tinyMCE.entityDecode(tinyMCE.getLang('lang_clipboard_msg'))))
						window.open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', 'mceExternal');

					return;
				} else
					tinyMCE.triggerNodeChange();
			break;

			case "mceSetContent":
				if (!value)
					value = "";

				// Call custom cleanup code
				value = tinyMCE.storeAwayURLs(value);
				value = tinyMCE._customCleanup(this, "insert_to_editor", value);

				if (this.getBody().nodeName == 'BODY')
					tinyMCE._setHTML(doc, value);
				else
					this.getBody().innerHTML = value;

				tinyMCE.setInnerHTML(this.getBody(), tinyMCE._cleanupHTML(this, doc, this.settings, this.getBody(), false, false, false, true));
				tinyMCE.convertAllRelativeURLs(this.getBody());

				// Cleanup any mess left from storyAwayURLs
				tinyMCE._removeInternal(this.getBody());

				// When editing always use fonts internaly
				if (tinyMCE.getParam("convert_fonts_to_spans"))
					tinyMCE.convertSpansToFonts(doc);

				tinyMCE.handleVisualAid(this.getBody(), true, this.visualAid, this);
				tinyMCE._setEventsEnabled(this.getBody(), false);
				return true;

			case "mceCleanup":
				var b = this.selection.getBookmark();
				tinyMCE._setHTML(this.contentDocument, this.getBody().innerHTML);
				tinyMCE.setInnerHTML(this.getBody(), tinyMCE._cleanupHTML(this, this.contentDocument, this.settings, this.getBody(), this.visualAid));
				tinyMCE.convertAllRelativeURLs(doc.body);

				// When editing always use fonts internaly
				if (tinyMCE.getParam("convert_fonts_to_spans"))
					tinyMCE.convertSpansToFonts(doc);

				tinyMCE.handleVisualAid(this.getBody(), true, this.visualAid, this);
				tinyMCE._setEventsEnabled(this.getBody(), false);
				this.repaint();
				this.selection.moveToBookmark(b);
				tinyMCE.triggerNodeChange();
			break;

			case "mceReplaceContent":
				// Force empty string
				if (!value)
					value = '';

				this.getWin().focus();

				var selectedText = "";

				if (tinyMCE.isIE) {
					var rng = doc.selection.createRange();
					selectedText = rng.text;
				} else
					selectedText = this.getSel().toString();

				if (selectedText.length > 0) {
					value = tinyMCE.replaceVar(value, "selection", selectedText);
					tinyMCE.execCommand('mceInsertContent', false, value);
				}

				tinyMCE.triggerNodeChange();
			break;

			case "mceSetAttribute":
				if (typeof(value) == 'object') {
					var targetElms = (typeof(value['targets']) == "undefined") ? "p,img,span,div,td,h1,h2,h3,h4,h5,h6,pre,address" : value['targets'];
					var targetNode = tinyMCE.getParentElement(this.getFocusElement(), targetElms);

					if (targetNode) {
						targetNode.setAttribute(value['name'], value['value']);
						tinyMCE.triggerNodeChange();
					}
				}
			break;

			case "mceSetCSSClass":
				this.execCommand("mceSetStyleInfo", false, {command : "setattrib", name : "class", value : value});
			break;

			case "mceInsertRawHTML":
				var key = 'tiny_mce_marker';

				this.execCommand('mceBeginUndoLevel');

				// Insert marker key
				this.execCommand('mceInsertContent', false, key);

				// Store away scroll pos
				var scrollX = this.getBody().scrollLeft + this.getDoc().documentElement.scrollLeft;
				var scrollY = this.getBody().scrollTop + this.getDoc().documentElement.scrollTop;

				// Find marker and replace with RAW HTML
				var html = this.getBody().innerHTML;
				if ((pos = html.indexOf(key)) != -1)
					tinyMCE.setInnerHTML(this.getBody(), html.substring(0, pos) + value + html.substring(pos + key.length));

				// Restore scoll pos
				this.contentWindow.scrollTo(scrollX, scrollY);

				this.execCommand('mceEndUndoLevel');

				break;

			case "mceInsertContent":
				// Force empty string
				if (!value)
					value = '';

				var insertHTMLFailed = false;

				// Removed since it produced problems in IE
				// this.getWin().focus();

				if (tinyMCE.isGecko || tinyMCE.isOpera) {
					try {
						// Is plain text or HTML, &amp;, &nbsp; etc will be encoded wrong in FF
						if (value.indexOf('<') == -1 && !value.match(/(&#38;|&#160;|&#60;|&#62;)/g)) {
							var r = this.getRng();
							var n = this.getDoc().createTextNode(tinyMCE.entityDecode(value));
							var s = this.getSel();
							var r2 = r.cloneRange();

							// Insert text at cursor position
							s.removeAllRanges();
							r.deleteContents();
							r.insertNode(n);

							// Move the cursor to the end of text
							r2.selectNode(n);
							r2.collapse(false);
							s.removeAllRanges();
							s.addRange(r2);
						} else {
							value = tinyMCE.fixGeckoBaseHREFBug(1, this.getDoc(), value);
							this.getDoc().execCommand('inserthtml', false, value);
							tinyMCE.fixGeckoBaseHREFBug(2, this.getDoc(), value);
						}
					} catch (ex) {
						insertHTMLFailed = true;
					}

					if (!insertHTMLFailed) {
						tinyMCE.triggerNodeChange();
						return;
					}
				}

				if (!tinyMCE.isIE) {
					var isHTML = value.indexOf('<') != -1;
					var sel = this.getSel();
					var rng = this.getRng();

					if (isHTML) {
						if (tinyMCE.isSafari) {
							var tmpRng = this.getDoc().createRange();

							tmpRng.setStart(this.getBody(), 0);
							tmpRng.setEnd(this.getBody(), 0);

							value = tmpRng.createContextualFragment(value);
						} else
							value = rng.createContextualFragment(value);
					} else {
						// Setup text node
						var el = document.createElement("div");
						el.innerHTML = value;
						value = el.firstChild.nodeValue;
						value = doc.createTextNode(value);
					}

					// Insert plain text in Safari
					if (tinyMCE.isSafari && !isHTML) {
						this.execCommand('InsertText', false, value.nodeValue);
						tinyMCE.triggerNodeChange();
						return true;
					} else if (tinyMCE.isSafari && isHTML) {
						rng.deleteContents();
						rng.insertNode(value);
						tinyMCE.triggerNodeChange();
						return true;
					}

					rng.deleteContents();

					// If target node is text do special treatment, (Mozilla 1.3 fix)
					if (rng.startContainer.nodeType == 3) {
						var node = rng.startContainer.splitText(rng.startOffset);
						node.parentNode.insertBefore(value, node); 
					} else
						rng.insertNode(value);

					if (!isHTML) {
						// Removes weird selection trails
						sel.selectAllChildren(doc.body);
						sel.removeAllRanges();

						// Move cursor to end of content
						var rng = doc.createRange();

						rng.selectNode(value);
						rng.collapse(false);

						sel.addRange(rng);
					} else
						rng.collapse(false);

					tinyMCE.fixGeckoBaseHREFBug(2, this.getDoc(), value);
				} else {
					var rng = doc.selection.createRange(), tmpRng = null;
					var c = value.indexOf('<!--') != -1;

					// Fix comment bug, add tag before comments
					if (c)
						value = tinyMCE.uniqueTag + value;

					//	tmpRng = rng.duplicate(); // Store away range (Fixes Undo bookmark bug in IE)

					if (rng.item)
						rng.item(0).outerHTML = value;
					else
						rng.pasteHTML(value);

					//if (tmpRng)
					//	tmpRng.select(); // Restore range  (Fixes Undo bookmark bug in IE)

					// Remove unique tag
					if (c) {
						var e = this.getDoc().getElementById('mceTMPElement');
						e.parentNode.removeChild(e);
					}
				}

				tinyMCE.execCommand("mceAddUndoLevel");
				tinyMCE.triggerNodeChange();
			break;

			case "mceStartTyping":
				if (tinyMCE.settings['custom_undo_redo'] && this.undoRedo.typingUndoIndex == -1) {
					this.undoRedo.typingUndoIndex = this.undoRedo.undoIndex;
					tinyMCE.typingUndoIndex = tinyMCE.undoIndex;
					this.execCommand('mceAddUndoLevel');
				}
				break;

			case "mceEndTyping":
				if (tinyMCE.settings['custom_undo_redo'] && this.undoRedo.typingUndoIndex != -1) {
					this.execCommand('mceAddUndoLevel');
					this.undoRedo.typingUndoIndex = -1;
				}

				tinyMCE.typingUndoIndex = -1;
				break;

			case "mceBeginUndoLevel":
				this.undoRedoLevel = false;
				break;

			case "mceEndUndoLevel":
				this.undoRedoLevel = true;
				this.execCommand('mceAddUndoLevel');
				break;

			case "mceAddUndoLevel":
				if (tinyMCE.settings['custom_undo_redo'] && this.undoRedoLevel) {
					if (this.undoRedo.add())
						tinyMCE.triggerNodeChange(false);
				}
				break;

			case "Undo":
				if (tinyMCE.settings['custom_undo_redo']) {
					tinyMCE.execCommand("mceEndTyping");
					this.undoRedo.undo();
					tinyMCE.triggerNodeChange();
				} else
					this.getDoc().execCommand(command, user_interface, value);
				break;

			case "Redo":
				if (tinyMCE.settings['custom_undo_redo']) {
					tinyMCE.execCommand("mceEndTyping");
					this.undoRedo.redo();
					tinyMCE.triggerNodeChange();
				} else
					this.getDoc().execCommand(command, user_interface, value);
				break;

			case "mceToggleVisualAid":
				this.visualAid = !this.visualAid;
				tinyMCE.handleVisualAid(this.getBody(), true, this.visualAid, this);
				tinyMCE.triggerNodeChange();
				break;

			case "Indent":
				this.getDoc().execCommand(command, user_interface, value);
				tinyMCE.triggerNodeChange();

				if (tinyMCE.isIE) {
					var n = tinyMCE.getParentElement(this.getFocusElement(), "blockquote");
					do {
						if (n && n.nodeName == "BLOCKQUOTE") {
							n.removeAttribute("dir");
							n.removeAttribute("style");
						}
					} while (n != null && (n = n.parentNode) != null);
				}
				break;

			case "RemoveFormat":
			case "removeformat":
				var text = this.selection.getSelectedText();

				if (tinyMCE.isOpera) {
					this.getDoc().execCommand("RemoveFormat", false, null);
					return;
				}

				if (tinyMCE.isIE) {
					try {
						var rng = doc.selection.createRange();
						rng.execCommand("RemoveFormat", false, null);
					} catch (e) {
						// Do nothing
					}

					this.execCommand("mceSetStyleInfo", false, {command : "removeformat"});
				} else {
					this.getDoc().execCommand(command, user_interface, value);

					this.execCommand("mceSetStyleInfo", false, {command : "removeformat"});
				}

				// Remove class
				if (text.length == 0)
					this.execCommand("mceSetCSSClass", false, "");

				tinyMCE.triggerNodeChange();
				break;

			default:
				this.getDoc().execCommand(command, user_interface, value);

				if (tinyMCE.isGecko)
					window.setTimeout('tinyMCE.triggerNodeChange(false);', 1);
				else
					tinyMCE.triggerNodeChange();
		}

		// Add undo level after modification
		if (command != "mceAddUndoLevel" && command != "Undo" && command != "Redo" && command != "mceStartTyping" && command != "mceEndTyping")
			tinyMCE.execCommand("mceAddUndoLevel");
	},

	/**
	 * Returns a command specific value, for example the current font size.
	 *
	 * @param {string} c Command to query value from.
	 * @return Command specific value, for example the current font size.
	 * @type mixed
	 */
	queryCommandValue : function(c) {
		try {
			return this.getDoc().queryCommandValue(c);
		} catch (e) {
			return null;
		}
	},

	/**
	 * Returns a command specific state, for example if bold is enabled or not.
	 *
	 * @param {string} c Command to query state from.
	 * @return Command specific state, for example if bold is enabled or not.
	 * @type boolean
	 */
	queryCommandState : function(c) {
		return this.getDoc().queryCommandState(c);
	},

	/**
	 * Gets executed when the editor control instance is added.
	 *
	 * @param {HTMLElement} replace_element Element to replace with a editor instance.
	 * @param {string} form_element_name Form element name that gets replaced.
	 * @param {DOMDocument} target_document Target document reference where the element is located.
	 * @private
	 */
	_onAdd : function(replace_element, form_element_name, target_document) {
		var hc, th, to, editorTemplate;

		th = this.settings['theme'];
		to = tinyMCE.themes[th];

		var targetDoc = target_document ? target_document : document;

		this.targetDoc = targetDoc;

		tinyMCE.themeURL = tinyMCE.baseURL + "/themes/" + this.settings['theme'];
		this.settings['themeurl'] = tinyMCE.themeURL;

		if (!replace_element) {
			alert("Error: Could not find the target element.");
			return false;
		}

		if (to.getEditorTemplate)
			editorTemplate = to.getEditorTemplate(this.settings, this.editorId);

		var deltaWidth = editorTemplate['delta_width'] ? editorTemplate['delta_width'] : 0;
		var deltaHeight = editorTemplate['delta_height'] ? editorTemplate['delta_height'] : 0;
		var html = '<span id="' + this.editorId + '_parent" class="mceEditorContainer">' + editorTemplate['html'];

		html = tinyMCE.replaceVar(html, "editor_id", this.editorId);
		this.settings['default_document'] = tinyMCE.baseURL + "/blank.htm";

		this.settings['old_width'] = this.settings['width'];
		this.settings['old_height'] = this.settings['height'];

		// Set default width, height
		if (this.settings['width'] == -1)
			this.settings['width'] = replace_element.offsetWidth;

		if (this.settings['height'] == -1)
			this.settings['height'] = replace_element.offsetHeight;

		// Try the style width
		if (this.settings['width'] == 0)
			this.settings['width'] = replace_element.style.width;

		// Try the style height
		if (this.settings['height'] == 0)
			this.settings['height'] = replace_element.style.height; 

		// If no width/height then default to 320x240, better than nothing
		if (this.settings['width'] == 0)
			this.settings['width'] = 320;

		if (this.settings['height'] == 0)
			this.settings['height'] = 240;

		this.settings['area_width'] = parseInt(this.settings['width']);
		this.settings['area_height'] = parseInt(this.settings['height']);
		this.settings['area_width'] += deltaWidth;
		this.settings['area_height'] += deltaHeight;

		this.settings['width_style'] = "" + this.settings['width'];
		this.settings['height_style'] = "" + this.settings['height'];

		// Special % handling
		if (("" + this.settings['width']).indexOf('%') != -1)
			this.settings['area_width'] = "100%";
		else
			this.settings['width_style'] += 'px';

		if (("" + this.settings['height']).indexOf('%') != -1)
			this.settings['area_height'] = "100%";
		else
			this.settings['height_style'] += 'px';

		if (("" + replace_element.style.width).indexOf('%') != -1) {
			this.settings['width'] = replace_element.style.width;
			this.settings['area_width'] = "100%";
			this.settings['width_style'] = "100%";
		}

		if (("" + replace_element.style.height).indexOf('%') != -1) {
			this.settings['height'] = replace_element.style.height;
			this.settings['area_height'] = "100%";
			this.settings['height_style'] = "100%";
		}

		html = tinyMCE.applyTemplate(html);

		this.settings['width'] = this.settings['old_width'];
		this.settings['height'] = this.settings['old_height'];

		this.visualAid = this.settings['visual'];
		this.formTargetElementId = form_element_name;

		// Get replace_element contents
		if (replace_element.nodeName == "TEXTAREA" || replace_element.nodeName == "INPUT")
			this.startContent = replace_element.value;
		else
			this.startContent = replace_element.innerHTML;

		// If not text area or input
		if (replace_element.nodeName != "TEXTAREA" && replace_element.nodeName != "INPUT") {
			this.oldTargetElement = replace_element;

			// Debug mode
			if (tinyMCE.settings['debug']) {
				hc = '<textarea wrap="off" id="' + form_element_name + '" name="' + form_element_name + '" cols="100" rows="15"></textarea>';
			} else {
				hc = '<input type="hidden" id="' + form_element_name + '" name="' + form_element_name + '" />';
				this.oldTargetDisplay = tinyMCE.getStyle(this.oldTargetElement, 'display', 'inline');
				this.oldTargetElement.style.display = "none";
			}

			html += '</span>';

			if (tinyMCE.isGecko)
				html = hc + html;
			else
				html += hc;

			// Output HTML and set editable
			if (tinyMCE.isGecko) {
				var rng = replace_element.ownerDocument.createRange();
				rng.setStartBefore(replace_element);

				var fragment = rng.createContextualFragment(html);
				tinyMCE.insertAfter(fragment, replace_element);
			} else
				replace_element.insertAdjacentHTML("beforeBegin", html);
		} else {
			html += '</span>';

			// Just hide the textarea element
			this.oldTargetElement = replace_element;

			if (!tinyMCE.settings['debug']) {
				this.oldTargetDisplay = tinyMCE.getStyle(this.oldTargetElement, 'display', 'inline');
				this.oldTargetElement.style.display = "none";
			}

			// Output HTML and set editable
			if (tinyMCE.isGecko) {
				var rng = replace_element.ownerDocument.createRange();
				rng.setStartBefore(replace_element);

				var fragment = rng.createContextualFragment(html);
				tinyMCE.insertAfter(fragment, replace_element);
			} else
				replace_element.insertAdjacentHTML("beforeBegin", html);
		}

		// Setup iframe
		var dynamicIFrame = false;
		var tElm = targetDoc.getElementById(this.editorId);

		if (!tinyMCE.isIE) {
			// Node case is preserved in XML strict mode
			if (tElm && (tElm.nodeName == "SPAN" || tElm.nodeName == "span")) {
				tElm = tinyMCE._createIFrame(tElm, targetDoc);
				dynamicIFrame = true;
			}

			this.targetElement = tElm;
			this.iframeElement = tElm;
			this.contentDocument = tElm.contentDocument;
			this.contentWindow = tElm.contentWindow;

			//this.getDoc().designMode = "on";
		} else {
			if (tElm && tElm.nodeName == "SPAN")
				tElm = tinyMCE._createIFrame(tElm, targetDoc, targetDoc.parentWindow);
			else
				tElm = targetDoc.frames[this.editorId];

			this.targetElement = tElm;
			this.iframeElement = targetDoc.getElementById(this.editorId);

			if (tinyMCE.isOpera) {
				this.contentDocument = this.iframeElement.contentDocument;
				this.contentWindow = this.iframeElement.contentWindow;
				dynamicIFrame = true;
			} else {
				this.contentDocument = tElm.window.document;
				this.contentWindow = tElm.window;
			}

			this.getDoc().designMode = "on";
		}

		// Setup base HTML
		var doc = this.contentDocument;
		if (dynamicIFrame) {
			var html = tinyMCE.getParam('doctype') + '<html><head xmlns="http://www.w3.org/1999/xhtml"><base href="' + tinyMCE.settings['base_href'] + '" /><title>blank_page</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body class="mceContentBody"></body></html>';

			try {
				if (!this.isHidden())
					this.getDoc().designMode = "on";

				doc.open();
				doc.write(html);
				doc.close();
			} catch (e) {
				// Failed Mozilla 1.3
				this.getDoc().location.href = tinyMCE.baseURL + "/blank.htm";
			}
		}

		// This timeout is needed in MSIE 5.5 for some odd reason
		// it seems that the document.frames isn't initialized yet?
		if (tinyMCE.isIE)
			window.setTimeout("tinyMCE.addEventHandlers(tinyMCE.instances[\"" + this.editorId + "\"]);", 1);

		tinyMCE.setupContent(this.editorId, true);

		return true;
	},

	/**
	 * Sets the base href url of the current document instance. This method is used
	 * to temporarly remove the base url during copy/paste and drag/drop operations
	 * of relative links from external sites into TinyMCE. MSIE has a bug and converts
	 * relative links from external sites to absolute links incorrectly.
	 *
	 * @param {string} u URL to set as base URL or null to remove it.
	 */
	setBaseHREF : function(u) {
		var h, b, d, nl;

		d = this.getDoc();
		nl = d.getElementsByTagName("base");
		b = nl.length > 0 ? nl[0] : null;

		if (!b) {
			nl = d.getElementsByTagName("head");
			h = nl.length > 0 ? nl[0] : null;

			b = d.createElement("base");
			b.setAttribute('href', u);
			h.appendChild(b);
		} else {
			if (u == "" || u == null)
				b.parentNode.removeChild(b);
			else
				b.setAttribute('href', u);
		}
	},

	/**
	 * Returns the cleaned HTML of the editor control instance.
	 *
	 * @param {bool} r Optional raw parameter, if set to true. Cleanup will be skipped.
	 * @return Cleaned HTML content string.
	 * @type string
	 */
	getHTML : function(r) {
		var h, d = this.getDoc(), b = this.getBody();

		if (r)
			return b.innerHTML;

		h = tinyMCE._cleanupHTML(this, d, this.settings, b, false, true, false, true);

		if (tinyMCE.getParam("convert_fonts_to_spans"))
			tinyMCE.convertSpansToFonts(d);

		return h;
	},

	/**
	 * Sets the HTML contents of the instance.
	 *
	 * @param {string} h HTML content string to replace body with.
	 */
	setHTML : function(h) {
		this.execCommand('mceSetContent', false, h);
		this.repaint();
	},

	/**
	 * Returns the currently selected element. This is was added for compatiblity and is deprecated.
	 * Please use inst.selection.getFocusElement instead.
	 *
	 * @return Currently selected element.
	 * @type HTMLElement
	 * @deprecated
	 */
	getFocusElement : function() {
		return this.selection.getFocusElement();
	},

	/**
	 * Returns the browsers selection instance. This is was added for compatiblity and is deprecated.
	 * Please use inst.selection.getSel instead.
	 *
	 * @return Browser selection instance.
	 * @type DOMSelection
	 * @deprecated
	 */
	getSel : function() {
		return this.selection.getSel();
	},

	/**
	 * Returns the browsers selections first range instance. This is was added for compatiblity and is deprecated.
	 * Please use inst.selection.getRng instead.
	 *
	 * @return Browsers selections first range instance.
	 * @type DOMRange
	 * @deprecated
	 */
	getRng : function() {
		return this.selection.getRng();
	},

	/**
	 * Moves the contents from the TinyMCE editor control instance to the hidden textarea
	 * that got replaced with TinyMCE. This is executed automaticly on for example form submit unless you configure otherwice.
	 *
	 * @param {boolean} skip_cleanup Optional Skip cleanup, simply move the contents as fast as possible.
	 * @param {boolean} skip_callback Optional Skip callback, don't call the save_callback function.
	 */
	triggerSave : function(skip_cleanup, skip_callback) {
		var e, nl = [], i, s;

		this.switchSettings();
		s = tinyMCE.settings;

		// Force hidden tabs visible while serializing
		if (tinyMCE.isRealIE) {
			e = this.iframeElement;

			do {
				if (e.style && e.style.display == 'none') {
					e.style.display = 'block';
					nl[nl.length] = {elm : e, type : 'style'};
				}

				if (e.style && s.hidden_tab_class.length > 0 && e.className.indexOf(s.hidden_tab_class) != -1) {
					e.className = s.display_tab_class;
					nl[nl.length] = {elm : e, type : 'class'};
				}
			} while ((e = e.parentNode) != null)
		}

		tinyMCE.settings['preformatted'] = false;

		// Default to false
		if (typeof(skip_cleanup) == "undefined")
			skip_cleanup = false;

		// Default to false
		if (typeof(skip_callback) == "undefined")
			skip_callback = false;

		tinyMCE._setHTML(this.getDoc(), this.getBody().innerHTML);

		// Remove visual aids when cleanup is disabled
		if (this.settings['cleanup'] == false) {
			tinyMCE.handleVisualAid(this.getBody(), true, false, this);
			tinyMCE._setEventsEnabled(this.getBody(), true);
		}

		tinyMCE._customCleanup(this, "submit_content_dom", this.contentWindow.document.body);
		var htm = skip_cleanup ? this.getBody().innerHTML : tinyMCE._cleanupHTML(this, this.getDoc(), this.settings, this.getBody(), tinyMCE.visualAid, true, true);
		htm = tinyMCE._customCleanup(this, "submit_content", htm);

		if (!skip_callback && tinyMCE.settings['save_callback'] != "")
			var content = eval(tinyMCE.settings['save_callback'] + "(this.formTargetElementId,htm,this.getBody());");

		// Use callback content if available
		if ((typeof(content) != "undefined") && content != null)
			htm = content;

		// Replace some weird entities (Bug: #1056343)
		htm = tinyMCE.regexpReplace(htm, "&#40;", "(", "gi");
		htm = tinyMCE.regexpReplace(htm, "&#41;", ")", "gi");
		htm = tinyMCE.regexpReplace(htm, "&#59;", ";", "gi");
		htm = tinyMCE.regexpReplace(htm, "&#34;", "&quot;", "gi");
		htm = tinyMCE.regexpReplace(htm, "&#94;", "^", "gi");

		if (this.formElement)
			this.formElement.value = htm;

		if (tinyMCE.isSafari && this.formElement)
			this.formElement.innerText = htm;

		// Hide them again (tabs in MSIE)
		for (i=0; i<nl.length; i++) {
			if (nl[i].type == 'style')
				nl[i].elm.style.display = 'none';
			else
				nl[i].elm.className = s.hidden_tab_class;
		}
	}

	/**#@-*/
};
