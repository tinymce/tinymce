/**
 * TridentSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Selection class for old explorer versions. This one fakes the
 * native selection object available on modern browsers.
 *
 * @private
 * @class tinymce.dom.TridentSelection
 */
define(
  'tinymce.core.dom.TridentSelection',
  [
  ],
  function () {
    function Selection(selection) {
      var self = this, dom = selection.dom, FALSE = false;

      function getPosition(rng, start) {
        var checkRng, startIndex = 0, endIndex, inside,
          children, child, offset, index, position = -1, parent;

        // Setup test range, collapse it and get the parent
        checkRng = rng.duplicate();
        checkRng.collapse(start);
        parent = checkRng.parentElement();

        // Check if the selection is within the right document
        if (parent.ownerDocument !== selection.dom.doc) {
          return;
        }

        // IE will report non editable elements as it's parent so look for an editable one
        while (parent.contentEditable === "false") {
          parent = parent.parentNode;
        }

        // If parent doesn't have any children then return that we are inside the element
        if (!parent.hasChildNodes()) {
          return { node: parent, inside: 1 };
        }

        // Setup node list and endIndex
        children = parent.children;
        endIndex = children.length - 1;

        // Perform a binary search for the position
        while (startIndex <= endIndex) {
          index = Math.floor((startIndex + endIndex) / 2);

          // Move selection to node and compare the ranges
          child = children[index];
          checkRng.moveToElementText(child);
          position = checkRng.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', rng);

          // Before/after or an exact match
          if (position > 0) {
            endIndex = index - 1;
          } else if (position < 0) {
            startIndex = index + 1;
          } else {
            return { node: child };
          }
        }

        // Check if child position is before or we didn't find a position
        if (position < 0) {
          // No element child was found use the parent element and the offset inside that
          if (!child) {
            checkRng.moveToElementText(parent);
            checkRng.collapse(true);
            child = parent;
            inside = true;
          } else {
            checkRng.collapse(false);
          }

          // Walk character by character in text node until we hit the selected range endpoint,
          // hit the end of document or parent isn't the right one
          // We need to walk char by char since rng.text or rng.htmlText will trim line endings
          offset = 0;
          while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
            if (checkRng.move('character', 1) === 0 || parent != checkRng.parentElement()) {
              break;
            }

            offset++;
          }
        } else {
          // Child position is after the selection endpoint
          checkRng.collapse(true);

          // Walk character by character in text node until we hit the selected range endpoint, hit
          // the end of document or parent isn't the right one
          offset = 0;
          while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
            if (checkRng.move('character', -1) === 0 || parent != checkRng.parentElement()) {
              break;
            }

            offset++;
          }
        }

        return { node: child, position: position, offset: offset, inside: inside };
      }

      // Returns a W3C DOM compatible range object by using the IE Range API
      function getRange() {
        var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed, tmpRange, element2, bookmark;

        // If selection is outside the current document just return an empty range
        element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
        if (element.ownerDocument != dom.doc) {
          return domRange;
        }

        collapsed = selection.isCollapsed();

        // Handle control selection
        if (ieRange.item) {
          domRange.setStart(element.parentNode, dom.nodeIndex(element));
          domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

          return domRange;
        }

        function findEndPoint(start) {
          var endPoint = getPosition(ieRange, start), container, offset, textNodeOffset = 0, sibling, undef, nodeValue;

          container = endPoint.node;
          offset = endPoint.offset;

          if (endPoint.inside && !container.hasChildNodes()) {
            domRange[start ? 'setStart' : 'setEnd'](container, 0);
            return;
          }

          if (offset === undef) {
            domRange[start ? 'setStartBefore' : 'setEndAfter'](container);
            return;
          }

          if (endPoint.position < 0) {
            sibling = endPoint.inside ? container.firstChild : container.nextSibling;

            if (!sibling) {
              domRange[start ? 'setStartAfter' : 'setEndAfter'](container);
              return;
            }

            if (!offset) {
              if (sibling.nodeType == 3) {
                domRange[start ? 'setStart' : 'setEnd'](sibling, 0);
              } else {
                domRange[start ? 'setStartBefore' : 'setEndBefore'](sibling);
              }

              return;
            }

            // Find the text node and offset
            while (sibling) {
              if (sibling.nodeType == 3) {
                nodeValue = sibling.nodeValue;
                textNodeOffset += nodeValue.length;

                // We are at or passed the position we where looking for
                if (textNodeOffset >= offset) {
                  container = sibling;
                  textNodeOffset -= offset;
                  textNodeOffset = nodeValue.length - textNodeOffset;
                  break;
                }
              }

              sibling = sibling.nextSibling;
            }
          } else {
            // Find the text node and offset
            sibling = container.previousSibling;

            if (!sibling) {
              return domRange[start ? 'setStartBefore' : 'setEndBefore'](container);
            }

            // If there isn't any text to loop then use the first position
            if (!offset) {
              if (container.nodeType == 3) {
                domRange[start ? 'setStart' : 'setEnd'](sibling, container.nodeValue.length);
              } else {
                domRange[start ? 'setStartAfter' : 'setEndAfter'](sibling);
              }

              return;
            }

            while (sibling) {
              if (sibling.nodeType == 3) {
                textNodeOffset += sibling.nodeValue.length;

                // We are at or passed the position we where looking for
                if (textNodeOffset >= offset) {
                  container = sibling;
                  textNodeOffset -= offset;
                  break;
                }
              }

              sibling = sibling.previousSibling;
            }
          }

          domRange[start ? 'setStart' : 'setEnd'](container, textNodeOffset);
        }

        try {
          // Find start point
          findEndPoint(true);

          // Find end point if needed
          if (!collapsed) {
            findEndPoint();
          }
        } catch (ex) {
          // IE has a nasty bug where text nodes might throw "invalid argument" when you
          // access the nodeValue or other properties of text nodes. This seems to happen when
          // text nodes are split into two nodes by a delete/backspace call.
          // So let us detect and try to fix it.
          if (ex.number == -2147024809) {
            // Get the current selection
            bookmark = self.getBookmark(2);

            // Get start element
            tmpRange = ieRange.duplicate();
            tmpRange.collapse(true);
            element = tmpRange.parentElement();

            // Get end element
            if (!collapsed) {
              tmpRange = ieRange.duplicate();
              tmpRange.collapse(false);
              element2 = tmpRange.parentElement();
              element2.innerHTML = element2.innerHTML;
            }

            // Remove the broken elements
            element.innerHTML = element.innerHTML;

            // Restore the selection
            self.moveToBookmark(bookmark);

            // Since the range has moved we need to re-get it
            ieRange = selection.getRng();

            // Find start point
            findEndPoint(true);

            // Find end point if needed
            if (!collapsed) {
              findEndPoint();
            }
          } else {
            throw ex; // Throw other errors
          }
        }

        return domRange;
      }

      this.getBookmark = function (type) {
        var rng = selection.getRng(), bookmark = {};

        function getIndexes(node) {
          var parent, root, children, i, indexes = [];

          parent = node.parentNode;
          root = dom.getRoot().parentNode;

          while (parent != root && parent.nodeType !== 9) {
            children = parent.children;

            i = children.length;
            while (i--) {
              if (node === children[i]) {
                indexes.push(i);
                break;
              }
            }

            node = parent;
            parent = parent.parentNode;
          }

          return indexes;
        }

        function getBookmarkEndPoint(start) {
          var position;

          position = getPosition(rng, start);
          if (position) {
            return {
              position: position.position,
              offset: position.offset,
              indexes: getIndexes(position.node),
              inside: position.inside
            };
          }
        }

        // Non ubstructive bookmark
        if (type === 2) {
          // Handle text selection
          if (!rng.item) {
            bookmark.start = getBookmarkEndPoint(true);

            if (!selection.isCollapsed()) {
              bookmark.end = getBookmarkEndPoint();
            }
          } else {
            bookmark.start = { ctrl: true, indexes: getIndexes(rng.item(0)) };
          }
        }

        return bookmark;
      };

      this.moveToBookmark = function (bookmark) {
        var rng, body = dom.doc.body;

        function resolveIndexes(indexes) {
          var node, i, idx, children;

          node = dom.getRoot();
          for (i = indexes.length - 1; i >= 0; i--) {
            children = node.children;
            idx = indexes[i];

            if (idx <= children.length - 1) {
              node = children[idx];
            }
          }

          return node;
        }

        function setBookmarkEndPoint(start) {
          var endPoint = bookmark[start ? 'start' : 'end'], moveLeft, moveRng, undef, offset;

          if (endPoint) {
            moveLeft = endPoint.position > 0;

            moveRng = body.createTextRange();
            moveRng.moveToElementText(resolveIndexes(endPoint.indexes));

            offset = endPoint.offset;
            if (offset !== undef) {
              moveRng.collapse(endPoint.inside || moveLeft);
              moveRng.moveStart('character', moveLeft ? -offset : offset);
            } else {
              moveRng.collapse(start);
            }

            rng.setEndPoint(start ? 'StartToStart' : 'EndToStart', moveRng);

            if (start) {
              rng.collapse(true);
            }
          }
        }

        if (bookmark.start) {
          if (bookmark.start.ctrl) {
            rng = body.createControlRange();
            rng.addElement(resolveIndexes(bookmark.start.indexes));
            rng.select();
          } else {
            rng = body.createTextRange();
            setBookmarkEndPoint(true);
            setBookmarkEndPoint();
            rng.select();
          }
        }
      };

      this.addRange = function (rng) {
        var ieRng, ctrlRng, startContainer, startOffset, endContainer, endOffset, sibling,
          doc = selection.dom.doc, body = doc.body, nativeRng, ctrlElm;

        function setEndPoint(start) {
          var container, offset, marker, tmpRng, nodes;

          marker = dom.create('a');
          container = start ? startContainer : endContainer;
          offset = start ? startOffset : endOffset;
          tmpRng = ieRng.duplicate();

          if (container == doc || container == doc.documentElement) {
            container = body;
            offset = 0;
          }

          if (container.nodeType == 3) {
            container.parentNode.insertBefore(marker, container);
            tmpRng.moveToElementText(marker);
            tmpRng.moveStart('character', offset);
            dom.remove(marker);
            ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
          } else {
            nodes = container.childNodes;

            if (nodes.length) {
              if (offset >= nodes.length) {
                dom.insertAfter(marker, nodes[nodes.length - 1]);
              } else {
                container.insertBefore(marker, nodes[offset]);
              }

              tmpRng.moveToElementText(marker);
            } else if (container.canHaveHTML) {
              // Empty node selection for example <div>|</div>
              // Setting innerHTML with a span marker then remove that marker seems to keep empty block elements open
              container.innerHTML = '<span>&#xFEFF;</span>';
              marker = container.firstChild;
              tmpRng.moveToElementText(marker);
              tmpRng.collapse(FALSE); // Collapse false works better than true for some odd reason
            }

            ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
            dom.remove(marker);
          }
        }

        // Setup some shorter versions
        startContainer = rng.startContainer;
        startOffset = rng.startOffset;
        endContainer = rng.endContainer;
        endOffset = rng.endOffset;
        ieRng = body.createTextRange();

        // If single element selection then try making a control selection out of it
        if (startContainer == endContainer && startContainer.nodeType == 1) {
          // Trick to place the caret inside an empty block element like <p></p>
          if (startOffset == endOffset && !startContainer.hasChildNodes()) {
            if (startContainer.canHaveHTML) {
              // Check if previous sibling is an empty block if it is then we need to render it
              // IE would otherwise move the caret into the sibling instead of the empty startContainer see: #5236
              // Example this: <p></p><p>|</p> would become this: <p>|</p><p></p>
              sibling = startContainer.previousSibling;
              if (sibling && !sibling.hasChildNodes() && dom.isBlock(sibling)) {
                sibling.innerHTML = '&#xFEFF;';
              } else {
                sibling = null;
              }

              startContainer.innerHTML = '<span>&#xFEFF;</span><span>&#xFEFF;</span>';
              ieRng.moveToElementText(startContainer.lastChild);
              ieRng.select();
              dom.doc.selection.clear();
              startContainer.innerHTML = '';

              if (sibling) {
                sibling.innerHTML = '';
              }
              return;
            }

            startOffset = dom.nodeIndex(startContainer);
            startContainer = startContainer.parentNode;
          }

          if (startOffset == endOffset - 1) {
            try {
              ctrlElm = startContainer.childNodes[startOffset];
              ctrlRng = body.createControlRange();
              ctrlRng.addElement(ctrlElm);
              ctrlRng.select();

              // Check if the range produced is on the correct element and is a control range
              // On IE 8 it will select the parent contentEditable container if you select an inner element see: #5398
              nativeRng = selection.getRng();
              if (nativeRng.item && ctrlElm === nativeRng.item(0)) {
                return;
              }
            } catch (ex) {
              // Ignore
            }
          }
        }

        // Set start/end point of selection
        setEndPoint(true);
        setEndPoint();

        // Select the new range and scroll it into view
        ieRng.select();
      };

      // Expose range method
      this.getRangeAt = getRange;
    }

    return Selection;
  }
);
