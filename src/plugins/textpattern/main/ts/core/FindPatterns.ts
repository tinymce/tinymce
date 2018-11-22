/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InlinePattern, Pattern, ReplacementPattern } from '../api/Pattern';
import { document, Range, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

// Finds a matching pattern to the specified text
const findPattern = (patterns: Pattern[], text: string): Pattern => {
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

const isMatchingPattern = (pattern: InlinePattern, text: string, offset: number, delta: number): boolean => {
  const textEnd = text.substr(offset - pattern.end.length - delta, pattern.end.length);
  return textEnd === pattern.end;
};

const hasContent = (offset: number, delta: number, pattern: InlinePattern) => {
  return (offset - delta - pattern.end.length - pattern.start.length) > 0;
};

// Finds the best matching end pattern
const findEndPattern = (patterns, text, offset, delta) => {
  let pattern, i;

  // Find best matching end
  for (i = 0; i < patterns.length; i++) {
    pattern = patterns[i];
    if (pattern.end !== undefined && isMatchingPattern(pattern, text, offset, delta) && hasContent(offset, delta, pattern)) {
      return pattern;
    }
  }
};

const findInlinePattern = (patterns: InlinePattern[], rng: Range, space: boolean) => {
  if (rng.collapsed === false) {
    return;
  }

  const container = rng.startContainer as Text;
  const text = container.data;
  const delta = space === true ? 1 : 0;

  if (container.nodeType !== 3) {
    return;
  }

  // Find best matching end
  const endPattern = findEndPattern(patterns, text, rng.startOffset, delta);
  if (endPattern === undefined) {
    return;
  }

  // Find start of matched pattern
  let endOffset = text.lastIndexOf(endPattern.end, rng.startOffset - delta);
  const startOffset = text.lastIndexOf(endPattern.start, endOffset - endPattern.end.length);
  endOffset = text.indexOf(endPattern.end, startOffset + endPattern.start.length);

  if (startOffset === -1) {
    return;
  }

  // Setup a range for the matching word
  const patternRng = document.createRange();
  patternRng.setStart(container, startOffset);
  patternRng.setEnd(container, endOffset + endPattern.end.length);

  const startPattern = findPattern(patterns, patternRng.toString());

  if (endPattern === undefined || startPattern !== endPattern || (container.data.length <= endPattern.start.length + endPattern.end.length)) {
    return;
  }

  return {
    pattern: endPattern,
    startOffset,
    endOffset
  };
};

interface PatternMatch<T extends Pattern> {
  pattern: T;
  startOffset: number;
}

export type ReplacementMatch = PatternMatch<ReplacementPattern>;

const findReplacementPattern = (patterns: ReplacementPattern[], startSearch: number, text: string): Option<ReplacementMatch> => {
  for (let i = 0; i < patterns.length; i++) {
    const index = text.lastIndexOf(patterns[i].start, startSearch);
    if (index !== -1) {
      return Option.some({
        pattern: patterns[i],
        startOffset: index
      });
    }
  }
  return Option.none();
};

export {
  findPattern,
  findEndPattern,
  findInlinePattern,
  findReplacementPattern
};