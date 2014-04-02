/**
 * Selection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles text and control selection it's an crossbrowser utility class.
 * Consult the TinyMCE Wiki API for more details and examples on how to use this class.
 *
 * @class tinymce.dom.Selection
 * @example
 * // Getting the currently selected node for the active editor
 * alert(tinymce.activeEditor.selection.getNode().nodeName);
 */
define("tinymce/dom/Selection", [
	"tinymce/dom/TreeWalker",
	"tinymce/dom/TridentSelection",
	"tinymce/dom/ControlSelection",
	"tinymce/dom/RangeUtils",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(TreeWalker, TridentSelection, ControlSelection, RangeUtils, Env, Tools) {
	var each = Tools.each, grep = Tools.grep, trim = Tools.trim;
	var isIE = Env.ie, isOpera = Env.opera;

	/**
	 * Constructs a new selection instance.
	 *
	 * @constructor
	 * @method Selection
	 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
	 * @param {Window} win Window to bind the selection object to.
	 * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
	 */
	function Selection(dom, win, serializer, editor) {
		var self = this;

		self.dom = dom;
		self.win = win;
		self.serializer = serializer;
		self.editor = editor;

		self.controlSelection = new ControlSelection(self, editor);

		// No W3C Range support
		if (!self.win.getSelection) {
			self.tridentSel = new TridentSelection(self);
		}
	}

	Selection.prototype = {
		/**
		 * Move the selection cursor range to the specified node and offset.
		 * If there is no node specified it will move it to the first suitable location within the body.
		 *
		 * @method setCursorLocation
		 * @param {Node} node Optional node to put the cursor in.
		 * @param {Number} offset Optional offset from the start of the node to put the cursor at.
		 */
		setCursorLocation: function(node, offset) {
			var self = this, rng = self.dom.createRng();

			if (!node) {
				self._moveEndPoint(rng, self.editor.getBody(), true);
				self.setRng(rng);
			} else {
				rng.setStart(node, offset);
				rng.setEnd(node, offset);
				self.setRng(rng);
				self.collapse(false);
			}
		},

		/**
		 * Returns the selected contents using the DOM serializer passed in to this class.
		 *
		 * @method getContent
		 * @param {Object} s Optional settings class with for example output format text or html.
		 * @return {String} Selected contents in for example HTML format.
		 * @example
		 * // Alerts the currently selected contents
		 * alert(tinymce.activeEditor.selection.getContent());
		 *
		 * // Alerts the currently selected contents as plain text
		 * alert(tinymce.activeEditor.selection.getContent({format: 'text'}));
		 */
		getContent: function(args) {
			var self = this, rng = self.getRng(), tmpElm = self.dom.create("body");
			var se = self.getSel(), whiteSpaceBefore, whiteSpaceAfter, fragment;

			args = args || {};
			whiteSpaceBefore = whiteSpaceAfter = '';
			args.get = true;
			args.format = args.format || 'html';
			args.selection = true;
			self.editor.fire('BeforeGetContent', args);

			if (args.format == 'text') {
				return self.isCollapsed() ? '' : (rng.text || (se.toString ? se.toString() : ''));
			}

			if (rng.cloneContents) {
				fragment = rng.cloneContents();

				if (fragment) {
					tmpElm.appendChild(fragment);
				}
			} else if (rng.item !== undefined || rng.htmlText !== undefined) {
				// IE will produce invalid markup if elements are present that
				// it doesn't understand like custom elements or HTML5 elements.
				// Adding a BR in front of the contents and then remoiving it seems to fix it though.
				tmpElm.innerHTML = '<br>' + (rng.item ? rng.item(0).outerHTML : rng.htmlText);
				tmpElm.removeChild(tmpElm.firstChild);
			} else {
				tmpElm.innerHTML = rng.toString();
			}

			// Keep whitespace before and after
			if (/^\s/.test(tmpElm.innerHTML)) {
				whiteSpaceBefore = ' ';
			}

			if (/\s+$/.test(tmpElm.innerHTML)) {
				whiteSpaceAfter = ' ';
			}

			args.getInner = true;

			args.content = self.isCollapsed() ? '' : whiteSpaceBefore + self.serializer.serialize(tmpElm, args) + whiteSpaceAfter;
			self.editor.fire('GetContent', args);

			return args.content;
		},

		/**
		 * Sets the current selection to the specified content. If any contents is selected it will be replaced
		 * with the contents passed in to this function. If there is no selection the contents will be inserted
		 * where the caret is placed in the editor/page.
		 *
		 * @method setContent
		 * @param {String} content HTML contents to set could also be other formats depending on settings.
		 * @param {Object} args Optional settings object with for example data format.
		 * @example
		 * // Inserts some HTML contents at the current selection
		 * tinymce.activeEditor.selection.setContent('<strong>Some contents</strong>');
		 */
		setContent: function(content, args) {
			var self = this, rng = self.getRng(), caretNode, doc = self.win.document, frag, temp;

			args = args || {format: 'html'};
			args.set = true;
			args.selection = true;
			content = args.content = content;

			// Dispatch before set content event
			if (!args.no_events) {
				self.editor.fire('BeforeSetContent', args);
			}

			content = args.content;

			if (rng.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				content += '<span id="__caret">_</span>';

				// Delete and insert new node
				if (rng.startContainer == doc && rng.endContainer == doc) {
					// WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
					doc.body.innerHTML = content;
				} else {
					rng.deleteContents();

					if (doc.body.childNodes.length === 0) {
						doc.body.innerHTML = content;
					} else {
						// createContextualFragment doesn't exists in IE 9 DOMRanges
						if (rng.createContextualFragment) {
							rng.insertNode(rng.createContextualFragment(content));
						} else {
							// Fake createContextualFragment call in IE 9
							frag = doc.createDocumentFragment();
							temp = doc.createElement('div');

							frag.appendChild(temp);
							temp.outerHTML = content;

							rng.insertNode(frag);
						}
					}
				}

				// Move to caret marker
				caretNode = self.dom.get('__caret');

				// Make sure we wrap it compleatly, Opera fails with a simple select call
				rng = doc.createRange();
				rng.setStartBefore(caretNode);
				rng.setEndBefore(caretNode);
				self.setRng(rng);

				// Remove the caret position
				self.dom.remove('__caret');

				try {
					self.setRng(rng);
				} catch (ex) {
					// Might fail on Opera for some odd reason
				}
			} else {
				if (rng.item) {
					// Delete content and get caret text selection
					doc.execCommand('Delete', false, null);
					rng = self.getRng();
				}

				// Explorer removes spaces from the beginning of pasted contents
				if (/^\s+/.test(content)) {
					rng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
					self.dom.remove('__mce_tmp');
				} else {
					rng.pasteHTML(content);
				}
			}

			// Dispatch set content event
			if (!args.no_events) {
				self.editor.fire('SetContent', args);
			}
		},

		/**
		 * Returns the start element of a selection range. If the start is in a text
		 * node the parent element will be returned.
		 *
		 * @method getStart
		 * @return {Element} Start element of selection range.
		 */
		getStart: function() {
			var self = this, rng = self.getRng(), startElement, parentElement, checkRng, node;

			if (rng.duplicate || rng.item) {
				// Control selection, return first item
				if (rng.item) {
					return rng.item(0);
				}

				// Get start element
				checkRng = rng.duplicate();
				checkRng.collapse(1);
				startElement = checkRng.parentElement();
				if (startElement.ownerDocument !== self.dom.doc) {
					startElement = self.dom.getRoot();
				}

				// Check if range parent is inside the start element, then return the inner parent element
				// This will fix issues when a single element is selected, IE would otherwise return the wrong start element
				parentElement = node = rng.parentElement();
				while ((node = node.parentNode)) {
					if (node == startElement) {
						startElement = parentElement;
						break;
					}
				}

				return startElement;
			} else {
				startElement = rng.startContainer;

				if (startElement.nodeType == 1 && startElement.hasChildNodes()) {
					startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];
				}

				if (startElement && startElement.nodeType == 3) {
					return startElement.parentNode;
				}

				return startElement;
			}
		},

		/**
		 * Returns the end element of a selection range. If the end is in a text
		 * node the parent element will be returned.
		 *
		 * @method getEnd
		 * @return {Element} End element of selection range.
		 */
		getEnd: function() {
			var self = this, rng = self.getRng(), endElement, endOffset;

			if (rng.duplicate || rng.item) {
				if (rng.item) {
					return rng.item(0);
				}

				rng = rng.duplicate();
				rng.collapse(0);
				endElement = rng.parentElement();
				if (endElement.ownerDocument !== self.dom.doc) {
					endElement = self.dom.getRoot();
				}

				if (endElement && endElement.nodeName == 'BODY') {
					return endElement.lastChild || endElement;
				}

				return endElement;
			} else {
				endElement = rng.endContainer;
				endOffset = rng.endOffset;

				if (endElement.nodeType == 1 && endElement.hasChildNodes()) {
					endElement = endElement.childNodes[endOffset > 0 ? endOffset - 1 : endOffset];
				}

				if (endElement && endElement.nodeType == 3) {
					return endElement.parentNode;
				}

				return endElement;
			}
		},

		/**
		 * Returns a bookmark location for the current selection. This bookmark object
		 * can then be used to restore the selection after some content modification to the document.
		 *
		 * @method getBookmark
		 * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
		 * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
		 * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinymce.activeEditor.selection.getBookmark();
		 *
		 * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinymce.activeEditor.selection.moveToBookmark(bm);
		 */
		getBookmark: function(type, normalized) {
			var self = this, dom = self.dom, rng, rng2, id, collapsed, name, element, chr = '&#xFEFF;', styles;

			function findIndex(name, element) {
				var index = 0;

				each(dom.select(name), function(node, i) {
					if (node == element) {
						index = i;
					}
				});

				return index;
			}

			function normalizeTableCellSelection(rng) {
				function moveEndPoint(start) {
					var container, offset, childNodes, prefix = start ? 'start' : 'end';

					container = rng[prefix + 'Container'];
					offset = rng[prefix + 'Offset'];

					if (container.nodeType == 1 && container.nodeName == "TR") {
						childNodes = container.childNodes;
						container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
						if (container) {
							offset = start ? 0 : container.childNodes.length;
							rng['set' + (start ? 'Start' : 'End')](container, offset);
						}
					}
				}

				moveEndPoint(true);
				moveEndPoint();

				return rng;
			}

			function getLocation() {
				var rng = self.getRng(true), root = dom.getRoot(), bookmark = {};

				function getPoint(rng, start) {
					var container = rng[start ? 'startContainer' : 'endContainer'],
						offset = rng[start ? 'startOffset' : 'endOffset'], point = [], node, childNodes, after = 0;

					if (container.nodeType == 3) {
						if (normalized) {
							for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling) {
								offset += node.nodeValue.length;
							}
						}

						point.push(offset);
					} else {
						childNodes = container.childNodes;

						if (offset >= childNodes.length && childNodes.length) {
							after = 1;
							offset = Math.max(0, childNodes.length - 1);
						}

						point.push(self.dom.nodeIndex(childNodes[offset], normalized) + after);
					}

					for (; container && container != root; container = container.parentNode) {
						point.push(self.dom.nodeIndex(container, normalized));
					}

					return point;
				}

				bookmark.start = getPoint(rng, true);

				if (!self.isCollapsed()) {
					bookmark.end = getPoint(rng);
				}

				return bookmark;
			}

			if (type == 2) {
				element = self.getNode();
				name = element ? element.nodeName : null;

				if (name == 'IMG') {
					return {name: name, index: findIndex(name, element)};
				}

				if (self.tridentSel) {
					return self.tridentSel.getBookmark(type);
				}

				return getLocation();
			}

			// Handle simple range
			if (type) {
				return {rng: self.getRng()};
			}

			rng = self.getRng();
			id = dom.uniqueId();
			collapsed = self.isCollapsed();
			styles = 'overflow:hidden;line-height:0px';

			// Explorer method
			if (rng.duplicate || rng.item) {
				// Text selection
				if (!rng.item) {
					rng2 = rng.duplicate();

					try {
						// Insert start marker
						rng.collapse();
						rng.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

						// Insert end marker
						if (!collapsed) {
							rng2.collapse(false);

							// Detect the empty space after block elements in IE and move the
							// end back one character <p></p>] becomes <p>]</p>
							rng.moveToElementText(rng2.parentElement());
							if (rng.compareEndPoints('StartToEnd', rng2) === 0) {
								rng2.move('character', -1);
							}

							rng2.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
						}
					} catch (ex) {
						// IE might throw unspecified error so lets ignore it
						return null;
					}
				} else {
					// Control selection
					element = rng.item(0);
					name = element.nodeName;

					return {name: name, index: findIndex(name, element)};
				}
			} else {
				element = self.getNode();
				name = element.nodeName;
				if (name == 'IMG') {
					return {name: name, index: findIndex(name, element)};
				}

				// W3C method
				rng2 = normalizeTableCellSelection(rng.cloneRange());

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {'data-mce-type': "bookmark", id: id + '_end', style: styles}, chr));
				}

				rng = normalizeTableCellSelection(rng);
				rng.collapse(true);
				rng.insertNode(dom.create('span', {'data-mce-type': "bookmark", id: id + '_start', style: styles}, chr));
			}

			self.moveToBookmark({id: id, keep: 1});

			return {id: id};
		},

		/**
		 * Restores the selection to the specified bookmark.
		 *
		 * @method moveToBookmark
		 * @param {Object} bookmark Bookmark to restore selection from.
		 * @return {Boolean} true/false if it was successful or not.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinymce.activeEditor.selection.getBookmark();
		 *
		 * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinymce.activeEditor.selection.moveToBookmark(bm);
		 */
		moveToBookmark: function(bookmark) {
			var self = this, dom = self.dom, rng, root, startContainer, endContainer, startOffset, endOffset;

			function setEndPoint(start) {
				var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

				if (point) {
					offset = point[0];

					// Find container node
					for (node = root, i = point.length - 1; i >= 1; i--) {
						children = node.childNodes;

						if (point[i] > children.length - 1) {
							return;
						}

						node = children[point[i]];
					}

					// Move text offset to best suitable location
					if (node.nodeType === 3) {
						offset = Math.min(point[0], node.nodeValue.length);
					}

					// Move element offset to best suitable location
					if (node.nodeType === 1) {
						offset = Math.min(point[0], node.childNodes.length);
					}

					// Set offset within container node
					if (start) {
						rng.setStart(node, offset);
					} else {
						rng.setEnd(node, offset);
					}
				}

				return true;
			}

			function restoreEndPoint(suffix) {
				var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

				if (marker) {
					node = marker.parentNode;

					if (suffix == 'start') {
						if (!keep) {
							idx = dom.nodeIndex(marker);
						} else {
							node = marker.firstChild;
							idx = 1;
						}

						startContainer = endContainer = node;
						startOffset = endOffset = idx;
					} else {
						if (!keep) {
							idx = dom.nodeIndex(marker);
						} else {
							node = marker.firstChild;
							idx = 1;
						}

						endContainer = node;
						endOffset = idx;
					}

					if (!keep) {
						prev = marker.previousSibling;
						next = marker.nextSibling;

						// Remove all marker text nodes
						each(grep(marker.childNodes), function(node) {
							if (node.nodeType == 3) {
								node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
							}
						});

						// Remove marker but keep children if for example contents where inserted into the marker
						// Also remove duplicated instances of the marker for example by a
						// split operation or by WebKit auto split on paste feature
						while ((marker = dom.get(bookmark.id + '_' + suffix))) {
							dom.remove(marker, 1);
						}

						// If siblings are text nodes then merge them unless it's Opera since it some how removes the node
						// and we are sniffing since adding a lot of detection code for a browser with 3% of the market
						// isn't worth the effort. Sorry, Opera but it's just a fact
						if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !isOpera) {
							idx = prev.nodeValue.length;
							prev.appendData(next.nodeValue);
							dom.remove(next);

							if (suffix == 'start') {
								startContainer = endContainer = prev;
								startOffset = endOffset = idx;
							} else {
								endContainer = prev;
								endOffset = idx;
							}
						}
					}
				}
			}

			function addBogus(node) {
				// Adds a bogus BR element for empty block elements
				if (dom.isBlock(node) && !node.innerHTML && !isIE) {
					node.innerHTML = '<br data-mce-bogus="1" />';
				}

				return node;
			}

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					root = dom.getRoot();

					if (self.tridentSel) {
						return self.tridentSel.moveToBookmark(bookmark);
					}

					if (setEndPoint(true) && setEndPoint()) {
						self.setRng(rng);
					}
				} else if (bookmark.id) {
					// Restore start/end points
					restoreEndPoint('start');
					restoreEndPoint('end');

					if (startContainer) {
						rng = dom.createRng();
						rng.setStart(addBogus(startContainer), startOffset);
						rng.setEnd(addBogus(endContainer), endOffset);
						self.setRng(rng);
					}
				} else if (bookmark.name) {
					self.select(dom.select(bookmark.name)[bookmark.index]);
				} else if (bookmark.rng) {
					self.setRng(bookmark.rng);
				}
			}
		},

		/**
		 * Selects the specified element. This will place the start and end of the selection range around the element.
		 *
		 * @method select
		 * @param {Element} node HMTL DOM element to select.
		 * @param {Boolean} content Optional bool state if the contents should be selected or not on non IE browser.
		 * @return {Element} Selected element the same element as the one that got passed in.
		 * @example
		 * // Select the first paragraph in the active editor
		 * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
		 */
		select: function(node, content) {
			var self = this, dom = self.dom, rng = dom.createRng(), idx;

			// Clear stored range set by FocusManager
			self.lastFocusBookmark = null;

			if (node) {
				if (!content && self.controlSelection.controlSelect(node)) {
					return;
				}

				idx = dom.nodeIndex(node);
				rng.setStart(node.parentNode, idx);
				rng.setEnd(node.parentNode, idx + 1);

				// Find first/last text node or BR element
				if (content) {
					self._moveEndPoint(rng, node, true);
					self._moveEndPoint(rng, node);
				}

				self.setRng(rng);
			}

			return node;
		},

		/**
		 * Returns true/false if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 *
		 * @method isCollapsed
		 * @return {Boolean} true/false state if the selection range is collapsed or not.
		 * Collapsed means if it's a caret or a larger selection.
		 */
		isCollapsed: function() {
			var self = this, rng = self.getRng(), sel = self.getSel();

			if (!rng || rng.item) {
				return false;
			}

			if (rng.compareEndPoints) {
				return rng.compareEndPoints('StartToEnd', rng) === 0;
			}

			return !sel || rng.collapsed;
		},

		/**
		 * Collapse the selection to start or end of range.
		 *
		 * @method collapse
		 * @param {Boolean} to_start Optional boolean state if to collapse to end or not. Defaults to start.
		 */
		collapse: function(to_start) {
			var self = this, rng = self.getRng(), node;

			// Control range on IE
			if (rng.item) {
				node = rng.item(0);
				rng = self.win.document.body.createTextRange();
				rng.moveToElementText(node);
			}

			rng.collapse(!!to_start);
			self.setRng(rng);
		},

		/**
		 * Returns the browsers internal selection object.
		 *
		 * @method getSel
		 * @return {Selection} Internal browser selection object.
		 */
		getSel: function() {
			var win = this.win;

			return win.getSelection ? win.getSelection() : win.document.selection;
		},

		/**
		 * Returns the browsers internal range object.
		 *
		 * @method getRng
		 * @param {Boolean} w3c Forces a compatible W3C range on IE.
		 * @return {Range} Internal browser range object.
		 * @see http://www.quirksmode.org/dom/range_intro.html
		 * @see http://www.dotvoid.com/2001/03/using-the-range-object-in-mozilla/
		 */
		getRng: function(w3c) {
			var self = this, selection, rng, elm, doc = self.win.document, ieRng;

			function tryCompareBounderyPoints(how, sourceRange, destinationRange) {
				try {
					return sourceRange.compareBoundaryPoints(how, destinationRange);
				} catch (ex) {
					// Gecko throws wrong document exception if the range points
					// to nodes that where removed from the dom #6690
					// Browsers should mutate existing DOMRange instances so that they always point
					// to something in the document this is not the case in Gecko works fine in IE/WebKit/Blink
					// For performance reasons just return -1
					return -1;
				}
			}

			// Use last rng passed from FocusManager if it's available this enables
			// calls to editor.selection.getStart() to work when caret focus is lost on IE
			if (!w3c && self.lastFocusBookmark) {
				var bookmark = self.lastFocusBookmark;

				// Convert bookmark to range IE 11 fix
				if (bookmark.startContainer) {
					rng = doc.createRange();
					rng.setStart(bookmark.startContainer, bookmark.startOffset);
					rng.setEnd(bookmark.endContainer, bookmark.endOffset);
				} else {
					rng = bookmark;
				}

				return rng;
			}

			// Found tridentSel object then we need to use that one
			if (w3c && self.tridentSel) {
				return self.tridentSel.getRangeAt(0);
			}

			try {
				if ((selection = self.getSel())) {
					if (selection.rangeCount > 0) {
						rng = selection.getRangeAt(0);
					} else {
						rng = selection.createRange ? selection.createRange() : doc.createRange();
					}
				}
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// We have W3C ranges and it's IE then fake control selection since IE9 doesn't handle that correctly yet
			// IE 11 doesn't support the selection object so we check for that as well
			if (isIE && rng && rng.setStart && doc.selection) {
				try {
					// IE will sometimes throw an exception here
					ieRng = doc.selection.createRange();
				} catch (ex) {

				}

				if (ieRng && ieRng.item) {
					elm = ieRng.item(0);
					rng = doc.createRange();
					rng.setStartBefore(elm);
					rng.setEndAfter(elm);
				}
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!rng) {
				rng = doc.createRange ? doc.createRange() : doc.body.createTextRange();
			}

			// If range is at start of document then move it to start of body
			if (rng.setStart && rng.startContainer.nodeType === 9 && rng.collapsed) {
				elm = self.dom.getRoot();
				rng.setStart(elm, 0);
				rng.setEnd(elm, 0);
			}

			if (self.selectedRange && self.explicitRange) {
				if (tryCompareBounderyPoints(rng.START_TO_START, rng, self.selectedRange) === 0 &&
					tryCompareBounderyPoints(rng.END_TO_END, rng, self.selectedRange) === 0) {
					// Safari, Opera and Chrome only ever select text which causes the range to change.
					// This lets us use the originally set range if the selection hasn't been changed by the user.
					rng = self.explicitRange;
				} else {
					self.selectedRange = null;
					self.explicitRange = null;
				}
			}

			return rng;
		},

		/**
		 * Changes the selection to the specified DOM range.
		 *
		 * @method setRng
		 * @param {Range} rng Range to select.
		 */
		setRng: function(rng, forward) {
			var self = this, sel;

			// Is IE specific range
			if (rng.select) {
				try {
					rng.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}

				return;
			}

			if (!self.tridentSel) {
				sel = self.getSel();

				if (sel) {
					self.explicitRange = rng;

					try {
						sel.removeAllRanges();
						sel.addRange(rng);
					} catch (ex) {
						// IE might throw errors here if the editor is within a hidden container and selection is changed
					}

					// Forward is set to false and we have an extend function
					if (forward === false && sel.extend) {
						sel.collapse(rng.endContainer, rng.endOffset);
						sel.extend(rng.startContainer, rng.startOffset);
					}

					// adding range isn't always successful so we need to check range count otherwise an exception can occur
					self.selectedRange = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
				}
			} else {
				// Is W3C Range fake range on IE
				if (rng.cloneRange) {
					try {
						self.tridentSel.addRange(rng);
						return;
					} catch (ex) {
						//IE9 throws an error here if called before selection is placed in the editor
					}
				}
			}
		},

		/**
		 * Sets the current selection to the specified DOM element.
		 *
		 * @method setNode
		 * @param {Element} elm Element to set as the contents of the selection.
		 * @return {Element} Returns the element that got passed in.
		 * @example
		 * // Inserts a DOM node at current selection/caret location
		 * tinymce.activeEditor.selection.setNode(tinymce.activeEditor.dom.create('img', {src: 'some.gif', title: 'some title'}));
		 */
		setNode: function(elm) {
			var self = this;

			self.setContent(self.dom.getOuterHTML(elm));

			return elm;
		},

		/**
		 * Returns the currently selected element or the common ancestor element for both start and end of the selection.
		 *
		 * @method getNode
		 * @return {Element} Currently selected element or common ancestor element.
		 * @example
		 * // Alerts the currently selected elements node name
		 * alert(tinymce.activeEditor.selection.getNode().nodeName);
		 */
		getNode: function() {
			var self = this, rng = self.getRng(), elm;
			var startContainer = rng.startContainer, endContainer = rng.endContainer;
			var startOffset = rng.startOffset, endOffset = rng.endOffset, root = self.dom.getRoot();

			function skipEmptyTextNodes(node, forwards) {
				var orig = node;

				while (node && node.nodeType === 3 && node.length === 0) {
					node = forwards ? node.nextSibling : node.previousSibling;
				}

				return node || orig;
			}

			// Range maybe lost after the editor is made visible again
			if (!rng) {
				return root;
			}

			if (rng.setStart) {
				elm = rng.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!rng.collapsed) {
					if (startContainer == endContainer) {
						if (endOffset - startOffset < 2) {
							if (startContainer.hasChildNodes()) {
								elm = startContainer.childNodes[startOffset];
							}
						}
					}

					// If the anchor node is a element instead of a text node then return this element
					//if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1)
					//	return sel.anchorNode.childNodes[sel.anchorOffset];

					// Handle cases where the selection is immediately wrapped around a node and return that node instead of it's parent.
					// This happens when you double click an underlined word in FireFox.
					if (startContainer.nodeType === 3 && endContainer.nodeType === 3) {
						if (startContainer.length === startOffset) {
							startContainer = skipEmptyTextNodes(startContainer.nextSibling, true);
						} else {
							startContainer = startContainer.parentNode;
						}

						if (endOffset === 0) {
							endContainer = skipEmptyTextNodes(endContainer.previousSibling, false);
						} else {
							endContainer = endContainer.parentNode;
						}

						if (startContainer && startContainer === endContainer) {
							return startContainer;
						}
					}
				}

				if (elm && elm.nodeType == 3) {
					return elm.parentNode;
				}

				return elm;
			}

			elm = rng.item ? rng.item(0) : rng.parentElement();

			// IE 7 might return elements outside the iframe
			if (elm.ownerDocument !== self.win.document) {
				elm = root;
			}

			return elm;
		},

		getSelectedBlocks: function(startElm, endElm) {
			var self = this, dom = self.dom, node, root, selectedBlocks = [];

			root = dom.getRoot();
			startElm = dom.getParent(startElm || self.getStart(), dom.isBlock);
			endElm = dom.getParent(endElm || self.getEnd(), dom.isBlock);

			if (startElm && startElm != root) {
				selectedBlocks.push(startElm);
			}

			if (startElm && endElm && startElm != endElm) {
				node = startElm;

				var walker = new TreeWalker(startElm, root);
				while ((node = walker.next()) && node != endElm) {
					if (dom.isBlock(node)) {
						selectedBlocks.push(node);
					}
				}
			}

			if (endElm && startElm != endElm && endElm != root) {
				selectedBlocks.push(endElm);
			}

			return selectedBlocks;
		},

		isForward: function() {
			var dom = this.dom, sel = this.getSel(), anchorRange, focusRange;

			// No support for selection direction then always return true
			if (!sel || !sel.anchorNode || !sel.focusNode) {
				return true;
			}

			anchorRange = dom.createRng();
			anchorRange.setStart(sel.anchorNode, sel.anchorOffset);
			anchorRange.collapse(true);

			focusRange = dom.createRng();
			focusRange.setStart(sel.focusNode, sel.focusOffset);
			focusRange.collapse(true);

			return anchorRange.compareBoundaryPoints(anchorRange.START_TO_START, focusRange) <= 0;
		},

		normalize: function() {
			var self = this, rng = self.getRng();

			if (!isIE && new RangeUtils(self.dom).normalize(rng)) {
				self.setRng(rng, self.isForward());
			}

			return rng;
		},

		/**
		 * Executes callback of the current selection matches the specified selector or not and passes the state and args to the callback.
		 *
		 * @method selectorChanged
		 * @param {String} selector CSS selector to check for.
		 * @param {function} callback Callback with state and args when the selector is matches or not.
		 */
		selectorChanged: function(selector, callback) {
			var self = this, currentSelectors;

			if (!self.selectorChangedData) {
				self.selectorChangedData = {};
				currentSelectors = {};

				self.editor.on('NodeChange', function(e) {
					var node = e.element, dom = self.dom, parents = dom.getParents(node, null, dom.getRoot()), matchedSelectors = {};

					// Check for new matching selectors
					each(self.selectorChangedData, function(callbacks, selector) {
						each(parents, function(node) {
							if (dom.is(node, selector)) {
								if (!currentSelectors[selector]) {
									// Execute callbacks
									each(callbacks, function(callback) {
										callback(true, {node: node, selector: selector, parents: parents});
									});

									currentSelectors[selector] = callbacks;
								}

								matchedSelectors[selector] = callbacks;
								return false;
							}
						});
					});

					// Check if current selectors still match
					each(currentSelectors, function(callbacks, selector) {
						if (!matchedSelectors[selector]) {
							delete currentSelectors[selector];

							each(callbacks, function(callback) {
								callback(false, {node: node, selector: selector, parents: parents});
							});
						}
					});
				});
			}

			// Add selector listeners
			if (!self.selectorChangedData[selector]) {
				self.selectorChangedData[selector] = [];
			}

			self.selectorChangedData[selector].push(callback);

			return self;
		},

		getScrollContainer: function() {
			var scrollContainer, node = this.dom.getRoot();

			while (node && node.nodeName != 'BODY') {
				if (node.scrollHeight > node.clientHeight) {
					scrollContainer = node;
					break;
				}

				node = node.parentNode;
			}

			return scrollContainer;
		},

		scrollIntoView: function(elm) {
			var y, viewPort, self = this, dom = self.dom, root = dom.getRoot(), viewPortY, viewPortH;

			function getPos(elm) {
				var x = 0, y = 0;

				var offsetParent = elm;
				while (offsetParent && offsetParent.nodeType) {
					x += offsetParent.offsetLeft || 0;
					y += offsetParent.offsetTop || 0;
					offsetParent = offsetParent.offsetParent;
				}

				return {x: x, y: y};
			}

			if (root.nodeName != 'BODY') {
				var scrollContainer = self.getScrollContainer();
				if (scrollContainer) {
					y = getPos(elm).y - getPos(scrollContainer).y;
					viewPortH = scrollContainer.clientHeight;
					viewPortY = scrollContainer.scrollTop;
					if (y < viewPortY || y + 25 > viewPortY + viewPortH) {
						scrollContainer.scrollTop = y < viewPortY ? y : y - viewPortH + 25;
					}

					return;
				}
			}

			viewPort = dom.getViewPort(self.editor.getWin());
			y = dom.getPos(elm).y;
			viewPortY = viewPort.y;
			viewPortH = viewPort.h;
			if (y < viewPort.y || y + 25 > viewPortY + viewPortH) {
				self.editor.getWin().scrollTo(0, y < viewPortY ? y : y - viewPortH + 25);
			}
		},

		_moveEndPoint: function(rng, node, start) {
			var root = node, walker = new TreeWalker(node, root);
			var nonEmptyElementsMap = this.dom.schema.getNonEmptyElements();

			do {
				// Text node
				if (node.nodeType == 3 && trim(node.nodeValue).length !== 0) {
					if (start) {
						rng.setStart(node, 0);
					} else {
						rng.setEnd(node, node.nodeValue.length);
					}

					return;
				}

				// BR/IMG/INPUT elements
				if (nonEmptyElementsMap[node.nodeName]) {
					if (start) {
						rng.setStartBefore(node);
					} else {
						if (node.nodeName == 'BR') {
							rng.setEndBefore(node);
						} else {
							rng.setEndAfter(node);
						}
					}

					return;
				}

				// Found empty text block old IE can place the selection inside those
				if (Env.ie && Env.ie < 11 && this.dom.isBlock(node) && this.dom.isEmpty(node)) {
					if (start) {
						rng.setStart(node, 0);
					} else {
						rng.setEnd(node, 0);
					}

					return;
				}
			} while ((node = (start ? walker.next() : walker.prev())));

			// Failed to find any text node or other suitable location then move to the root of body
			if (root.nodeName == 'BODY') {
				if (start) {
					rng.setStart(root, 0);
				} else {
					rng.setEnd(root, root.childNodes.length);
				}
			}
		},

		destroy: function() {
			this.win = null;
			this.controlSelection.destroy();
		}
	};

	return Selection;
});
