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
import { Marker, createMarker, rangeFromMarker, removeMarker } from '../utils/Marker';
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

const nodeMatchesPattern = (dom: DOMUtils, block: Node, content: string) => (phase: TextSearch.Phase<Range>, element: Text, text: string, optOffset: Option<number>) => {
  // Abort if the element is outside the block
  if (element === block) {
    return phase.abort();
  }

  const searchText = text.substring(0, optOffset.getOr(text.length));
  const startEndIndex = searchText.lastIndexOf(content.charAt(content.length - 1));
  const startIndex = searchText.lastIndexOf(content);
  if (startIndex !== -1) {
    // Complete string found
    const rng = dom.createRng();
    rng.setStart(element, startIndex);
    rng.setEnd(element, startIndex + content.length);
    return phase.finish(rng);
  } else if (startEndIndex !== -1) {
    // Potential partial string found, so lean left to see if the string exists over fragmented text nodes
    return TextSearch.scanLeft(element, startEndIndex + 1 - content.length, block).fold(
      () => phase.kontinue(),
      (spot) => {
        // Build up the range between the last char and the first char
        const rng = dom.createRng();
        rng.setStart(spot.element, spot.offset);
        rng.setEnd(element, startEndIndex + 1);

        // Ensure the range content matches the start
        if (rng.toString() === content) {
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

const findPatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Node, offset: number, block: Node, requireGap = false): Option<Range> => {
  if (pattern.start.length === 0 && !requireGap) {
    const rng = dom.createRng();
    rng.setStart(node, offset);
    rng.setEnd(node, offset);
    return Option.some(rng);
  }

  return TextSearch.textBefore(node, offset, block).bind((spot) => {
    const outcome = TextSearch.repeatLeft(dom, spot.element, spot.offset, nodeMatchesPattern(dom, block, pattern.start), block);
    const start = outcome.fold(Option.none, Option.none, Option.some);
    return start.bind((startRange: Range) => {
      if (requireGap) {
        if (startRange.endContainer === spot.element && startRange.endOffset === spot.offset) {
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
  const endNode = details.position.element;
  const endOffset = details.position.offset;

  // Lean left to find the start of the end pattern, as it could be across fragmented nodes
  return TextSearch.scanLeft(endNode, endOffset - details.pattern.end.length, block).bind((spot) => {
    const endPathRng = generatePathRange(root, spot.element, spot.offset, endNode, endOffset);

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
      const resultsOpt = findPatternsRec(editor, details.remainingPatterns, spot.element, spot.offset, block);
      const results = resultsOpt.getOr({ matches: [], position: spot });
      const pos = results.position;

      // Find the start of the matched pattern
      const start = findPatternStart(dom, pattern, pos.element, pos.offset, block, resultsOpt.isNone());
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

  const block = editor.dom.getParent(rng.startContainer, editor.dom.isBlock);
  const offset =  rng.startOffset - (space ? 1 : 0);

  const resultOpt = findPatternsRec(editor, patterns, rng.startContainer, offset, block);
  return resultOpt.fold(() => [], (result) => result.matches);
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