/**
 * RangeUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains a few utility methods for ranges.
 *
 * @class tinymce.dom.RangeUtils
 */
define(
  'tinymce.core.api.dom.RangeUtils',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.selection.CaretRangeFromPoint',
    'tinymce.core.selection.NormalizeRange',
    'tinymce.core.selection.RangeCompare',
    'tinymce.core.selection.RangeNodes',
    'tinymce.core.selection.RangeWalk',
    'tinymce.core.selection.SplitRange'
  ],
  function (Fun, CaretRangeFromPoint, NormalizeRange, RangeCompare, RangeNodes, RangeWalk, SplitRange) {
    var RangeUtils = function (dom) {
      /**
       * Walks the specified range like object and executes the callback for each sibling collection it finds.
       *
       * @private
       * @method walk
       * @param {Object} rng Range like object.
       * @param {function} callback Callback function to execute for each sibling collection.
       */
      var walk = function (rng, callback) {
        return RangeWalk.walk(dom, rng, callback);
      };

      /**
       * Splits the specified range at it's start/end points.
       *
       * @private
       * @param {Range/RangeObject} rng Range to split.
       * @return {Object} Range position object.
       */
      var split = SplitRange.split;

      /**
       * Normalizes the specified range by finding the closest best suitable caret location.
       *
       * @private
       * @param {Range} rng Range to normalize.
       * @return {Boolean} True/false if the specified range was normalized or not.
       */
      var normalize = function (rng) {
        return NormalizeRange.normalize(dom, rng).fold(
          Fun.constant(false),
          function (normalizedRng) {
            rng.setStart(normalizedRng.startContainer, normalizedRng.startOffset);
            rng.setEnd(normalizedRng.endContainer, normalizedRng.endOffset);
            return true;
          }
        );
      };

      return {
        walk: walk,
        split: split,
        normalize: normalize
      };
    };

    /**
     * Compares two ranges and checks if they are equal.
     *
     * @static
     * @method compareRanges
     * @param {DOMRange} rng1 First range to compare.
     * @param {DOMRange} rng2 First range to compare.
     * @return {Boolean} true/false if the ranges are equal.
     */
    RangeUtils.compareRanges = RangeCompare.isEq;

    /**
     * Gets the caret range for the given x/y location.
     *
     * @static
     * @method getCaretRangeFromPoint
     * @param {Number} clientX X coordinate for range
     * @param {Number} clientY Y coordinate for range
     * @param {Document} doc Document that x/y are relative to
     * @returns {Range} caret range
     */
    RangeUtils.getCaretRangeFromPoint = CaretRangeFromPoint.fromPoint;

    RangeUtils.getSelectedNode = RangeNodes.getSelectedNode;
    RangeUtils.getNode = RangeNodes.getNode;

    return RangeUtils;
  }
);
