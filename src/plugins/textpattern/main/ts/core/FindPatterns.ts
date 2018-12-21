/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Node, Text } from '@ephox/dom-globals';
import { InlinePattern, Pattern, BlockPattern } from '../api/Pattern';
import NodeType from 'tinymce/core/dom/NodeType';
import { Option, Strings } from '@ephox/katamari';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { PathRange, generatePathRange, resolvePathRange } from './PathRange';
import Tools from '../../../../../core/main/ts/api/util/Tools';

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

// const isMatchingPattern = (pattern: InlinePattern, text: string, offset: number, delta: 0 | 1): boolean => {
//   const textEnd = text.substr(offset - pattern.end.length - delta, pattern.end.length);
//   return textEnd === pattern.end;
// };

// const hasContent = (offset: number, delta: number, pattern: InlinePattern) => {
//   return (offset - delta - pattern.end.length - pattern.start.length) > 0;
// };

// // Finds the best matching end pattern
// const findEndPattern = (patterns: InlinePattern[], text: string, offset: number, delta: 0 | 1) => {
//   // Find best matching end
//   for (let i = 0; i < patterns.length; i++) {
//     const pattern = patterns[i];
//     if (pattern.end !== undefined && isMatchingPattern(pattern, text, offset, delta) && hasContent(offset, delta, pattern)) {
//       return pattern;
//     }
//   }
// };

// const findInlinePattern = (patterns: InlinePattern[], rng: Range, space: boolean) => {
//   if (rng.collapsed === false) {
//     return;
//   }

//   const container = rng.startContainer;
//   if (!NodeType.isText(container)) {
//     return;
//   }

//   const text = container.data;
//   const delta = space === true ? 1 : 0;

//   // Find best matching end
//   const endPattern = findEndPattern(patterns, text, rng.startOffset, delta);
//   if (endPattern === undefined) {
//     return;
//   }

//   // Find start of matched pattern
//   let endOffset = text.lastIndexOf(endPattern.end, rng.startOffset - delta);
//   const startOffset = text.lastIndexOf(endPattern.start, endOffset - endPattern.end.length);
//   endOffset = text.indexOf(endPattern.end, startOffset + endPattern.start.length);

//   if (startOffset === -1) {
//     return;
//   }

//   // Setup a range for the matching word
//   const patternRng = document.createRange();
//   patternRng.setStart(container, startOffset);
//   patternRng.setEnd(container, endOffset + endPattern.end.length);

//   const startPattern = findPattern(patterns, patternRng.toString());

//   if (endPattern === undefined || startPattern !== endPattern || (container.data.length <= endPattern.start.length + endPattern.end.length)) {
//     return;
//   }

//   return {
//     pattern: endPattern,
//     startOffset,
//     endOffset
//   };
// };

interface Spot {
  node: Text;
  offset: number;
}

export interface PatternArea {
  pattern: InlinePattern;
  range: PathRange;
}

const descFirst = (node: Node): Node => {
  if (node === null) {
    throw new Error('Can not descFirst on null node!');
  }
  let current = node;
  while (current.firstChild) {
    current = current.firstChild;
  }
  return current;
};

const descLast = (node: Node): Node => {
  if (node === null) {
    throw new Error('Can not descLast on null node!');
  }
  let current = node;
  while (current.lastChild) {
    current = current.lastChild;
  }
  return current;
};

const prevLeaf = (leaf: Node, root: Node): Option<Node> => {
  if (leaf === root) {
    return Option.none();
  }
  let current = leaf;
  while (true) {
    if (current.previousSibling) {
      return Option.some(descLast(current.previousSibling));
    } else {
      const parent = current.parentNode;
      if (parent === null || parent === root) {
        return Option.none();
      } else {
        current = parent;
      }
    }
  }
};

const textBefore = (node: Node, offset: number, block: Node): Option<Spot> => {
  // check we are at a leaf
  if (node.childNodes.length === 0) {
    if (NodeType.isText(node) && offset > 0) {
      return Option.some({node, offset});
    } else {
      return prevLeaf(node, block).bind(
        (leaf) => textBefore(leaf, NodeType.isText(leaf) ? leaf.length : 0, block));
    }
  } else {
    // convert node to leaf
    if (offset > 0) {
      const leaf = descLast(node.childNodes[offset - 1]);
      return textBefore(leaf, NodeType.isText(leaf) ? leaf.length : 0, block);
    } else {
      return textBefore(descFirst(node), 0, block);
    }
  }
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
const findInlinePatternRec = (dom: DOMUtils, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<PatternArea[]> => {
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

const findNestedInlinePatterns = (dom: DOMUtils, patterns: InlinePattern[], rng: Range, space: boolean): PatternArea[] => {
  if (rng.collapsed === false) {
    return [];
  }

  const block = dom.getParent(rng.startContainer, dom.isBlock);

  return findInlinePatternRec(dom, patterns, rng.startContainer, rng.startOffset - (space ? 1 : 0), block).getOr([]);
};

const findBlockPattern = (dom: DOMUtils, patterns: BlockPattern[], rng: Range): Option<BlockPattern> => {
  const block = dom.getParent(rng.startContainer, dom.isBlock);

  if (!(dom.is(block, 'p') && NodeType.isElement(block))) {
    return Option.none();
  }
  const walker = new TreeWalker(block, block);
  let node: Node;
  let firstTextNode: Text;
  while ((node = walker.next())) {
    if (NodeType.isText(node)) {
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

export {
  textBefore,
  findPattern,
  findBlockPattern,
  findNestedInlinePatterns,
};