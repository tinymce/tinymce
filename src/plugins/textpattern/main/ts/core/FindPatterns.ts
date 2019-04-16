/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Option, Strings, Fun } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import { BlockPattern, InlinePattern, Pattern } from '../api/Pattern';
import { convertPathRangeToRange, convertRangeToPathRange, generatePathRange, isElement, isText, PathRange } from './PathRange';
import { DomGather, Spot, SpotPoint, DomDescent } from '@ephox/phoenix';
import { Compare, Element, Node as SugarNode, Text as SugarText } from '@ephox/sugar';
import { DomTextSearch } from '@ephox/robin';

export interface InlinePatternMatch {
  pattern: InlinePattern;
  start: PathRange;
  end: PathRange;
}

// Finds a matching pattern to the specified text
const findPattern = <P extends Pattern>(patterns: P[], text: string): Option<P> => {
  for (let i = 0; i < patterns.length; i++) {
    const pattern: any = patterns[i];
    if (text.indexOf(pattern.start) !== 0) {
      continue;
    }

    if (pattern.end && text.lastIndexOf(pattern.end) !== (text.length - pattern.end.length)) {
      continue;
    }

    return Option.some(pattern);
  }

  return Option.none();
};

const textBefore = (node: Node, offset: number, isRoot: (e: Element) => boolean = Fun.constant(true)): Option<SpotPoint<Text>> => {
  if (isText(node) && offset > 0) {
    return Option.some(Spot.point(node, offset));
  } else {
    const spot = DomDescent.toLeaf(Element.fromDom(node), offset);
    if (isText(spot.element().dom())) {
      return Option.some(Spot.point(spot.element().dom(), spot.offset()));
    } else {
      return DomGather.before(spot.element(), isRoot).map((e) => {
        return Spot.point(e.dom(), e.dom().length);
      });
    }
  }
};

const findInlinePatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Node, offset: number, block: Element, requireGap = false): Option<Range> => {
  if (pattern.start.length === 0 && !requireGap) {
    const rng = dom.createRng();
    rng.setStart(node, offset);
    rng.setEnd(node, offset);
    return Option.some(rng);
  }

  const process = (universe, phase, element: Element, text: string, optOffset: Option<number>) => {
    // Abort if the element is outside the block
    if (Compare.eq(element, block)) {
      return phase.abort();
    }

    const searchText = text.substring(0, optOffset.getOr(text.length));
    const startEndIndex = searchText.lastIndexOf(pattern.start.charAt(pattern.start.length - 1));
    const startIndex = searchText.lastIndexOf(pattern.start);
    if (startIndex !== -1) {
      // Complete start string found
      const rng = dom.createRng();
      rng.setStart(element.dom(), startIndex);
      rng.setEnd(element.dom(), startIndex + pattern.start.length);
      return phase.finish(rng);
    } else if (startEndIndex !== -1) {
      // Potential partial string found, so lean left to see if the start pattern exists over fragmented text nodes
      return leanLeft(element.dom(), startEndIndex + 1 - pattern.start.length, (e: Element) => Compare.eq(e, block)).fold(
        () => phase.kontinue(),
        (spot) => {
          // Build up the range between the last char and the first char
          const rng = dom.createRng();
          rng.setStart(spot.element(), spot.offset());
          rng.setEnd(element.dom(), startEndIndex + 1);

          // Ensure the range content matches the start
          if (rng.toString() === pattern.start) {
            return phase.finish(rng);
          } else {
            return phase.kontinue();
          }
        }
      );
    } else {
      // No match in current node, so continue
      return phase.kontinue();
    }
  };

  return textBefore(node, offset, (e) => Compare.eq(e, block)).bind((spot) => {
    const start = DomTextSearch.repeatLeft(Element.fromDom(spot.element()), spot.offset(), process).fold(Option.none, Option.none, Option.some);
    return start.bind((startRange: Range) => {
      if (requireGap) {
        if (startRange.endContainer === spot.element() && startRange.endOffset === spot.offset()) {
          return Option.none();
        } else if (spot.offset() === 0 && (startRange.endContainer as Text).data.length === startRange.endOffset) {
          return Option.none();
        }
      }

      return Option.some(startRange);
    });
  });
};

// TODO: Should this be in robin?
const scanLeft = (node: Element, offset: number, isRoot): Option<SpotPoint<Element>> => {
  if (!SugarNode.isText(node)) {
    return Option.none();
  }
  const text = SugarText.get(node);
  if (offset >= 0 && offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    return DomGather.seekLeft(node, SugarNode.isText, isRoot).bind((prev) => {
      const text = SugarText.get(prev);
      return scanLeft(prev, offset + text.length, isRoot);
    });
  }
};

