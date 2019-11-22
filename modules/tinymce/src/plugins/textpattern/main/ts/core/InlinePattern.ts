/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Id, Option, Strings } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import * as TextSearch from '../text/TextSearch';
import { createMarker, Marker, rangeFromMarker, removeMarker } from '../utils/Marker';
import { generatePathRange, generatePathRangeFromRange } from '../utils/PathRange';
import * as Spot from '../utils/Spot';
import * as Utils from '../utils/Utils';
import { InlinePattern, InlinePatternMatch } from './PatternTypes';

interface PatternDetails {
  pattern: InlinePattern;
  remainingPatterns: InlinePattern[];
  position: Spot.SpotPoint<Text>;
}

interface SearchResults {
  matches: InlinePatternMatch[];
  position: Spot.SpotPoint<Text>;
}

const matchesPattern = (dom: DOMUtils, block: Node, patternContent: string) => (element: Text, offset: number) => {
  const text = element.data;
  const searchText = text.substring(0, offset);
  const startEndIndex = searchText.lastIndexOf(patternContent.charAt(patternContent.length - 1));
  const startIndex = searchText.lastIndexOf(patternContent);
  if (startIndex !== -1) {
    // Complete string found
    return startIndex + patternContent.length;
  } else if (startEndIndex !== -1) {
    // Potential partial string found
    return startEndIndex + 1;
  } else {
    // No match in current node, so continue
    return -1;
  }
};

const findPatternStartFromSpot = (dom: DOMUtils, pattern: InlinePattern, block: Node, spot: Spot.SpotPoint<Text>): Option<Range> => {
  const startPattern = pattern.start;
  const startSpot = TextSearch.repeatLeft(dom, spot.container, spot.offset, matchesPattern(dom, block, startPattern), block);
  return startSpot.bind((spot) => {
    if (spot.offset >= startPattern.length) {
      // Complete match
      const rng = dom.createRng();
      rng.setStart(spot.container, spot.offset - startPattern.length);
      rng.setEnd(spot.container, spot.offset);
      return Option.some(rng);
    } else {
      // Partial match so lean left to see if the string exists over fragmented text nodes
      const offset = spot.offset - startPattern.length;
      return TextSearch.scanLeft(spot.container, offset, block).map((nextSpot) => {
        // Build up the range between the last char and the first char
        const rng = dom.createRng();
        rng.setStart(nextSpot.container, nextSpot.offset);
        rng.setEnd(spot.container, spot.offset);
        return rng;
      }).filter((rng) => {
        // Ensure the range content matches the start
        return rng.toString() === startPattern;
      }).orThunk(() => {
        // No match found, so continue searching
        return findPatternStartFromSpot(dom, pattern, block, Spot.point(spot.container, 0));
      });
    }
  });
};

const findPatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Node, offset: number, block: Node, requireGap = false): Option<Range> => {
  if (pattern.start.length === 0 && !requireGap) {
    const rng = dom.createRng();
    rng.setStart(node, offset);
    rng.setEnd(node, offset);
    return Option.some(rng);
  }

  return TextSearch.textBefore(node, offset, block).bind((spot) => {
    const start = findPatternStartFromSpot(dom, pattern, block, spot);
    return start.bind((startRange: Range) => {
      if (requireGap) {
        if (startRange.endContainer === spot.container && startRange.endOffset === spot.offset) {
          return Option.none();
        } else if (spot.offset === 0 && startRange.endContainer.textContent.length === startRange.endOffset) {
          return Option.none();
        }
      }

      return Option.some(startRange);
    });
  });
};

const findPattern = (editor: Editor, block: Node, details: PatternDetails): Option<SearchResults> => {
  const dom = editor.dom;
  const root = dom.getRoot();
  const pattern = details.pattern;
  const endNode = details.position.container;
  const endOffset = details.position.offset;

  // Lean left to find the start of the end pattern, as it could be across fragmented nodes
  return TextSearch.scanLeft(endNode, endOffset - details.pattern.end.length, block).bind((spot) => {
    const endPathRng = generatePathRange(root, spot.container, spot.offset, endNode, endOffset);

    // If we have a replacement pattern, then it can't have nested patterns so just return immediately
    if (Utils.isReplacementPattern(pattern)) {
      return Option.some({
        matches: [{
          pattern,
          startRng: endPathRng,
          endRng: endPathRng
        }],
        position: spot
      });
    } else {
      // Find any nested patterns, making sure not to process the current pattern again
      const resultsOpt = findPatternsRec(editor, details.remainingPatterns, spot.container, spot.offset, block);
      const results = resultsOpt.getOr({ matches: [], position: spot });
      const pos = results.position;

      // Find the start of the matched pattern
      const start = findPatternStart(dom, pattern, pos.container, pos.offset, block, resultsOpt.isNone());
      return start.map((startRng) => {
        const startPathRng = generatePathRangeFromRange(root, startRng);
        return {
          matches: results.matches.concat([{
            pattern,
            startRng: startPathRng,
            endRng: endPathRng
          }]),
          position: Spot.point(startRng.startContainer as Text, startRng.startOffset)
        };
      });
    }
  });
};

