/**
 * Selection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
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
define(
  'tinymce.core.dom.Selection',
  [
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'tinymce.core.Env',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.BookmarkManager',
    'tinymce.core.dom.ControlSelection',
    'tinymce.core.dom.ScrollIntoView',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.focus.EditorFocus',
    'tinymce.core.selection.CaretRangeFromPoint',
    'tinymce.core.selection.EventProcessRanges',
    'tinymce.core.selection.GetSelectionContent',
    'tinymce.core.selection.MultiRange',
    'tinymce.core.selection.NormalizeRange',
    'tinymce.core.selection.SelectionBookmark',
    'tinymce.core.selection.SetSelectionContent',
    'tinymce.core.util.Tools'
  ],
  function (
    Compare, Element, Env, CaretPosition, BookmarkManager, ControlSelection, ScrollIntoView, TreeWalker, EditorFocus, CaretRangeFromPoint, EventProcessRanges,
    GetSelectionContent, MultiRange, NormalizeRange, SelectionBookmark, SetSelectionContent, Tools
  ) {
    var each = Tools.each, trim = Tools.trim;

    var isAttachedToDom = function (node) {
      return !!(node && node.ownerDocument) && Compare.contains(Element.fromDom(node.ownerDocument), Element.fromDom(node));
    };

    var isValidRange = function (rng) {
      if (!rng) {
        return false;
      } else if (rng.select) { // Native IE range still produced by placeCaretAt
        return true;
      } else {
        return isAttachedToDom(rng.startContainer) && isAttachedToDom(rng.endContainer);
      }
    };

    /**
     * Constructs a new selection instance.
     *
     * @constructor
     * @method Selection
     * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
     * @param {Window} win Window to bind the selection object to.
     * @param {tinymce.Editor} editor Editor instance of the selection.
     * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
     */
    var Selection = function (dom, win, serializer, editor) {
      var self = this;

      self.dom = dom;
      self.win = win;
      self.serializer = serializer;
      self.editor = editor;
      self.bookmarkManager = new BookmarkManager(self);
      self.controlSelection = new ControlSelection(self, editor);
    };

    Selection.prototype = {
      /**
       * Move the selection cursor range to the specified node and offset.
       * If there is no node specified it will move it to the first suitable location within the body.
       *
       * @method setCursorLocation
       * @param {Node} node Optional node to put the cursor in.
       * @param {Number} offset Optional offset from the start of the node to put the cursor at.
       */
      setCursorLocation: function (node, offset) {
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
       * @param {Object} args Optional settings class with for example output format text or html.
       * @return {String} Selected contents in for example HTML format.
       * @example
       * // Alerts the currently selected contents
       * alert(tinymce.activeEditor.selection.getContent());
       *
       * // Alerts the currently selected contents as plain text
       * alert(tinymce.activeEditor.selection.getContent({format: 'text'}));
       */
      getContent: function (args) {
        return GetSelectionContent.getContent(this.editor, args);
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
      setContent: function (content, args) {
        SetSelectionContent.setContent(this.editor, content, args);
      },

      /**
       * Returns the start element of a selection range. If the start is in a text
       * node the parent element will be returned.
       *
       * @method getStart
       * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
       * @return {Element} Start element of selection range.
       */
      getStart: function (real) {
        var self = this, rng = self.getRng(), startElement;

        startElement = rng.startContainer;

        if (startElement.nodeType == 1 && startElement.hasChildNodes()) {
          if (!real || !rng.collapsed) {
            startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];
          }
        }

        if (startElement && startElement.nodeType == 3) {
          return startElement.parentNode;
        }

        return startElement;
      },

      /**
       * Returns the end element of a selection range. If the end is in a text
       * node the parent element will be returned.
       *
       * @method getEnd
       * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
       * @return {Element} End element of selection range.
       */
      getEnd: function (real) {
        var self = this, rng = self.getRng(), endElement, endOffset;

        endElement = rng.endContainer;
        endOffset = rng.endOffset;

        if (endElement.nodeType == 1 && endElement.hasChildNodes()) {
          if (!real || !rng.collapsed) {
            endElement = endElement.childNodes[endOffset > 0 ? endOffset - 1 : endOffset];
          }
        }

        if (endElement && endElement.nodeType == 3) {
          return endElement.parentNode;
        }

        return endElement;
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
      getBookmark: function (type, normalized) {
        return this.bookmarkManager.getBookmark(type, normalized);
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
      moveToBookmark: function (bookmark) {
        return this.bookmarkManager.moveToBookmark(bookmark);
      },

      /**
       * Selects the specified element. This will place the start and end of the selection range around the element.
       *
       * @method select
       * @param {Element} node HTML DOM element to select.
       * @param {Boolean} content Optional bool state if the contents should be selected or not on non IE browser.
       * @return {Element} Selected element the same element as the one that got passed in.
       * @example
       * // Select the first paragraph in the active editor
       * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
       */
      select: function (node, content) {
        var self = this, dom = self.dom, rng = dom.createRng(), idx;

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
      isCollapsed: function () {
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
       * @param {Boolean} toStart Optional boolean state if to collapse to end or not. Defaults to false.
       */
      collapse: function (toStart) {
        var self = this, rng = self.getRng();

        rng.collapse(!!toStart);
        self.setRng(rng);
      },

      /**
       * Returns the browsers internal selection object.
       *
       * @method getSel
       * @return {Selection} Internal browser selection object.
       */
      getSel: function () {
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
      getRng: function (w3c) {
        var self = this, selection, rng, elm, doc;

        var tryCompareBoundaryPoints = function (how, sourceRange, destinationRange) {
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
        };

        if (!self.win) {
          return null;
        }

        doc = self.win.document;

        if (typeof doc === 'undefined' || doc === null) {
          return null;
        }

        if (self.editor.bookmark !== undefined && EditorFocus.hasFocus(self.editor) === false) {
          var bookmark = SelectionBookmark.getRng(self.editor);

          if (bookmark.isSome()) {
            return bookmark.getOr(doc.createRange());
          }
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

        rng = EventProcessRanges.processRanges(self.editor, [rng])[0];

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
          if (tryCompareBoundaryPoints(rng.START_TO_START, rng, self.selectedRange) === 0 &&
            tryCompareBoundaryPoints(rng.END_TO_END, rng, self.selectedRange) === 0) {
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
       * @param {Boolean} forward Optional boolean if the selection is forwards or backwards.
       */
      setRng: function (rng, forward) {
        var self = this, sel, node, evt;

        if (!isValidRange(rng)) {
          return;
        }

        // Is IE specific range
        if (rng.select) {
          self.explicitRange = null;

          try {
            rng.select();
          } catch (ex) {
            // Needed for some odd IE bug #1843306
          }

          return;
        }

        sel = self.getSel();

        evt = self.editor.fire('SetSelectionRange', { range: rng, forward: forward });
        rng = evt.range;

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

        // WebKit egde case selecting images works better using setBaseAndExtent when the image is floated
        if (!rng.collapsed && rng.startContainer === rng.endContainer && sel.setBaseAndExtent && !Env.ie) {
          if (rng.endOffset - rng.startOffset < 2) {
            if (rng.startContainer.hasChildNodes()) {
              node = rng.startContainer.childNodes[rng.startOffset];
              if (node && node.tagName === 'IMG') {
                sel.setBaseAndExtent(
                  rng.startContainer,
                  rng.startOffset,
                  rng.endContainer,
                  rng.endOffset
                );

                // Since the setBaseAndExtent is fixed in more recent Blink versions we
                // need to detect if it's doing the wrong thing and falling back to the
                // crazy incorrect behavior api call since that seems to be the only way
                // to get it to work on Safari WebKit as of 2017-02-23
                if (sel.anchorNode !== rng.startContainer || sel.focusNode !== rng.endContainer) {
                  sel.setBaseAndExtent(node, 0, node, 1);
                }
              }
            }
          }
        }

        self.editor.fire('AfterSetSelectionRange', { range: rng, forward: forward });
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
      setNode: function (elm) {
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
      getNode: function () {
        var self = this, rng = self.getRng(), elm;
        var startContainer, endContainer, startOffset, endOffset, root = self.dom.getRoot();

        var skipEmptyTextNodes = function (node, forwards) {
          var orig = node;

          while (node && node.nodeType === 3 && node.length === 0) {
            node = forwards ? node.nextSibling : node.previousSibling;
          }

          return node || orig;
        };

        // Range maybe lost after the editor is made visible again
        if (!rng) {
          return root;
        }

        startContainer = rng.startContainer;
        endContainer = rng.endContainer;
        startOffset = rng.startOffset;
        endOffset = rng.endOffset;
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
          // return sel.anchorNode.childNodes[sel.anchorOffset];

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
      },

      getSelectedBlocks: function (startElm, endElm) {
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

      isForward: function () {
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

      normalize: function () {
        var self = this, rng = self.getRng();

        if (!MultiRange.hasMultipleRanges(self.getSel())) {
          var normRng = NormalizeRange.normalize(self.dom, rng);

          normRng.each(function (normRng) {
            self.setRng(normRng, self.isForward());
          });

          return normRng.getOr(rng);
        }

        return rng;
      },

      /**
       * Executes callback when the current selection starts/stops matching the specified selector. The current
       * state will be passed to the callback as it's first argument.
       *
       * @method selectorChanged
       * @param {String} selector CSS selector to check for.
       * @param {function} callback Callback with state and args when the selector is matches or not.
       */
      selectorChanged: function (selector, callback) {
        var self = this, currentSelectors;

        if (!self.selectorChangedData) {
          self.selectorChangedData = {};
          currentSelectors = {};

          self.editor.on('NodeChange', function (e) {
            var node = e.element, dom = self.dom, parents = dom.getParents(node, null, dom.getRoot()), matchedSelectors = {};

            // Check for new matching selectors
            each(self.selectorChangedData, function (callbacks, selector) {
              each(parents, function (node) {
                if (dom.is(node, selector)) {
                  if (!currentSelectors[selector]) {
                    // Execute callbacks
                    each(callbacks, function (callback) {
                      callback(true, { node: node, selector: selector, parents: parents });
                    });

                    currentSelectors[selector] = callbacks;
                  }

                  matchedSelectors[selector] = callbacks;
                  return false;
                }
              });
            });

            // Check if current selectors still match
            each(currentSelectors, function (callbacks, selector) {
              if (!matchedSelectors[selector]) {
                delete currentSelectors[selector];

                each(callbacks, function (callback) {
                  callback(false, { node: node, selector: selector, parents: parents });
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

      getScrollContainer: function () {
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

      scrollIntoView: function (elm, alignToTop) {
        ScrollIntoView.scrollIntoView(this.editor, elm, alignToTop);
      },

      placeCaretAt: function (clientX, clientY) {
        this.setRng(CaretRangeFromPoint.fromPoint(clientX, clientY, this.editor.getDoc()));
      },

      _moveEndPoint: function (rng, node, start) {
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

          // BR/IMG/INPUT elements but not table cells
          if (nonEmptyElementsMap[node.nodeName] && !/^(TD|TH)$/.test(node.nodeName)) {
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

      getBoundingClientRect: function () {
        var rng = this.getRng();
        return rng.collapsed ? CaretPosition.fromRangeStart(rng).getClientRects()[0] : rng.getBoundingClientRect();
      },

      destroy: function () {
        this.win = null;
        this.controlSelection.destroy();
      }
    };

    return Selection;
  }
);
