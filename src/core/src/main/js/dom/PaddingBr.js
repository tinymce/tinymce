/**
 * PaddingBr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.PaddingBr',
  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.dom.ElementType'
  ],
  function (Arr, Insert, Remove, Element, Node, Text, SelectorFilter, Traverse, ElementType) {
    var getLastChildren = function (elm) {
      var children = [], rawNode = elm.dom();

      while (rawNode) {
        children.push(Element.fromDom(rawNode));
        rawNode = rawNode.lastChild;
      }

      return children;
    };

    var removeTrailingBr = function (elm) {
      var allBrs = SelectorFilter.descendants(elm, 'br');
      var brs = Arr.filter(getLastChildren(elm).slice(-1), ElementType.isBr);
      if (allBrs.length === brs.length) {
        Arr.each(brs, Remove.remove);
      }
    };

    var fillWithPaddingBr = function (elm) {
      Remove.empty(elm);
      Insert.append(elm, Element.fromHtml('<br data-mce-bogus="1">'));
    };

    var isPaddingContents = function (elm) {
      return Node.isText(elm) ? Text.get(elm) === '\u00a0' : ElementType.isBr(elm);
    };

    var isPaddedElement = function (elm) {
      return Arr.filter(Traverse.children(elm), isPaddingContents).length === 1;
    };

    var trimBlockTrailingBr = function (elm) {
      Traverse.lastChild(elm).each(function (lastChild) {
        Traverse.prevSibling(lastChild).each(function (lastChildPrevSibling) {
          if (ElementType.isBlock(elm) && ElementType.isBr(lastChild) && ElementType.isBlock(lastChildPrevSibling)) {
            Remove.remove(lastChild);
          }
        });
      });
    };

    return {
      removeTrailingBr: removeTrailingBr,
      fillWithPaddingBr: fillWithPaddingBr,
      isPaddedElement: isPaddedElement,
      trimBlockTrailingBr: trimBlockTrailingBr
    };
  }
);