const leanLeft = (node: Text, offset: number, isRoot: (e: Element) => boolean): Option<SpotPoint<Text>> => {
  if (offset < 0) {
    return scanLeft(Element.fromDom(node), offset, isRoot).map((e) => {
      return Spot.point(e.element().dom(), e.offset());
    });
  } else {
    return Option.some(Spot.point(node, offset));
  }
};

// Assumptions:
// 0. Patterns are sorted by priority so we should preferentially match earlier entries
// 1. Patterns may be nested but may only occur once
// 2. Patterns will not have matching prefixes which contain space or standard punctuation ',', '.', ';', ':', '!', '?'
// 3. Patterns will not extend outside of the root element
// 4. All pattern ends must be directly before the cursor (represented by node + offset)
// 5. Only text nodes matter
const findInlinePatternRec = (dom: DOMUtils, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<InlinePatternMatch[]> => {
  const blockEle = Element.fromDom(block);
  const isRoot = (e: Element) => Compare.eq(e, blockEle);
  return textBefore(node, offset).bind((endSpot) => {
    const rng = dom.createRng();
    rng.setStart(block, 0);
    rng.setEnd(node, offset);
    const text = rng.toString();
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }

      // Lean left to find the start of the end pattern, as it could be across fragmented nodes
      const recursiveMatch = leanLeft(endSpot.element(), endSpot.offset() - pattern.end.length, isRoot).bind((spot) => {
        // Build up the end pattern range
        const newOffset = spot.offset();
        const newNode = spot.element();
        const endRng = generatePathRange(dom.getRoot(), spot.element(), spot.offset(), endSpot.element(), endSpot.offset()).getOrDie('Internal constraint violation');

        // when the pattern only has a start or end we don't want to try to match inner patterns
        const hasContent = pattern.start.length > 0 && pattern.end.length > 0;
        const allowInner = hasContent ? Option.some(true) : Option.none();
        return allowInner.bind(() => {
          // Check to see if we have any nested patterns
          const patternsWithoutCurrent = patterns.slice();
          patternsWithoutCurrent.splice(i, 1);
          return findInlinePatternRec(dom, patternsWithoutCurrent, newNode, newOffset, block);
        }).fold(() => {
          // No recursive inline patterns, so start searching from the current position
          const start = findInlinePatternStart(dom, pattern, newNode, newOffset, blockEle, hasContent);
          return start.map((startRng): InlinePatternMatch[] => {
            const start = convertRangeToPathRange(dom.getRoot(), startRng).getOrDie('Internal constraint violation');
            return [{ pattern, start, end: endRng }];
          });
        }, (areas) => {
          // Recursive patterns found, so get the left most position and try to find the start of the current pattern from there
          const outermostRange = convertPathRangeToRange(dom.getRoot(), areas[areas.length - 1].start).getOrDie('Internal constraint violation');
          const start = findInlinePatternStart(dom, pattern, outermostRange.startContainer, outermostRange.startOffset, blockEle);
          return start.map((startRng): InlinePatternMatch[] => {
            const start = convertRangeToPathRange(dom.getRoot(), startRng).getOrDie('Internal constraint violation');
            return areas.concat([{ pattern, start, end: endRng }]);
          });
        });
      });

      if (recursiveMatch.isSome()) {
        return recursiveMatch;
      }
    }

    return Option.none();
  });
};

const findNestedInlinePatterns = (dom: DOMUtils, patterns: InlinePattern[], rng: Range, space: boolean): InlinePatternMatch[] => {
  if (rng.collapsed === false) {
    return [];
  }

  const block = dom.getParent(rng.startContainer, dom.isBlock);

  return findInlinePatternRec(dom, patterns, rng.startContainer, rng.startOffset - (space ? 1 : 0), block).getOr([]);
};

const findBlockPattern = (dom: DOMUtils, patterns: BlockPattern[], rng: Range): Option<BlockPattern> => {
  const block = dom.getParent(rng.startContainer, dom.isBlock);

  if (!(dom.is(block, 'p') && isElement(block))) {
    return Option.none();
  }

  const blockText = block.textContent;

  const pattern = findPattern(patterns, blockText);
  return pattern.bind((p) => {
    if (Tools.trim(blockText).length === p.start.length) {
      return Option.none();
    }

    return Option.some(p);
  });
};

export { textBefore, findPattern, findBlockPattern, findNestedInlinePatterns, };
