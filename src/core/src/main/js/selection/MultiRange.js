/**
 * MultiRange.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.MultiRange',
  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'tinymce.core.selection.RangeNodes'
  ],
  function (Arr, Element, RangeNodes) {
    var getRanges = function (selection) {
      var ranges = [];

      for (var i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }

      return ranges;
    };

    var getSelectedNodes = function (ranges) {
      return Arr.bind(ranges, function (range) {
        var node = RangeNodes.getSelectedNode(range);
        return node ? [ Element.fromDom(node) ] : [];
      });
    };

    var hasMultipleRanges = function (selection) {
      return getRanges(selection).length > 1;
    };

    return {
      getRanges: getRanges,
      getSelectedNodes: getSelectedNodes,
      hasMultipleRanges: hasMultipleRanges
    };
  }
);
