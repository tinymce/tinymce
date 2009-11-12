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
	 * @class tinymce.dom.Selection
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
				'onBeforeSetContent',
				'onBeforeGetContent',
				'onSetContent',
				'onGetContent'
			], function(e) {
				t[e] = new tinymce.util.Dispatcher(t);
			});

			// No W3C Range support
			if (!t.win.getSelection)
				t.tridentSel = new tinymce.dom.TridentSelection(t);

			// Prevent leaks
			tinymce.addUnload(t.destroy, t);
		},

		/**
		 * Returns the selected contents using the DOM serializer passed in to this class.
		 *
		 * @method getContent
		 * @param {Object} s Optional settings class with for example output format text or html.
		 * @return {String} Selected contents in for example HTML format.
		 */
		getContent : function(s) {
			var t = this, r = t.getRng(), e = t.dom.create("body"), se = t.getSel(), wb, wa, n;

			s = s || {};
			wb = wa = '';
			s.get = true;
			s.format = s.format || 'html';
			t.onBeforeGetContent.dispatch(t, s);

			if (s.format == 'text')
				return t.isCollapsed() ? '' : (r.text || (se.toString ? se.toString() : ''));

			if (r.cloneContents) {
				n = r.cloneContents();

				if (n)
					e.appendChild(n);
			} else if (is(r.item) || is(r.htmlText))
				e.innerHTML = r.item ? r.item(0).outerHTML : r.htmlText;
			else
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
		 * @param {String} h HTML contents to set could also be other formats depending on settings.
		 * @param {Object} s Optional settings object with for example data format.
		 */
		setContent : function(h, s) {
			var t = this, r = t.getRng(), c, d = t.win.document;

			s = s || {format : 'html'};
			s.set = true;
			h = s.content = t.dom.processHTML(h);

			// Dispatch before set content event
			t.onBeforeSetContent.dispatch(t, s);
			h = s.content;

			if (r.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				h += '<span id="__caret">_</span>';

				// Delete and insert new node
				r.deleteContents();
				r.insertNode(t.getRng().createContextualFragment(h));

				// Move to caret marker
				c = t.dom.get('__caret');

				// Make sure we wrap it compleatly, Opera fails with a simple select call
				r = d.createRange();
				r.setStartBefore(c);
				r.setEndBefore(c);
				t.setRng(r);

				// Remove the caret position
				t.dom.remove('__caret');
			} else {
				if (r.item) {
					// Delete content and get caret text selection
					d.execCommand('Delete', false, null);
					r = t.getRng();
				}

				r.pasteHTML(h);
			}

			// Dispatch set content event
			t.onSetContent.dispatch(t, s);
		},

		/**
		 * Returns the start element of a selection range. If the start is in a text
		 * node the parent element will be returned.
		 *
		 * @method getStart
		 * @return {Element} Start element of selection range.
		 */
		getStart : function() {
			var t = this, r = t.getRng(), e;

			if (isIE) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(1);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.firstChild;

				return e;
			} else {
				e = r.startContainer;

				if (e.nodeType == 1)
					e = e.childNodes[r.startOffset];

				if (e && e.nodeType == 3)
					return e.parentNode;

				return e;
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

			if (isIE) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(0);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.lastChild;

				return e;
			} else {
				e = r.endContainer;
				eo = r.endOffset;

				if (e.nodeType == 1)
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
		 * @param {Boolean} simple Optional state if the bookmark should be simple or not. Default is complex.
		 * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
		 */
		getBookmark : function(simple) {
			var t = this, dom = t.dom, rng, rng2, id, collapsed, name, element, index, chr = '\uFEFF', styles;

			if (simple == 2) {
				function getLocation() {
					var rng = t.getRng(true), root = dom.getRoot(), bookmark = {};

					function getPoint(rng, start) {
						var indexes = [], node, lastIdx,
							container = rng[start ? 'startContainer' : 'endContainer'],
							offset = rng[start ? 'startOffset' : 'endOffset'], exclude, point = {};

						// Resolve element index
						if (container.nodeType == 1) {
							lastIdx = container.childNodes.length - 1;
							container = container.childNodes[offset > lastIdx ? lastIdx : offset - (start ? 0 : 1)];

							point.exclude = (start && offset > lastIdx) || (!start && offset == 0);

							if (container.nodeType == 3)
								offset = start ? 0 : container.nodeValue.length;
						}

						if (container.nodeType == 3) {
							for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling)
								offset += node.nodeValue.length;

							point.offset = offset;
						}

						for (; container && container != root; container = container.parentNode)
							indexes.push(t.dom.nodeIndex(container, true));

						point.indexes = indexes;

						return point;
					};

					bookmark.start = getPoint(rng, true);

					if (!t.isCollapsed())
						bookmark.end = getPoint(rng);

					return bookmark;
				};

				return getLocation();
			}

			// Handle simple range
			if (simple)
				return {rng : t.getRng()};

			rng = t.getRng();
			id = dom.uniqueId();
			collapsed = tinyMCE.activeEditor.selection.isCollapsed();

			// Explorer method
			if (rng.duplicate || rng.item) {
				// Text selection
				if (!rng.item) {
					rng2 = rng.duplicate();
					styles = ' style="overflow:hidden;line-height:0px"';

					// Insert start marker
					rng.collapse();
					rng.pasteHTML('<span _mce_type="bookmark" id="' + id + '_start"' + styles + '>' + chr + '</span>');

					// Insert end marker
					if (!collapsed) {
						rng2.collapse(false);
						rng2.pasteHTML('<span _mce_type="bookmark" id="' + id + '_end"' + styles + '>' + chr + '</span>');
					}
				} else {
					// Control selection
					element = rng.item(0);
					name = element.nodeName;

					// Find element index
					each(dom.select(name), function(node, i) {
						if (node == element)
							index = i;
					});

					return {name : name, index : index};
				}
			} else {
				// W3C method
				rng2 = rng.cloneRange();

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {_mce_type : "bookmark", id : id + '_end', style : 'display:none'}, chr));
				}

				rng.collapse(true);
				rng.insertNode(dom.create('span', {_mce_type : "bookmark", id : id + '_start', style : 'display:none'}, chr));
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
		 */
		moveToBookmark : function(bookmark) {
			var t = this, dom = t.dom, marker1, marker2, rng;

			// Clear selection cache
			if (t.tridentSel)
				t.tridentSel.destroy();

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					var root = dom.getRoot();

					function setEndPoint(start) {
						var point = bookmark[start ? 'start' : 'end'], i, node, offset;

						if (point) {
							for (node = root, i = point.indexes.length - 1; i >= 0; i--)
								node = node.childNodes[point.indexes[i]];

							if (start) {
								if (point.offset)
									rng.setStart(node, point.offset);
								else {
									if (point.exclude)
										rng.setStartAfter(node);
									else
										rng.setStartBefore(node);
								}
							} else {
								if (point.offset)
									rng.setEnd(node, point.offset);
								else {
									if (point.exclude)
										rng.setEndBefore(node);
									else
										rng.setEndAfter(node);
								}
							}
						}
					};

					setEndPoint(true);
					setEndPoint();

					t.setRng(rng);
				} else if (bookmark.id) {
					rng = dom.createRng();

					function restoreEndPoint(suffix, child_name, sibling_name) {
						var marker = dom.get(bookmark.id + '_' + suffix), selectNode, node;

						if (marker) {
							// Walk in if we can WebKit and IE does this automatically so lets do it manually for the others
							selectNode = marker;
							for (node = marker[sibling_name]; node && node.nodeType == 1; node = node[child_name])
								selectNode = node;

							if (suffix == 'start') {
								if (selectNode != marker) {
									rng.setStartBefore(selectNode);
									rng.setEndBefore(selectNode);
								} else {
									rng.setStartAfter(selectNode);
									rng.setEndAfter(selectNode);
								}
							} else {
								if (selectNode != marker)
									rng.setEndAfter(selectNode);
								else
									rng.setEndBefore(selectNode);
							}
						}

						return marker;
					};

					// Restore start/end points
					marker1 = restoreEndPoint('start', 'firstChild', 'nextSibling');
					marker2 = restoreEndPoint('end', 'lastChild', 'previousSibling');

					t.setRng(rng);

					if (!bookmark.keep) {
						dom.remove(marker1);
						dom.remove(marker2);
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
		 * @param {Element} n HMTL DOM element to select.
		 * @param {Boolean} c Bool state if the contents should be selected or not on non IE browser.
		 * @return {Element} Selected element the same element as the one that got passed in.
		 */
		select : function(n, c) {
			var t = this, r = t.getRng(), s = t.getSel(), b, fn, ln, d = t.win.document;

			function find(n, start) {
				var walker, o;

				if (n) {
					walker = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

					// Find first/last non empty text node
					while (n = walker.nextNode()) {
						o = n;

						if (tinymce.trim(n.nodeValue).length != 0) {
							if (start)
								return n;
							else
								o = n;
						}
					}
				}

				return o;
			};

			if (isIE) {
				try {
					b = d.body;

					if (/^(IMG|TABLE)$/.test(n.nodeName)) {
						r = b.createControlRange();
						r.addElement(n);
					} else {
						r = b.createTextRange();
						r.moveToElementText(n);
					}

					r.select();
				} catch (ex) {
					// Throws illigal agrument in IE some times
				}
			} else {
				if (c) {
					fn = find(n, 1) || t.dom.select('br:first', n)[0];
					ln = find(n, 0) || t.dom.select('br:last', n)[0];

					if (fn && ln) {
						r = d.createRange();

						if (fn.nodeName == 'BR')
							r.setStartBefore(fn);
						else
							r.setStart(fn, 0);

						if (ln.nodeName == 'BR')
							r.setEndBefore(ln);
						else
							r.setEnd(ln, ln.nodeValue.length);
					} else
						r.selectNode(n);
				} else
					r.selectNode(n);

				t.setRng(r);
			}

			return n;
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
		 * @param {Boolean} b Optional boolean state if to collapse to end or not. Defaults to start.
		 */
		collapse : function(b) {
			var t = this, r = t.getRng(), n;

			// Control range on IE
			if (r.item) {
				n = r.item(0);
				r = this.win.document.body.createTextRange();
				r.moveToElementText(n);
			}

			r.collapse(!!b);
			t.setRng(r);
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
		 */
		getRng : function(w3c) {
			var t = this, s, r;

			// Found tridentSel object then we need to use that one
			if (w3c && t.tridentSel)
				return t.tridentSel.getRangeAt(0);

			try {
				if (s = t.getSel())
					r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : t.win.document.createRange());
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!r)
				r = isIE ? t.win.document.body.createTextRange() : t.win.document.createRange();

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
					s.removeAllRanges();
					s.addRange(r);
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
		 */
		getNode : function() {
			var t = this, r = t.getRng(), s = t.getSel(), e;

			if (!isIE) {
				// Range maybe lost after the editor is made visible again
				if (!r)
					return t.dom.getRoot();

				e = r.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!r.collapsed) {
					// If the anchor node is a element instead of a text node then return this element
					if (tinymce.isWebKit && s.anchorNode && s.anchorNode.nodeType == 1) 
						return s.anchorNode.childNodes[s.anchorOffset]; 

					if (r.startContainer == r.endContainer) {
						if (r.startOffset - r.endOffset < 2) {
							if (r.startContainer.hasChildNodes())
								e = r.startContainer.childNodes[r.startOffset];
						}
					}
				}

				if (e && e.nodeType == 3)
					return e.parentNode;

				return e;
			}

			return r.item ? r.item(0) : r.parentElement();
		},

		getSelectedBlocks : function(st, en) {
			var t = this, dom = t.dom, sb, eb, n, bl = [];

			sb = dom.getParent(st || t.getStart(), dom.isBlock);
			eb = dom.getParent(en || t.getEnd(), dom.isBlock);

			if (sb)
				bl.push(sb);

			if (sb && eb && sb != eb) {
				n = sb;

				while ((n = n.nextSibling) && n != eb) {
					if (dom.isBlock(n))
						bl.push(n);
				}
			}

			if (eb && sb != eb)
				bl.push(eb);

			return bl;
		},

		destroy : function(s) {
			var t = this;

			t.win = null;

			if (t.tridentSel)
				t.tridentSel.destroy();

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		}
	});
})(tinymce);
