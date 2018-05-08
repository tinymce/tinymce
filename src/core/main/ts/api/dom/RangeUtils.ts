/**
 * RangeUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import CaretRangeFromPoint from '../../selection/CaretRangeFromPoint';
import NormalizeRange from '../../selection/NormalizeRange';
import RangeCompare from '../../selection/RangeCompare';
import * as RangeNodes from '../../selection/RangeNodes';
import RangeWalk from '../../selection/RangeWalk';
import SplitRange from '../../selection/SplitRange';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';

/**
 * This class contains a few utility methods for ranges.
 *
 * @class tinymce.dom.RangeUtils
 */
export function RangeUtils(dom: DOMUtils) {
  /**
   * Walks the specified range like object and executes the callback for each sibling collection it finds.
   *
   * @private
   * @method walk
   * @param {Object} rng Range like object.
   * @param {function} callback Callback function to execute for each sibling collection.
   */
  const walk = function (rng, callback) {
    return RangeWalk.walk(dom, rng, callback);
  };

  /**
   * Splits the specified range at it's start/end points.
   *
   * @private
   * @param {Range/RangeObject} rng Range to split.
   * @return {Object} Range position object.
   */
  const split = SplitRange.split;

  /**
   * Normalizes the specified range by finding the closest best suitable caret location.
   *
   * @private
   * @param {Range} rng Range to normalize.
   * @return {Boolean} True/false if the specified range was normalized or not.
   */
  const normalize = function (rng: Range): boolean {
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
    walk,
    split,
    normalize
  };
}

export namespace RangeUtils {
  /**
   * Compares two ranges and checks if they are equal.
   *
   * @static
   * @method compareRanges
   * @param {DOMRange} rng1 First range to compare.
   * @param {DOMRange} rng2 First range to compare.
   * @return {Boolean} true/false if the ranges are equal.
   */
  export const compareRanges = RangeCompare.isEq;

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
  export const getCaretRangeFromPoint = CaretRangeFromPoint.fromPoint;

  export const getSelectedNode = RangeNodes.getSelectedNode;
  export const getNode = RangeNodes.getNode;
}

export default RangeUtils;