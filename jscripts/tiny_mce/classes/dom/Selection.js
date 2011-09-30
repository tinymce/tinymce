/**
 * Selection.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	function trimNl(s) {
		return s.replace(/[\n\r]+/g, '');
	};

	// Shorten names
	var is = tinymce.is, isIE = tinymce.isIE, each = tinymce.each;

	/**
	 * This class handles text and control selection it's an crossbrowser utility class.
	 * Consult the TinyMCE Wiki API for more details and examples on how to use this class.
	 *
	 * @class tinymce.dom.Selection
	 * @example
	 * // Getting the currently selected node for the active editor
	 * alert(tinymce.activeEditor.selection.getNode().nodeName);
	 */
	tinymce.create('tinymce.dom.Selection', {
		/**
		 * Constructs a new selection instance.
		 *
		 * @constructor
		 * @method Selection
		 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
		 * @param {Window} win Window to bind the selection object to.
		 * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
		 */
		Selection : function(dom, win, serializer) {
			var t = this;

			t.dom = dom;
			t.win = win;
			t.serializer = serializer;

			// Add events
			each([
				/**
				 * This event gets executed before contents is extracted from the selection.
				 *
				 * @event onBeforeSetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be returned. 
				 */
				'onBeforeSetContent',

				/**
				 * This event gets executed before contents is inserted into selection. 
				 *
				 * @event onBeforeGetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be inserted. 
				 */
				'onBeforeGetContent',

				/**
				 * This event gets executed when contents is inserted into selection.
				 *
				 * @event onSetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be inserted. 
				 */
				'onSetContent',

				/**
				 * This event gets executed when contents is extracted from the selection.
				 *
				 * @event onGetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be returned. 
				 */
				'onGetContent'
			], function(e) {
				t[e] = new tinymce.util.Dispatcher(t);
			});

			// No W3C Range support
			if (!t.win.getSelection)
				t.tridentSel = new tinymce.dom.TridentSelection(t);

			if (tinymce.isIE && dom.boxModel)
				this._fixIESelection();

			// Prevent leaks
			tinymce.addUnload(t.destroy, t);
		},

		/**
		 * Move the selection cursor range to the specified node and offset.
		 * @param node Node to put the cursor in.
		 * @param offset Offset from the start of the node to put the cursor at.
		 */
		setCursorLocation: function(node, offset) {
			var t = this; var r = t.dom.createRng();
			r.setStart(node, offset);
			r.setEnd(node, offset);
			t.setRng(r);
			t.collapse(false);
		},
		/**
		 * Returns the selected contents using the DOM serializer passed in to this class.
		 *
		 * @method getContent
		 * @param {Object} s Optional settings class with for example output format text or html.
		 * @return {String} Selected contents in for example HTML format.
		 * @example
		 * // Alerts the currently selected contents
		 * alert(tinyMCE.activeEditor.selection.getContent());
		 * 
		 * // Alerts the currently selected contents as plain text
		 * alert(tinyMCE.activeEditor.selection.getContent({format : 'text'}));
		 */
		getContent : function(s) {
			var t = this, r = t.getRng(), e = t.dom.create("body"), se = t.getSel(), wb, wa, n;

			s = s || {};
			wb = wa = '';
			s.get = true;
			s.format = s.format || 'html';
			s.forced_root_block = '';
			t.onBeforeGetContent.dispatch(t, s);

			if (s.format == 'text')
				return t.isCollapsed() ? '' : (r.text || (se.toString ? se.toString() : ''));

			if (r.cloneContents) {
				n = r.cloneContents();

				if (n)
					e.appendChild(n);
			} else if (is(r.item) || is(r.htmlText)) {
				// IE will produce invalid markup if elements are present that
				// it doesn't understand like custom elements or HTML5 elements.
				// Adding a BR in front of the contents and then remoiving it seems to fix it though.
				e.innerHTML = '<br>' + (r.item ? r.item(0).outerHTML : r.htmlText);
				e.removeChild(e.firstChild);
			} else
				e.innerHTML = r.toString();

			// Keep whitespace before and after
			if (/^\s/.test(e.innerHTML))
				wb = ' ';

			if (/\s+$/.test(e.innerHTML))
				wa = ' ';

			s.getInner = true;

			s.content = t.isCollapsed() ? '' : wb + t.serializer.serialize(e, s) + wa;
			t.onGetContent.dispatch(t, s);

			return s.content;
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
		 * tinyMCE.activeEditor.selection.setContent('<strong>Some contents</strong>');
		 */
		setContent : function(content, args) {
			var self = this, rng = self.getRng(), caretNode, doc = self.win.document, frag, temp;

			args = args || {format : 'html'};
			args.set = true;
			content = args.content = content;

			// Dispatch before set content event
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

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

					if (doc.body.childNodes.length == 0) {
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
				} else
					rng.pasteHTML(content);
			}

			// Dispatch set content event
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);
		},

		/**
		 * Returns the start element of a selection range. If the start is in a text
		 * node the parent element will be returned.
		 *
		 * @method getStart
		 * @return {Element} Start element of selection range.
		 */
		getStart : function() {
			var rng = this.getRng(), startElement, parentElement, checkRng, node;

			if (rng.duplicate || rng.item) {
				// Control selection, return first item
				if (rng.item)
					return rng.item(0);

				// Get start element
				checkRng = rng.duplicate();
				checkRng.collapse(1);
				startElement = checkRng.parentElement();

				// Check if range parent is inside the start element, then return the inner parent element
				// This will fix issues when a single element is selected, IE would otherwise return the wrong start element
				parentElement = node = rng.parentElement();
				while (node = node.parentNode) {
					if (node == startElement) {
						startElement = parentElement;
						break;
					}
				}

				return startElement;
			} else {
				startElement = rng.startContainer;

				if (startElement.nodeType == 1 && startElement.hasChildNodes())
					startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];

				if (startElement && startElement.nodeType == 3)
					return startElement.parentNode;

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
		getEnd : function() {
			var t = this, r = t.getRng(), e, eo;

			if (r.duplicate || r.item) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(0);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.lastChild || e;

				return e;
			} else {
				e = r.endContainer;
				eo = r.endOffset;

				if (e.nodeType == 1 && e.hasChildNodes())
					e = e.childNodes[eo > 0 ? eo - 1 : eo];

				if (e && e.nodeType == 3)
					return e.parentNode;

				return e;
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
		 * var bm = tinyMCE.activeEditor.selection.getBookmark();
		 * 
		 * tinyMCE.activeEditor.setContent(tinyMCE.activeEditor.getContent() + 'Some new content');
		 * 
		 * // Restore the selection bookmark
		 * tinyMCE.activeEditor.selection.moveToBookmark(bm);
		 */
		getBookmark : function(type, normalized) {
			var t = this, dom = t.dom, rng, rng2, id, collapsed, name, element, index, chr = '\uFEFF', styles;

			function findIndex(name, element) {
				var index = 0;

				each(dom.select(name), function(node, i) {
					if (node == element)
						index = i;
				});

				return index;
			};

			if (type == 2) {
				function getLocation() {
					var rng = t.getRng(true), root = dom.getRoot(), bookmark = {};

					function getPoint(rng, start) {
						var container = rng[start ? 'startContainer' : 'endContainer'],
							offset = rng[start ? 'startOffset' : 'endOffset'], point = [], node, childNodes, after = 0;

						if (container.nodeType == 3) {
							if (normalized) {
								for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling)
									offset += node.nodeValue.length;
							}

							point.push(offset);
						} else {
							childNodes = container.childNodes;

							if (offset >= childNodes.length && childNodes.length) {
								after = 1;
								offset = Math.max(0, childNodes.length - 1);
							}

							point.push(t.dom.nodeIndex(childNodes[offset], normalized) + after);
						}

						for (; container && container != root; container = container.parentNode)
							point.push(t.dom.nodeIndex(container, normalized));

						return point;
					};

					bookmark.start = getPoint(rng, true);

					if (!t.isCollapsed())
						bookmark.end = getPoint(rng);

					return bookmark;
				};

				if (t.tridentSel)
					return t.tridentSel.getBookmark(type);

				return getLocation();
			}

			// Handle simple range
			if (type)
				return {rng : t.getRng()};

			rng = t.getRng();
			id = dom.uniqueId();
			collapsed = tinyMCE.activeEditor.selection.isCollapsed();
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

							// Detect the empty space after block elements in IE and move the end back one character <p></p>] becomes <p>]</p>
							rng.moveToElementText(rng2.parentElement());
							if (rng.compareEndPoints('StartToEnd', rng2) == 0)
								rng2.move('character', -1);

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

					return {name : name, index : findIndex(name, element)};
				}
			} else {
				element = t.getNode();
				name = element.nodeName;
				if (name == 'IMG')
					return {name : name, index : findIndex(name, element)};

				// W3C method
				rng2 = rng.cloneRange();

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {'data-mce-type' : "bookmark", id : id + '_end', style : styles}, chr));
				}

				rng.collapse(true);
				rng.insertNode(dom.create('span', {'data-mce-type' : "bookmark", id : id + '_start', style : styles}, chr));
			}

			t.moveToBookmark({id : id, keep : 1});

			return {id : id};
		},

		/**
		 * Restores the selection to the specified bookmark.
		 *
		 * @method moveToBookmark
		 * @param {Object} bookmark Bookmark to restore selection from.
		 * @return {Boolean} true/false if it was successful or not.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinyMCE.activeEditor.selection.getBookmark();
		 * 
		 * tinyMCE.activeEditor.setContent(tinyMCE.activeEditor.getContent() + 'Some new content');
		 * 
		 * // Restore the selection bookmark
		 * tinyMCE.activeEditor.selection.moveToBookmark(bm);
		 */
		moveToBookmark : function(bookmark) {
			var t = this, dom = t.dom, marker1, marker2, rng, root, startContainer, endContainer, startOffset, endOffset;

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					root = dom.getRoot();

					function setEndPoint(start) {
						var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

						if (point) {
							offset = point[0];

							// Find container node
							for (node = root, i = point.length - 1; i >= 1; i--) {
								children = node.childNodes;

								if (point[i] > children.length - 1)
									return;

								node = children[point[i]];
							}

							// Move text offset to best suitable location
							if (node.nodeType === 3)
								offset = Math.min(point[0], node.nodeValue.length);

							// Move element offset to best suitable location
							if (node.nodeType === 1)
								offset = Math.min(point[0], node.childNodes.length);

							// Set offset within container node
							if (start)
								rng.setStart(node, offset);
							else
								rng.setEnd(node, offset);
						}

						return true;
					};

					if (t.tridentSel)
						return t.tridentSel.moveToBookmark(bookmark);

					if (setEndPoint(true) && setEndPoint()) {
						t.setRng(rng);
					}
				} else if (bookmark.id) {
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
								each(tinymce.grep(marker.childNodes), function(node) {
									if (node.nodeType == 3)
										node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
								});

								// Remove marker but keep children if for example contents where inserted into the marker
								// Also remove duplicated instances of the marker for example by a split operation or by WebKit auto split on paste feature
								while (marker = dom.get(bookmark.id + '_' + suffix))
									dom.remove(marker, 1);

								// If siblings are text nodes then merge them unless it's Opera since it some how removes the node
								// and we are sniffing since adding a lot of detection code for a browser with 3% of the market isn't worth the effort. Sorry, Opera but it's just a fact
								if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !tinymce.isOpera) {
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
					};

					function addBogus(node) {
						// Adds a bogus BR element for empty block elements or just a space on IE since it renders BR elements incorrectly
						if (dom.isBlock(node) && !node.innerHTML)
							node.innerHTML = !isIE ? '<br data-mce-bogus="1" />' : ' ';

						return node;
					};

					// Restore start/end points
					restoreEndPoint('start');
					restoreEndPoint('end');

					if (startContainer) {
						rng = dom.createRng();
						rng.setStart(addBogus(startContainer), startOffset);
						rng.setEnd(addBogus(endContainer), endOffset);
						t.setRng(rng);
					}
				} else if (bookmark.name) {
					t.select(dom.select(bookmark.name)[bookmark.index]);
				} else if (bookmark.rng)
					t.setRng(bookmark.rng);
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
		 * tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
		 */
		select : function(node, content) {
			var t = this, dom = t.dom, rng = dom.createRng(), idx;

			if (node) {
				idx = dom.nodeIndex(node);
				rng.setStart(node.parentNode, idx);
				rng.setEnd(node.parentNode, idx + 1);

				// Find first/last text node or BR element
				if (content) {
					function setPoint(node, start) {
						var walker = new tinymce.dom.TreeWalker(node, node);

						do {
							// Text node
							if (node.nodeType == 3 && tinymce.trim(node.nodeValue).length != 0) {
								if (start)
									rng.setStart(node, 0);
								else
									rng.setEnd(node, node.nodeValue.length);

								return;
							}

							// BR element
							if (node.nodeName == 'BR') {
								if (start)
									rng.setStartBefore(node);
								else
									rng.setEndBefore(node);

								return;
							}
						} while (node = (start ? walker.next() : walker.prev()));
					};

					setPoint(node, 1);
					setPoint(node);
				}

				t.setRng(rng);
			}

			return node;
		},

		/**
		 * Returns true/false if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 *
		 * @method isCollapsed
		 * @return {Boolean} true/false state if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 */
		isCollapsed : function() {
			var t = this, r = t.getRng(), s = t.getSel();

			if (!r || r.item)
				return false;

			if (r.compareEndPoints)
				return r.compareEndPoints('StartToEnd', r) === 0;

			return !s || r.collapsed;
		},

		/**
		 * Collapse the selection to start or end of range.
		 *
		 * @method collapse
		 * @param {Boolean} to_start Optional boolean state if to collapse to end or not. Defaults to start.
		 */
		collapse : function(to_start) {
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
		getSel : function() {
			var t = this, w = this.win;

			return w.getSelection ? w.getSelection() : w.document.selection;
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
		getRng : function(w3c) {
			var t = this, s, r, elm, doc = t.win.document;

			// Found tridentSel object then we need to use that one
			if (w3c && t.tridentSel)
				return t.tridentSel.getRangeAt(0);

			try {
				if (s = t.getSel())
					r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : doc.createRange());
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// We have W3C ranges and it's IE then fake control selection since IE9 doesn't handle that correctly yet
			if (tinymce.isIE && r && r.setStart && doc.selection.createRange().item) {
				elm = doc.selection.createRange().item(0);
				r = doc.createRange();
				r.setStartBefore(elm);
				r.setEndAfter(elm);
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!r)
				r = doc.createRange ? doc.createRange() : doc.body.createTextRange();

			if (t.selectedRange && t.explicitRange) {
				if (r.compareBoundaryPoints(r.START_TO_START, t.selectedRange) === 0 && r.compareBoundaryPoints(r.END_TO_END, t.selectedRange) === 0) {
					// Safari, Opera and Chrome only ever select text which causes the range to change.
					// This lets us use the originally set range if the selection hasn't been changed by the user.
					r = t.explicitRange;
				} else {
					t.selectedRange = null;
					t.explicitRange = null;
				}
			}

			return r;
		},

		/**
		 * Changes the selection to the specified DOM range.
		 *
		 * @method setRng
		 * @param {Range} r Range to select.
		 */
		setRng : function(r) {
			var s, t = this;
			
			if (!t.tridentSel) {
				s = t.getSel();

				if (s) {
					t.explicitRange = r;

					try {
						s.removeAllRanges();
					} catch (ex) {
						// IE9 might throw errors here don't know why
					}

					s.addRange(r);
					t.selectedRange = s.getRangeAt(0);
				}
			} else {
				// Is W3C Range
				if (r.cloneRange) {
					t.tridentSel.addRange(r);
					return;
				}

				// Is IE specific range
				try {
					r.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}
			}
		},

		/**
		 * Sets the current selection to the specified DOM element.
		 *
		 * @method setNode
		 * @param {Element} n Element to set as the contents of the selection.
		 * @return {Element} Returns the element that got passed in.
		 * @example
		 * // Inserts a DOM node at current selection/caret location
		 * tinyMCE.activeEditor.selection.setNode(tinyMCE.activeEditor.dom.create('img', {src : 'some.gif', title : 'some title'}));
		 */
		setNode : function(n) {
			var t = this;

			t.setContent(t.dom.getOuterHTML(n));

			return n;
		},

		/**
		 * Returns the currently selected element or the common ancestor element for both start and end of the selection.
		 *
		 * @method getNode
		 * @return {Element} Currently selected element or common ancestor element.
		 * @example
		 * // Alerts the currently selected elements node name
		 * alert(tinyMCE.activeEditor.selection.getNode().nodeName);
		 */
		getNode : function() {
			var t = this, rng = t.getRng(), sel = t.getSel(), elm, start = rng.startContainer, end = rng.endContainer;

			// Range maybe lost after the editor is made visible again
			if (!rng)
				return t.dom.getRoot();

			if (rng.setStart) {
				elm = rng.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!rng.collapsed) {
					if (rng.startContainer == rng.endContainer) {
						if (rng.endOffset - rng.startOffset < 2) {
							if (rng.startContainer.hasChildNodes())
								elm = rng.startContainer.childNodes[rng.startOffset];
						}
					}

					// If the anchor node is a element instead of a text node then return this element
					//if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1) 
					//	return sel.anchorNode.childNodes[sel.anchorOffset];

					// Handle cases where the selection is immediately wrapped around a node and return that node instead of it's parent.
					// This happens when you double click an underlined word in FireFox.
					if (start.nodeType === 3 && end.nodeType === 3) {
						function skipEmptyTextNodes(n, forwards) {
							var orig = n;
							while (n && n.nodeType === 3 && n.length === 0) {
								n = forwards ? n.nextSibling : n.previousSibling;
							}
							return n || orig;
						}
						if (start.length === rng.startOffset) {
							start = skipEmptyTextNodes(start.nextSibling, true);
						} else {
							start = start.parentNode;
						}
						if (rng.endOffset === 0) {
							end = skipEmptyTextNodes(end.previousSibling, false);
						} else {
							end = end.parentNode;
						}

						if (start && start === end)
							return start;
					}
				}

				if (elm && elm.nodeType == 3)
					return elm.parentNode;

				return elm;
			}

			return rng.item ? rng.item(0) : rng.parentElement();
		},

		getSelectedBlocks : function(st, en) {
			var t = this, dom = t.dom, sb, eb, n, bl = [];

			sb = dom.getParent(st || t.getStart(), dom.isBlock);
			eb = dom.getParent(en || t.getEnd(), dom.isBlock);

			if (sb)
				bl.push(sb);

			if (sb && eb && sb != eb) {
				n = sb;

				var walker = new tinymce.dom.TreeWalker(sb, dom.getRoot());
				while ((n = walker.next()) && n != eb) {
					if (dom.isBlock(n))
						bl.push(n);
				}
			}

			if (eb && sb != eb)
				bl.push(eb);

			return bl;
		},

		normalize : function() {
			var self = this, rng, normalized;

			// Normalize only on non IE browsers for now
			if (tinymce.isIE)
				return;

			function normalizeEndPoint(start) {
				var container, offset, walker, dom = self.dom, body = dom.getRoot(), node;

				container = rng[(start ? 'start' : 'end') + 'Container'];
				offset = rng[(start ? 'start' : 'end') + 'Offset'];

				// If the container is a document move it to the body element
				if (container.nodeType === 9) {
					container = container.body;
					offset = 0;
				}

				// If the container is body try move it into the closest text node or position
				// TODO: Add more logic here to handle element selection cases
				if (container === body) {
					// Resolve the index
					if (container.hasChildNodes()) {
						container = container.childNodes[Math.min(!start && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1)];
						offset = 0;

						// Don't walk into elements that doesn't have any child nodes like a IMG
						if (container.hasChildNodes()) {
							// Walk the DOM to find a text node to place the caret at or a BR
							node = container;
							walker = new tinymce.dom.TreeWalker(container, body);
							do {
								// Found a text node use that position
								if (node.nodeType === 3) {
									offset = start ? 0 : node.nodeValue.length - 1;
									container = node;
									break;
								}

								// Found a BR element that we can place the caret before
								if (node.nodeName === 'BR') {
									offset = dom.nodeIndex(node);
									container = node.parentNode;
									break;
								}
							} while (node = (start ? walker.next() : walker.prev()));

							normalized = true;
						}
					}
				}

				// Set endpoint if it was normalized
				if (normalized)
					rng['set' + (start ? 'Start' : 'End')](container, offset);
			};

			rng = self.getRng();

			// Normalize the end points
			normalizeEndPoint(true);
			
			if (rng.collapsed)
				normalizeEndPoint();

			// Set the selection if it was normalized
			if (normalized) {
				//console.log(self.dom.dumpRng(rng));
				self.setRng(rng);
			}
		},

		destroy : function(s) {
			var t = this;

			t.win = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		// IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
		_fixIESelection : function() {
			var dom = this.dom, doc = dom.doc, body = doc.body, started, startRng, htmlElm;

			// Make HTML element unselectable since we are going to handle selection by hand
			doc.documentElement.unselectable = true;

			// Return range from point or null if it failed
			function rngFromPoint(x, y) {
				var rng = body.createTextRange();

				try {
					rng.moveToPoint(x, y);
				} catch (ex) {
					// IE sometimes throws and exception, so lets just ignore it
					rng = null;
				}

				return rng;
			};

			// Fires while the selection is changing
			function selectionChange(e) {
				var pointRng;

				// Check if the button is down or not
				if (e.button) {
					// Create range from mouse position
					pointRng = rngFromPoint(e.x, e.y);

					if (pointRng) {
						// Check if pointRange is before/after selection then change the endPoint
						if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
							pointRng.setEndPoint('StartToStart', startRng);
						else
							pointRng.setEndPoint('EndToEnd', startRng);

						pointRng.select();
					}
				} else
					endSelection();
			}

			// Removes listeners
			function endSelection() {
				var rng = doc.selection.createRange();

				// If the range is collapsed then use the last start range
				if (startRng && !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0)
					startRng.select();

				dom.unbind(doc, 'mouseup', endSelection);
				dom.unbind(doc, 'mousemove', selectionChange);
				startRng = started = 0;
			};

			// Detect when user selects outside BODY
			dom.bind(doc, ['mousedown', 'contextmenu'], function(e) {
				if (e.target.nodeName === 'HTML') {
					if (started)
						endSelection();

					// Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
					htmlElm = doc.documentElement;
					if (htmlElm.scrollHeight > htmlElm.clientHeight)
						return;

					started = 1;
					// Setup start position
					startRng = rngFromPoint(e.x, e.y);
					if (startRng) {
						// Listen for selection change events
						dom.bind(doc, 'mouseup', endSelection);
						dom.bind(doc, 'mousemove', selectionChange);

						dom.win.focus();
						startRng.select();
					}
				}
			});
		}
	});
})(tinymce);
