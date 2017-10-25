/**
 * InsertList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles inserts of lists into the editor instance.
 *
 * @class tinymce.InsertList
 * @private
 */
define(
  'tinymce.core.InsertList',
  [
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.NodeType',
    'tinymce.core.util.Tools'
  ],
  function (CaretPosition, CaretWalker, NodeType, Tools) {
    var hasOnlyOneChild = function (node) {
      return node.firstChild && node.firstChild === node.lastChild;
    };

    var isPaddingNode = function (node) {
      return node.name === 'br' || node.value === '\u00a0';
    };

    var isPaddedEmptyBlock = function (schema, node) {
      var blockElements = schema.getBlockElements();
      return blockElements[node.name] && hasOnlyOneChild(node) && isPaddingNode(node.firstChild);
    };

    var isEmptyFragmentElement = function (schema, node) {
      var nonEmptyElements = schema.getNonEmptyElements();
      return node && (node.isEmpty(nonEmptyElements) || isPaddedEmptyBlock(schema, node));
    };

    var isListFragment = function (schema, fragment) {
      var firstChild = fragment.firstChild;
      var lastChild = fragment.lastChild;

      // Skip meta since it's likely <meta><ul>..</ul>
      if (firstChild && firstChild.name === 'meta') {
        firstChild = firstChild.next;
      }

      // Skip mce_marker since it's likely <ul>..</ul><span id="mce_marker"></span>
      if (lastChild && lastChild.attr('id') === 'mce_marker') {
        lastChild = lastChild.prev;
      }

      // Skip last child if it's an empty block
      if (isEmptyFragmentElement(schema, lastChild)) {
        lastChild = lastChild.prev;
      }

      if (!firstChild || firstChild !== lastChild) {
        return false;
      }

      return firstChild.name === 'ul' || firstChild.name === 'ol';
    };

    var cleanupDomFragment = function (domFragment) {
      var firstChild = domFragment.firstChild;
      var lastChild = domFragment.lastChild;

      // TODO: remove the meta tag from paste logic
      if (firstChild && firstChild.nodeName === 'META') {
        firstChild.parentNode.removeChild(firstChild);
      }

      if (lastChild && lastChild.id === 'mce_marker') {
        lastChild.parentNode.removeChild(lastChild);
      }

      return domFragment;
    };

    var toDomFragment = function (dom, serializer, fragment) {
      var html = serializer.serialize(fragment);
      var domFragment = dom.createFragment(html);

      return cleanupDomFragment(domFragment);
    };

    var listItems = function (elm) {
      return Tools.grep(elm.childNodes, function (child) {
        return child.nodeName === 'LI';
      });
    };

    var isPadding = function (node) {
      return node.data === '\u00a0' || NodeType.isBr(node);
    };

    var isListItemPadded = function (node) {
      return node && node.firstChild && node.firstChild === node.lastChild && isPadding(node.firstChild);
    };

    var isEmptyOrPadded = function (elm) {
      return !elm.firstChild || isListItemPadded(elm);
    };

    var trimListItems = function (elms) {
      return elms.length > 0 && isEmptyOrPadded(elms[elms.length - 1]) ? elms.slice(0, -1) : elms;
    };

    var getParentLi = function (dom, node) {
      var parentBlock = dom.getParent(node, dom.isBlock);
      return parentBlock && parentBlock.nodeName === 'LI' ? parentBlock : null;
    };

    var isParentBlockLi = function (dom, node) {
      return !!getParentLi(dom, node);
    };

    var getSplit = function (parentNode, rng) {
      var beforeRng = rng.cloneRange();
      var afterRng = rng.cloneRange();

      beforeRng.setStartBefore(parentNode);
      afterRng.setEndAfter(parentNode);

      return [
        beforeRng.cloneContents(),
        afterRng.cloneContents()
      ];
    };

    var findFirstIn = function (node, rootNode) {
      var caretPos = CaretPosition.before(node);
      var caretWalker = new CaretWalker(rootNode);
      var newCaretPos = caretWalker.next(caretPos);

      return newCaretPos ? newCaretPos.toRange() : null;
    };

    var findLastOf = function (node, rootNode) {
      var caretPos = CaretPosition.after(node);
      var caretWalker = new CaretWalker(rootNode);
      var newCaretPos = caretWalker.prev(caretPos);

      return newCaretPos ? newCaretPos.toRange() : null;
    };

    var insertMiddle = function (target, elms, rootNode, rng) {
      var parts = getSplit(target, rng);
      var parentElm = target.parentNode;

      parentElm.insertBefore(parts[0], target);
      Tools.each(elms, function (li) {
        parentElm.insertBefore(li, target);
      });
      parentElm.insertBefore(parts[1], target);
      parentElm.removeChild(target);

      return findLastOf(elms[elms.length - 1], rootNode);
    };

    var insertBefore = function (target, elms, rootNode) {
      var parentElm = target.parentNode;

      Tools.each(elms, function (elm) {
        parentElm.insertBefore(elm, target);
      });

      return findFirstIn(target, rootNode);
    };

    var insertAfter = function (target, elms, rootNode, dom) {
      dom.insertAfter(elms.reverse(), target);
      return findLastOf(elms[0], rootNode);
    };

    var insertAtCaret = function (serializer, dom, rng, fragment) {
      var domFragment = toDomFragment(dom, serializer, fragment);
      var liTarget = getParentLi(dom, rng.startContainer);
      var liElms = trimListItems(listItems(domFragment.firstChild));
      var BEGINNING = 1, END = 2;
      var rootNode = dom.getRoot();

      var isAt = function (location) {
        var caretPos = CaretPosition.fromRangeStart(rng);
        var caretWalker = new CaretWalker(dom.getRoot());
        var newPos = location === BEGINNING ? caretWalker.prev(caretPos) : caretWalker.next(caretPos);

        return newPos ? getParentLi(dom, newPos.getNode()) !== liTarget : true;
      };

      if (isAt(BEGINNING)) {
        return insertBefore(liTarget, liElms, rootNode);
      } else if (isAt(END)) {
        return insertAfter(liTarget, liElms, rootNode, dom);
      }

      return insertMiddle(liTarget, liElms, rootNode, rng);
    };

    return {
      isListFragment: isListFragment,
      insertAtCaret: insertAtCaret,
      isParentBlockLi: isParentBlockLi,
      trimListItems: trimListItems,
      listItems: listItems
    };
  }
);