/**
 * RangeNormalizer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.RangeNormalizer',
  [
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.NodeType'
  ],
  function (CaretFinder, CaretPosition, CaretUtils, NodeType) {
    var isTextBlock = function (elm) {
      return NodeType.isElement(elm) && /^(P|H[1-6]|DIV)$/.test(elm.nodeName);
    };

    var matchEndContainer = function (rng, predicate) {
      return predicate(rng.endContainer);
    };

    var createRange = function (sc, so, ec, eo) {
      var rng = document.createRange();
      rng.setStart(sc, so);
      rng.setEnd(ec, eo);
      return rng;
    };

    // If you tripple click a paragraph in this case:
    //   <blockquote><p>a</p></blockquote><p>b</p>
    // It would become this range in webkit:
    //   <blockquote><p>[a</p></blockquote><p>]b</p>
    // We would want it to be:
    //   <blockquote><p>[a]</p></blockquote><p>b</p>
    // Since it would otherwise produces spans out of thin air on insertContent for example.
    var normalizeBlockSelection = function (rng) {
      var startPos = CaretPosition.fromRangeStart(rng);
      var endPos = CaretPosition.fromRangeEnd(rng);
      var rootNode = rng.commonAncestorContainer;

      if (rng.collapsed === false && matchEndContainer(rng, isTextBlock) && rng.endOffset === 0) {
        return CaretFinder.fromPosition(false, rootNode, endPos)
          .map(function (newEndPos) {
            if (!CaretUtils.isInSameBlock(startPos, endPos, rootNode) && CaretUtils.isInSameBlock(startPos, newEndPos, rootNode)) {
              return createRange(startPos.container(), startPos.offset(), newEndPos.container(), newEndPos.offset());
            } else {
              return rng;
            }
          }).getOr(rng);
      } else {
        return rng;
      }
    };

    var normalize = function (rng) {
      return normalizeBlockSelection(rng);
    };

    return {
      normalize: normalize
    };
  }
);