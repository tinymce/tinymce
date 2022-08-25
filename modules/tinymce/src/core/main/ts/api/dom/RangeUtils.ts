import { Fun } from '@ephox/katamari';

import { expandRng } from 'tinymce/core/fmt/ExpandRange';

import * as CaretRangeFromPoint from '../../selection/CaretRangeFromPoint';
import * as NormalizeRange from '../../selection/NormalizeRange';
import * as RangeCompare from '../../selection/RangeCompare';
import * as RangeNodes from '../../selection/RangeNodes';
import { RangeLikeObject } from '../../selection/RangeTypes';
import * as RangeWalk from '../../selection/RangeWalk';
import * as SplitRange from '../../selection/SplitRange';
import Editor from '../Editor';

interface RangeUtils {
  walk: (rng: Range, callback: (nodes: Node[]) => void) => void;
  split: (rng: Range) => RangeLikeObject;
  normalize: (rng: Range) => boolean;
  expand: (range: Range, options?: { type: 'word' }) => Range;
}

/**
 * This class contains a few utility methods for ranges.
 *
 * @class tinymce.dom.RangeUtils
 */
const RangeUtils = (editor: Editor): RangeUtils => {
  const dom = editor.dom;
  /**
   * Walks the specified range like object and executes the callback for each sibling collection it finds.
   *
   * @private
   * @method walk
   * @param {RangeObject} rng Range like object.
   * @param {Function} callback Callback function to execute for each sibling collection.
   */
  const walk = (rng: RangeLikeObject, callback: (nodes: Node[]) => void) => {
    return RangeWalk.walk(dom, rng, callback);
  };

  /**
   * Splits the specified range at it's start/end points.
   *
   * @private
   * @param {RangeObject} rng Range to split.
   * @return {RangeObject} Range position object.
   */
  const split = SplitRange.split;

  /**
   * Normalizes the specified range by finding the closest best suitable caret location.
   *
   * @private
   * @param {Range} rng Range to normalize.
   * @return {Boolean} True or false if the specified range was normalized or not.
   */
  const normalize = (rng: Range): boolean => {
    return NormalizeRange.normalize(dom, rng).fold(
      Fun.never,
      (normalizedRng) => {
        rng.setStart(normalizedRng.startContainer, normalizedRng.startOffset);
        rng.setEnd(normalizedRng.endContainer, normalizedRng.endOffset);
        return true;
      }
    );
  };

  /**
   * Expands the range of the selection to contain the entire when nothing is selected
   *
   * @method expand
   * @param {Range} range The initial range to work from.
   * @param {Object} options Optional options provided to the expansion. Defaults to { type: 'word' }
   * @return {Range} Returns the expanded range.
   */
  const expand = (range: Range, options: { type: 'word' } = { type: 'word' }): Range => {
    if (options.type === 'word') {
      const rangeLike = expandRng(editor, range, [{ inline: 'span' }]);
      const newRange = dom.createRng();
      newRange.setStart(rangeLike.startContainer, rangeLike.startOffset);
      newRange.setEnd(rangeLike.endContainer, rangeLike.endOffset);

      return newRange;
    }

    return range;
  };

  return {
    walk,
    split,
    expand,
    normalize
  };
};

/**
 * Compares two ranges and checks if they are equal.
 *
 * @static
 * @method compareRanges
 * @param {RangeObject} rng1 First range to compare.
 * @param {RangeObject} rng2 First range to compare.
 * @return {Boolean} True or false if the ranges are equal.
 */
RangeUtils.compareRanges = RangeCompare.isEq;

/**
 * Gets the caret range for the given x/y location.
 *
 * @static
 * @method getCaretRangeFromPoint
 * @param {Number} clientX X coordinate for range
 * @param {Number} clientY Y coordinate for range
 * @param {Document} doc Document that the x and y coordinates are relative to
 * @returns {Range} Caret range
 */
RangeUtils.getCaretRangeFromPoint = CaretRangeFromPoint.fromPoint;

RangeUtils.getSelectedNode = RangeNodes.getSelectedNode;
RangeUtils.getNode = RangeNodes.getNode;

export default RangeUtils;