// Assumptions:
// 0. Patterns are sorted by priority so we should preferentially match earlier entries
// 1. Patterns may be nested but may only occur once
// 2. Patterns will not have matching prefixes which contain space or standard punctuation ',', '.', ';', ':', '!', '?'
// 3. Patterns will not extend outside of the root element
// 4. All pattern ends must be directly before the cursor (represented by node + offset)
// 5. Only text nodes matter
const findPatternsRec = (editor: Editor, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<SearchResults> => {
  const dom = editor.dom;

  return TextSearch.textBefore(node, offset, dom.getRoot()).bind((endSpot) => {
    const rng = dom.createRng();
    rng.setStart(block, 0);
    rng.setEnd(node, offset);
    const text = rng.toString();

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }

      // Generate a new array without the current pattern
      const patternsWithoutCurrent = patterns.slice();
      patternsWithoutCurrent.splice(i, 1);

      // Try to find the current pattern
      const result = findPattern(editor, block, {
        pattern,
        remainingPatterns: patternsWithoutCurrent,
        position: endSpot
      });

      // If a match was found then return that
      if (result.isSome()) {
        return result;
      }
    }

    return Option.none();
  });
};

const applyPattern = (editor: Editor, pattern: InlinePattern, patternRange: Range) => {
  editor.selection.setRng(patternRange);
  if (pattern.type === 'inline-format') {
    Arr.each(pattern.format, (format) => {
      editor.formatter.apply(format);
    });
  } else {
    editor.execCommand(pattern.cmd, false, pattern.value);
  }
};

const applyReplacementPattern = (editor: Editor, pattern: InlinePattern, marker: Marker, isRoot: (e: Node) => boolean) => {
  // Remove the original text
  const markerRange = rangeFromMarker(editor.dom, marker);
  Utils.deleteRng(editor.dom, markerRange, isRoot);

  // Apply the replacement
  applyPattern(editor, pattern, markerRange);
};

const applyPatternWithContent = (editor: Editor, pattern: InlinePattern, startMarker: Marker, endMarker: Marker, isRoot: (e: Node) => boolean) => {
  const dom = editor.dom;

  // Create the marker ranges for the patterns start/end content
  const markerEndRange = rangeFromMarker(dom, endMarker);
  const markerStartRange = rangeFromMarker(dom, startMarker);

  // Clean up the pattern start/end content
  Utils.deleteRng(dom, markerStartRange, isRoot);
  Utils.deleteRng(dom, markerEndRange, isRoot);

  // Apply the pattern
  const patternMarker = { prefix: startMarker.prefix, start: startMarker.end, end: endMarker.start };
  const patternRange = rangeFromMarker(dom, patternMarker);
  applyPattern(editor, pattern, patternRange);
};

const addMarkers = (dom: DOMUtils, matches: InlinePatternMatch[]): (InlinePatternMatch & { endMarker: Marker, startMarker: Marker })[] => {
  const markerPrefix = Id.generate('mce_textpattern');

  // Add end markers
  const matchesWithEnds = Arr.foldr(matches, (acc, match) => {
    const endMarker = createMarker(dom, markerPrefix + `_end${acc.length}`, match.endRng);
    return acc.concat([{
      ...match,
      endMarker
    }]);
  }, []);

  // Add start markers
  return Arr.foldr(matchesWithEnds, (acc, match) => {
    const idx = matchesWithEnds.length - acc.length - 1;
    const startMarker = Utils.isReplacementPattern(match.pattern) ? match.endMarker : createMarker(dom, markerPrefix + `_start${idx}`, match.startRng);
    return acc.concat([{
      ...match,
      startMarker
    }]);
  }, []);
};

const findPatterns = (editor: Editor, patterns: InlinePattern[], space: boolean): InlinePatternMatch[] => {
  const rng = editor.selection.getRng();
  if (rng.collapsed === false) {
    return [];
  }

  return Utils.getParentBlock(editor, rng).bind((block) => {
    const offset =  rng.startOffset - (space ? 1 : 0);
    return findPatternsRec(editor, patterns, rng.startContainer, offset, block);
  }).fold(() => [], (result) => result.matches);
};

const applyMatches = (editor: Editor, matches: InlinePatternMatch[]) => {
  if (matches.length === 0) {
    return;
  }

  // Store the current selection
  const dom = editor.dom;
  const bookmark = editor.selection.getBookmark();

  // Add markers for the matched patterns
  const matchesWithMarkers = addMarkers(dom, matches);

  // Do the replacements
  Arr.each(matchesWithMarkers, (match) => {
    const block = dom.getParent(match.startMarker.start, dom.isBlock);
    const isRoot = (node: Node) => node === block;
    if (Utils.isReplacementPattern(match.pattern)) {
      applyReplacementPattern(editor, match.pattern, match.endMarker, isRoot);
    } else {
      applyPatternWithContent(editor, match.pattern, match.startMarker, match.endMarker, isRoot);
    }

    // Remove the markers
    removeMarker(dom, match.endMarker, isRoot);
    removeMarker(dom, match.startMarker, isRoot);
  });

  // Restore the selection
  editor.selection.moveToBookmark(bookmark);
};

export { applyMatches, findPatterns };
