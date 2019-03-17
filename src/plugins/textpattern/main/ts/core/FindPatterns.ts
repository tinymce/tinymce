/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Option, Strings } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Tools from 'tinymce/core/api/util/Tools';
import { BlockPattern, InlinePattern, Pattern } from '../api/Pattern';
import { generatePathRange, isElement, isText, PathRange, resolvePathRange } from './PathRange';

export interface Spot {
  node: Text;
  offset: number;
}

export interface InlinePatternMatch {
  pattern: InlinePattern;
  range: PathRange;
}

// Finds a matching pattern to the specified text
const findPattern = <P extends Pattern>(patterns: P[], text: string): P => {
  for (let i = 0; i < patterns.length; i++) {
    const pattern: any = patterns[i];
    if (text.indexOf(pattern.start) !== 0) {
      continue;
    }

    if (pattern.end && text.lastIndexOf(pattern.end) !== (text.length - pattern.end.length)) {
      continue;
    }

    return pattern;
  }
};

const textBefore = (node: Node, offset: number, block: Node): Option<Spot> => {
  if (isText(node) && offset > 0) {
    return Option.some({node, offset});
  }
  let startNode: Node;
  if (offset > 0) {
    startNode = node.childNodes[offset - 1];
  } else {
    for (let current = node; current && current !== block && !startNode; current = current.parentNode) {
      startNode = current.previousSibling;
    }
  }
  const tw = new TreeWalker(startNode, block);
  for (let current = tw.current(); current; current = tw.prev()) {
    if (isText(current) && current.length > 0) {
      return Option.some({node: current, offset: current.length});
    }
  }
  return Option.none();
};

const findInlinePatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Text, offset: number, block: Node, requireGap = false): Option<Spot> => {
  if (pattern.start.length === 0 && !requireGap) {
    return Option.some({
      node,
      offset,
    });
  }
  const sameBlockParent = (spot: Spot) => dom.getParent(spot.node, dom.isBlock) === block;
  return textBefore(node, offset, block).filter(sameBlockParent).bind(({node, offset}) => {
    const text = node.data.substring(0, offset);
    const startPos = text.lastIndexOf(pattern.start);
    if (startPos === -1) {
      if (text.indexOf(pattern.end) !== -1) {
        return Option.none(); // would create ambiguous range so deny
      }
      return findInlinePatternStart(dom, pattern, node, 0, block, requireGap && text.length === 0);
    }
    if (text.indexOf(pattern.end, startPos + pattern.start.length) !== -1) {
      return Option.none(); // would create ambiguous range so deny
    }
    if (requireGap && startPos + pattern.start.length === text.length) {
      return Option.none(); // would not leave gap so deny
    }
    return Option.some({
      node,
      offset: startPos,
    });
  });
};

// Assumptions:
// 0. Patterns are sorted by priority so we should preferentially match earlier entries
// 1. Patterns may be nested but may only occur once
// 2. Patterns will not have matching prefixes which contain space or standard punctuation ',', '.', ';', ':', '!', '?'
// 3. Patterns will not extend outside of the root element
// 4. A pattern start or pattern end will be self-contained in one text node
// 5. All pattern ends must be directly before the cursor (represented by node + offset)
// 6. Only text nodes matter
const findInlinePatternRec = (dom: DOMUtils, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<InlinePatternMatch[]> => {
  return textBefore(node, offset, block).bind(({node: endNode, offset: endOffset}) => {
    const text = endNode.data.substring(0, endOffset);
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }
      const newOffset = endOffset - pattern.end.length;
      // when the pattern only has a start or end we don't want to try to match inner patterns
      const hasContent = pattern.start.length > 0 && pattern.end.length > 0;
      const allowInner = hasContent ? Option.some(true) : Option.none();
      const recursiveMatch = allowInner.bind(() => {
        const patternsWithoutCurrent = patterns.slice();
        patternsWithoutCurrent.splice(i, 1);
        return findInlinePatternRec(dom, patternsWithoutCurrent, endNode, newOffset, block);
      }).fold(() => {
        const start = findInlinePatternStart(dom, pattern, endNode, newOffset, block, hasContent);
        return start.map(({node: startNode, offset: startOffset}) => {
          const range = generatePathRange(dom.getRoot(), startNode, startOffset, endNode, endOffset).getOrDie('Internal constraint violation');
          return [{ pattern, range }];
        });
      }, (areas) => {
        const outermostRange = resolvePathRange(dom.getRoot(), areas[areas.length - 1].range).getOrDie('Internal constraint violation');
        const start = findInlinePatternStart(dom, pattern, outermostRange.startNode, outermostRange.startOffset, block);
        return start.map(({node: startNode, offset: startOffset}) => {
          const range = generatePathRange(dom.getRoot(), startNode, startOffset, endNode, endOffset).getOrDie('Internal constraint violation');
          return areas.concat([{ pattern, range }]);
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
  const walker = new TreeWalker(block, block);
  let node: Node;
  let firstTextNode: Text;
  while ((node = walker.next())) {
    if (isText(node)) {
      firstTextNode = node;
      break;
    }
  }
  if (!firstTextNode) {
    return Option.none();
  }
  const pattern = findPattern(patterns, firstTextNode.data);
  if (!pattern) {
    return Option.none();
  }
  if (Tools.trim(block.textContent).length === pattern.start.length) {
    return Option.none();
  }
  return Option.some(pattern);
};

export { textBefore, findPattern, findBlockPattern, findNestedInlinePatterns, };
