/**
 * InsertNewLine.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InsertNewLine',
  [
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.fmt.CaretFormat',
    'tinymce.core.selection.NormalizeRange',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (CaretContainer, NodeType, TreeWalker, CaretFormat, NormalizeRange, Zwsp, Tools) {
    var isEmptyAnchor = function (elm) {
      return elm && elm.nodeName === "A" && Tools.trim(Zwsp.trim(elm.innerText || elm.textContent)).length === 0;
    };

    var isTableCell = function (node) {
      return node && /^(TD|TH|CAPTION)$/.test(node.nodeName);
    };

    var hasFirstChild = function (elm, name) {
      return elm.firstChild && elm.firstChild.nodeName == name;
    };

    var hasParent = function (elm, parentName) {
      return elm && elm.parentNode && elm.parentNode.nodeName === parentName;
    };

    var emptyBlock = function (elm) {
      elm.innerHTML = '<br data-mce-bogus="1">';
    };

    var containerAndSiblingName = function (container, nodeName) {
      return container.nodeName === nodeName || (container.previousSibling && container.previousSibling.nodeName === nodeName);
    };

    var isListBlock = function (elm) {
      return elm && /^(OL|UL|LI)$/.test(elm.nodeName);
    };

    var isNestedList = function (elm) {
      return isListBlock(elm) && isListBlock(elm.parentNode);
    };

    // Returns true if the block can be split into two blocks or not
    var canSplitBlock = function (dom, node) {
      return node &&
        dom.isBlock(node) &&
        !/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
        !/^(fixed|absolute)/i.test(node.style.position) &&
        dom.getContentEditable(node) !== "true";
    };

    // Remove the first empty inline element of the block so this: <p><b><em></em></b>x</p> becomes this: <p>x</p>
    var trimInlineElementsOnLeftSideOfBlock = function (dom, nonEmptyElementsMap, block) {
      var node = block, firstChilds = [], i;

      if (!node) {
        return;
      }

      // Find inner most first child ex: <p><i><b>*</b></i></p>
      while ((node = node.firstChild)) {
        if (dom.isBlock(node)) {
          return;
        }

        if (node.nodeType == 1 && !nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
          firstChilds.push(node);
        }
      }

      i = firstChilds.length;
      while (i--) {
        node = firstChilds[i];
        if (!node.hasChildNodes() || (node.firstChild == node.lastChild && node.firstChild.nodeValue === '')) {
          dom.remove(node);
        } else {
          if (isEmptyAnchor(node)) {
            dom.remove(node);
          }
        }
      }
    };

    var normalizeZwspOffset = function (start, container, offset) {
      if (NodeType.isText(container) === false) {
        return offset;
      } if (start) {
        return offset === 1 && container.data.charAt(offset - 1) === Zwsp.ZWSP ? 0 : offset;
      } else {
        return offset === container.data.length - 1 && container.data.charAt(offset) === Zwsp.ZWSP ? container.data.length : offset;
      }
    };

    var includeZwspInRange = function (rng) {
      var newRng = rng.cloneRange();
      newRng.setStart(rng.startContainer, normalizeZwspOffset(true, rng.startContainer, rng.startOffset));
      newRng.setEnd(rng.endContainer, normalizeZwspOffset(false, rng.endContainer, rng.endOffset));
      return newRng;
    };

    var firstNonWhiteSpaceNodeSibling = function (node) {
      while (node) {
        if (node.nodeType === 1 || (node.nodeType === 3 && node.data && /[\r\n\s]/.test(node.data))) {
          return node;
        }

        node = node.nextSibling;
      }
    };

    // Inserts a BR element if the forced_root_block option is set to false or empty string
    var insertBr = function (editor, evt) {
      editor.execCommand("InsertLineBreak", false, evt);
    };

    // Trims any linebreaks at the beginning of node user for example when pressing enter in a PRE element
    var trimLeadingLineBreaks = function (node) {
      do {
        if (node.nodeType === 3) {
          node.nodeValue = node.nodeValue.replace(/^[\r\n]+/, '');
        }

        node = node.firstChild;
      } while (node);
    };

    var getEditableRoot = function (dom, node) {
      var root = dom.getRoot(), parent, editableRoot;

      // Get all parents until we hit a non editable parent or the root
      parent = node;
      while (parent !== root && dom.getContentEditable(parent) !== "false") {
        if (dom.getContentEditable(parent) === "true") {
          editableRoot = parent;
        }

        parent = parent.parentNode;
      }

      return parent !== root ? editableRoot : root;
    };

    var setForcedBlockAttrs = function (editor, node) {
      var forcedRootBlockName = editor.settings.forced_root_block;

      if (forcedRootBlockName && forcedRootBlockName.toLowerCase() === node.tagName.toLowerCase()) {
        editor.dom.setAttribs(node, editor.settings.forced_root_block_attrs);
      }
    };

    // Wraps any text nodes or inline elements in the specified forced root block name
    var wrapSelfAndSiblingsInDefaultBlock = function (editor, newBlockName, rng, container, offset) {
      var newBlock, parentBlock, startNode, node, next, rootBlockName, blockName = newBlockName || 'P';
      var dom = editor.dom, editableRoot = getEditableRoot(dom, container);

      // Not in a block element or in a table cell or caption
      parentBlock = dom.getParent(container, dom.isBlock);
      if (!parentBlock || !canSplitBlock(dom, parentBlock)) {
        parentBlock = parentBlock || editableRoot;

        if (parentBlock == editor.getBody() || isTableCell(parentBlock)) {
          rootBlockName = parentBlock.nodeName.toLowerCase();
        } else {
          rootBlockName = parentBlock.parentNode.nodeName.toLowerCase();
        }

        if (!parentBlock.hasChildNodes()) {
          newBlock = dom.create(blockName);
          setForcedBlockAttrs(editor, newBlock);
          parentBlock.appendChild(newBlock);
          rng.setStart(newBlock, 0);
          rng.setEnd(newBlock, 0);
          return newBlock;
        }

        // Find parent that is the first child of parentBlock
        node = container;
        while (node.parentNode != parentBlock) {
          node = node.parentNode;
        }

        // Loop left to find start node start wrapping at
        while (node && !dom.isBlock(node)) {
          startNode = node;
          node = node.previousSibling;
        }

        if (startNode && editor.schema.isValidChild(rootBlockName, blockName.toLowerCase())) {
          newBlock = dom.create(blockName);
          setForcedBlockAttrs(editor, newBlock);
          startNode.parentNode.insertBefore(newBlock, startNode);

          // Start wrapping until we hit a block
          node = startNode;
          while (node && !dom.isBlock(node)) {
            next = node.nextSibling;
            newBlock.appendChild(node);
            node = next;
          }

          // Restore range to it's past location
          rng.setStart(container, offset);
          rng.setEnd(container, offset);
        }
      }

      return container;
    };

    // Adds a BR at the end of blocks that only contains an IMG or INPUT since
    // these might be floated and then they won't expand the block
    var addBrToBlockIfNeeded = function (dom, block) {
      var lastChild;

      // IE will render the blocks correctly other browsers needs a BR
      block.normalize(); // Remove empty text nodes that got left behind by the extract

      // Check if the block is empty or contains a floated last child
      lastChild = block.lastChild;
      if (!lastChild || (/^(left|right)$/gi.test(dom.getStyle(lastChild, 'float', true)))) {
        dom.add(block, 'br');
      }
    };

    var getContainerBlock = function (containerBlock) {
      var containerBlockParent = containerBlock.parentNode;

      if (/^(LI|DT|DD)$/.test(containerBlockParent.nodeName)) {
        return containerBlockParent;
      }

      return containerBlock;
    };

    var isFirstOrLastLi = function (containerBlock, parentBlock, first) {
      var node = containerBlock[first ? 'firstChild' : 'lastChild'];

      // Find first/last element since there might be whitespace there
      while (node) {
        if (node.nodeType == 1) {
          break;
        }

        node = node[first ? 'nextSibling' : 'previousSibling'];
      }

      return node === parentBlock;
    };

    var insert = function (editor, evt) {
      var tmpRng, editableRoot, container, offset, parentBlock, shiftKey;
      var newBlock, fragment, containerBlock, parentBlockName, containerBlockName, newBlockName, isAfterLastNodeInContainer;
      var dom = editor.dom, selection = editor.selection, settings = editor.settings;
      var schema = editor.schema, nonEmptyElementsMap = schema.getNonEmptyElements();
      var rng = editor.selection.getRng();

      // Moves the caret to a suitable position within the root for example in the first non
      // pure whitespace text node or before an image
      var moveToCaretPosition = function (root) {
        var walker, node, rng, lastNode = root, tempElm;
        var moveCaretBeforeOnEnterElementsMap = schema.getMoveCaretBeforeOnEnterElements();

        if (!root) {
          return;
        }

        if (/^(LI|DT|DD)$/.test(root.nodeName)) {
          var firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

          if (firstChild && /^(UL|OL|DL)$/.test(firstChild.nodeName)) {
            root.insertBefore(dom.doc.createTextNode('\u00a0'), root.firstChild);
          }
        }

        rng = dom.createRng();
        root.normalize();

        if (root.hasChildNodes()) {
          walker = new TreeWalker(root, root);

          while ((node = walker.current())) {
            if (node.nodeType == 3) {
              rng.setStart(node, 0);
              rng.setEnd(node, 0);
              break;
            }

            if (moveCaretBeforeOnEnterElementsMap[node.nodeName.toLowerCase()]) {
              rng.setStartBefore(node);
              rng.setEndBefore(node);
              break;
            }

            lastNode = node;
            node = walker.next();
          }

          if (!node) {
            rng.setStart(lastNode, 0);
            rng.setEnd(lastNode, 0);
          }
        } else {
          if (root.nodeName == 'BR') {
            if (root.nextSibling && dom.isBlock(root.nextSibling)) {
              rng.setStartBefore(root);
              rng.setEndBefore(root);
            } else {
              rng.setStartAfter(root);
              rng.setEndAfter(root);
            }
          } else {
            rng.setStart(root, 0);
            rng.setEnd(root, 0);
          }
        }

        selection.setRng(rng);

        // Remove tempElm created for old IE:s
        dom.remove(tempElm);
        selection.scrollIntoView(root);
      };

      // Creates a new block element by cloning the current one or creating a new one if the name is specified
      // This function will also copy any text formatting from the parent block and add it to the new one
      var createNewBlock = function (name) {
        var node = container, block, clonedNode, caretNode, textInlineElements = schema.getTextInlineElements();

        if (name || parentBlockName == "TABLE" || parentBlockName == "HR") {
          block = dom.create(name || newBlockName);
          setForcedBlockAttrs(editor, block);
        } else {
          block = parentBlock.cloneNode(false);
        }

        caretNode = block;

        if (settings.keep_styles === false) {
          dom.setAttrib(block, 'style', null); // wipe out any styles that came over with the block
          dom.setAttrib(block, 'class', null);
        } else {
          // Clone any parent styles
          do {
            if (textInlineElements[node.nodeName]) {
              if (CaretFormat.isCaretNode(node)) {
                continue;
              }

              clonedNode = node.cloneNode(false);
              dom.setAttrib(clonedNode, 'id', ''); // Remove ID since it needs to be document unique

              if (block.hasChildNodes()) {
                clonedNode.appendChild(block.firstChild);
                block.appendChild(clonedNode);
              } else {
                caretNode = clonedNode;
                block.appendChild(clonedNode);
              }
            }
          } while ((node = node.parentNode) && node != editableRoot);
        }

        emptyBlock(caretNode);

        return block;
      };

      // Returns true/false if the caret is at the start/end of the parent block element
      var isCaretAtStartOrEndOfBlock = function (start) {
        var walker, node, name, normalizedOffset;

        normalizedOffset = normalizeZwspOffset(start, container, offset);

        // Caret is in the middle of a text node like "a|b"
        if (container.nodeType == 3 && (start ? normalizedOffset > 0 : normalizedOffset < container.nodeValue.length)) {
          return false;
        }

        // If after the last element in block node edge case for #5091
        if (container.parentNode == parentBlock && isAfterLastNodeInContainer && !start) {
          return true;
        }

        // If the caret if before the first element in parentBlock
        if (start && container.nodeType == 1 && container == parentBlock.firstChild) {
          return true;
        }

        // Caret can be before/after a table or a hr
        if (containerAndSiblingName(container, 'TABLE') || containerAndSiblingName(container, 'HR')) {
          return (isAfterLastNodeInContainer && !start) || (!isAfterLastNodeInContainer && start);
        }

        // Walk the DOM and look for text nodes or non empty elements
        walker = new TreeWalker(container, parentBlock);

        // If caret is in beginning or end of a text block then jump to the next/previous node
        if (container.nodeType == 3) {
          if (start && normalizedOffset === 0) {
            walker.prev();
          } else if (!start && normalizedOffset == container.nodeValue.length) {
            walker.next();
          }
        }

        while ((node = walker.current())) {
          if (node.nodeType === 1) {
            // Ignore bogus elements
            if (!node.getAttribute('data-mce-bogus')) {
              // Keep empty elements like <img /> <input /> but not trailing br:s like <p>text|<br></p>
              name = node.nodeName.toLowerCase();
              if (nonEmptyElementsMap[name] && name !== 'br') {
                return false;
              }
            }
          } else if (node.nodeType === 3 && !/^[ \t\r\n]*$/.test(node.nodeValue)) {
            return false;
          }

          if (start) {
            walker.prev();
          } else {
            walker.next();
          }
        }

        return true;
      };

      // Inserts a block or br before/after or in the middle of a split list of the LI is empty
      var handleEmptyListItem = function () {
        if (containerBlock == editor.getBody()) {
          return;
        }

        if (isNestedList(containerBlock)) {
          newBlockName = 'LI';
        }

        newBlock = newBlockName ? createNewBlock(newBlockName) : dom.create('BR');

        if (isFirstOrLastLi(containerBlock, parentBlock, true) && isFirstOrLastLi(containerBlock, parentBlock, false)) {
          if (hasParent(containerBlock, 'LI')) {
            // Nested list is inside a LI
            dom.insertAfter(newBlock, getContainerBlock(containerBlock));
          } else {
            // Is first and last list item then replace the OL/UL with a text block
            dom.replace(newBlock, containerBlock);
          }
        } else if (isFirstOrLastLi(containerBlock, parentBlock, true)) {
          if (hasParent(containerBlock, 'LI')) {
            // List nested in an LI then move the list to a new sibling LI
            dom.insertAfter(newBlock, getContainerBlock(containerBlock));
            newBlock.appendChild(dom.doc.createTextNode(' ')); // Needed for IE so the caret can be placed
            newBlock.appendChild(containerBlock);
          } else {
            // First LI in list then remove LI and add text block before list
            containerBlock.parentNode.insertBefore(newBlock, containerBlock);
          }
        } else if (isFirstOrLastLi(containerBlock, parentBlock, false)) {
          // Last LI in list then remove LI and add text block after list
          dom.insertAfter(newBlock, getContainerBlock(containerBlock));
        } else {
          // Middle LI in list the split the list and insert a text block in the middle
          // Extract after fragment and insert it after the current block
          containerBlock = getContainerBlock(containerBlock);
          tmpRng = rng.cloneRange();
          tmpRng.setStartAfter(parentBlock);
          tmpRng.setEndAfter(containerBlock);
          fragment = tmpRng.extractContents();

          if (newBlockName === 'LI' && hasFirstChild(fragment, 'LI')) {
            newBlock = fragment.firstChild;
            dom.insertAfter(fragment, containerBlock);
          } else {
            dom.insertAfter(fragment, containerBlock);
            dom.insertAfter(newBlock, containerBlock);
          }
        }

        dom.remove(parentBlock);
        moveToCaretPosition(newBlock);
      };

      var insertNewBlockAfter = function () {
        // If the caret is at the end of a header we produce a P tag after it similar to Word unless we are in a hgroup
        if (/^(H[1-6]|PRE|FIGURE)$/.test(parentBlockName) && containerBlockName != 'HGROUP') {
          newBlock = createNewBlock(newBlockName);
        } else {
          newBlock = createNewBlock();
        }

        // Split the current container block element if enter is pressed inside an empty inner block element
        if (settings.end_container_on_empty_block && canSplitBlock(dom, containerBlock) && dom.isEmpty(parentBlock)) {
          // Split container block for example a BLOCKQUOTE at the current blockParent location for example a P
          newBlock = dom.split(containerBlock, parentBlock);
        } else {
          dom.insertAfter(newBlock, parentBlock);
        }

        moveToCaretPosition(newBlock);
      };

      // Setup range items and newBlockName
      NormalizeRange.normalize(dom, rng).each(function (normRng) {
        rng.setStart(normRng.startContainer, normRng.startOffset);
        rng.setEnd(normRng.endContainer, normRng.endOffset);
      });

      container = rng.startContainer;
      offset = rng.startOffset;
      newBlockName = (settings.force_p_newlines ? 'p' : '') || settings.forced_root_block;
      newBlockName = newBlockName ? newBlockName.toUpperCase() : '';
      shiftKey = evt.shiftKey;

      // Resolve node index
      if (container.nodeType == 1 && container.hasChildNodes()) {
        isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

        container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
        if (isAfterLastNodeInContainer && container.nodeType == 3) {
          offset = container.nodeValue.length;
        } else {
          offset = 0;
        }
      }

      // Get editable root node, normally the body element but sometimes a div or span
      editableRoot = getEditableRoot(dom, container);

      // If there is no editable root then enter is done inside a contentEditable false element
      if (!editableRoot) {
        return;
      }

      // If editable root isn't block nor the root of the editor
      if (!dom.isBlock(editableRoot) && editableRoot != dom.getRoot()) {
        if (!newBlockName || shiftKey) {
          insertBr(editor, evt);
        }

        return;
      }

      // Wrap the current node and it's sibling in a default block if it's needed.
      // for example this <td>text|<b>text2</b></td> will become this <td><p>text|<b>text2</p></b></td>
      // This won't happen if root blocks are disabled or the shiftKey is pressed
      if ((newBlockName && !shiftKey) || (!newBlockName && shiftKey)) {
        container = wrapSelfAndSiblingsInDefaultBlock(editor, newBlockName, rng, container, offset);
      }

      // Find parent block and setup empty block paddings
      parentBlock = dom.getParent(container, dom.isBlock);
      containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;

      // Setup block names
      parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
      containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

      // Enter inside block contained within a LI then split or insert before/after LI
      if (containerBlockName == 'LI' && !evt.ctrlKey) {
        parentBlock = containerBlock;
        containerBlock = containerBlock.parentNode;
        parentBlockName = containerBlockName;
      }

      // Handle enter in list item
      if (/^(LI|DT|DD)$/.test(parentBlockName)) {
        if (!newBlockName && shiftKey) {
          insertBr(editor, evt);
          return;
        }

        // Handle enter inside an empty list item
        if (dom.isEmpty(parentBlock)) {
          handleEmptyListItem();
          return;
        }
      }

      // Don't split PRE tags but insert a BR instead easier when writing code samples etc
      if (parentBlockName == 'PRE' && settings.br_in_pre !== false) {
        if (!shiftKey) {
          insertBr(editor, evt);
          return;
        }
      } else {
        // If no root block is configured then insert a BR by default or if the shiftKey is pressed
        if ((!newBlockName && !shiftKey && parentBlockName != 'LI') || (newBlockName && shiftKey)) {
          insertBr(editor, evt);
          return;
        }
      }

      // If parent block is root then never insert new blocks
      if (newBlockName && parentBlock === editor.getBody()) {
        return;
      }

      // Default block name if it's not configured
      newBlockName = newBlockName || 'P';

      // Insert new block before/after the parent block depending on caret location
      if (CaretContainer.isCaretContainerBlock(parentBlock)) {
        newBlock = CaretContainer.showCaretContainerBlock(parentBlock);
        if (dom.isEmpty(parentBlock)) {
          emptyBlock(parentBlock);
        }
        moveToCaretPosition(newBlock);
      } else if (isCaretAtStartOrEndOfBlock()) {
        insertNewBlockAfter();
      } else if (isCaretAtStartOrEndOfBlock(true)) {
        // Insert new block before
        newBlock = parentBlock.parentNode.insertBefore(createNewBlock(), parentBlock);

        // Adjust caret position if HR
        containerAndSiblingName(parentBlock, 'HR') ? moveToCaretPosition(newBlock) : moveToCaretPosition(parentBlock);
      } else {
        // Extract after fragment and insert it after the current block
        tmpRng = includeZwspInRange(rng).cloneRange();
        tmpRng.setEndAfter(parentBlock);
        fragment = tmpRng.extractContents();
        trimLeadingLineBreaks(fragment);
        newBlock = fragment.firstChild;
        dom.insertAfter(fragment, parentBlock);
        trimInlineElementsOnLeftSideOfBlock(dom, nonEmptyElementsMap, newBlock);
        addBrToBlockIfNeeded(dom, parentBlock);

        if (dom.isEmpty(parentBlock)) {
          emptyBlock(parentBlock);
        }

        newBlock.normalize();

        // New block might become empty if it's <p><b>a |</b></p>
        if (dom.isEmpty(newBlock)) {
          dom.remove(newBlock);
          insertNewBlockAfter();
        } else {
          moveToCaretPosition(newBlock);
        }
      }

      dom.setAttrib(newBlock, 'id', ''); // Remove ID since it needs to be document unique

      // Allow custom handling of new blocks
      editor.fire('NewBlock', { newBlock: newBlock });
    };

    return {
      insert: insert
    };
  }
);
