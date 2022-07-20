import { Arr, Id, Optional, Strings } from '@ephox/katamari';

import * as Spot from '../../alien/Spot';
import * as TextSearch from '../../alien/TextSearch';
import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import { createMarker, Marker, rangeFromMarker, removeMarker } from '../utils/Marker';
import { generatePathRange, generatePathRangeFromRange } from '../utils/PathRange';
import * as Utils from '../utils/Utils';
import { getInlinePatterns } from './Pattern';
import { InlinePattern, InlinePatternMatch, InlinePatternSet } from './PatternTypes';

interface PatternDetails {
  readonly pattern: InlinePattern;
  readonly remainingPatternSet: InlinePatternSet;
  readonly position: Spot.SpotPoint<Text>;
  // This allows us to allow trailing spaces for <space> triggered patterns, but not
  // for <enter> trigger patterns, due to TINY-8779
  readonly allowTrailingSpaces: boolean;
}

interface SearchResults {
  readonly matches: InlinePatternMatch[];
  readonly position: Spot.SpotPoint<Text>;
}

interface InlinePatternMatchWithMarkers extends InlinePatternMatch {
  readonly endMarker: Marker;
  readonly startMarker: Marker;
}

const isReplacementPattern = (pattern: InlinePattern): boolean =>
  pattern.start.length === 0;

const matchesPattern = (patternContent: string) => (element: Text, offset: number): number => {
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

const findPatternStartFromSpot = (dom: DOMUtils, pattern: InlinePattern, block: Node, spot: Spot.SpotPoint<Text>): Optional<Range> => {
  const startPattern = pattern.start;
  const startSpot = TextSearch.repeatLeft(dom, spot.container, spot.offset, matchesPattern(startPattern), block);
  return startSpot.bind((spot) => {
    if (spot.offset >= startPattern.length) {
      // Complete match
      const rng = dom.createRng();
      rng.setStart(spot.container, spot.offset - startPattern.length);
      rng.setEnd(spot.container, spot.offset);
      return Optional.some(rng);
    } else {
      // Partial match so lean left to see if the string exists over fragmented text nodes
      const offset = spot.offset - startPattern.length;
      return TextSearch.scanLeft(spot.container, offset, block).map((nextSpot) => {
        // Build up the range between the last char and the first char
        const rng = dom.createRng();
        rng.setStart(nextSpot.container, nextSpot.offset);
        rng.setEnd(spot.container, spot.offset);
        return rng;
      }).filter((rng) =>
        // Ensure the range content matches the start
        rng.toString() === startPattern
      ).orThunk(() =>
        // No match found, so continue searching
        findPatternStartFromSpot(dom, pattern, block, Spot.point(spot.container, 0))
      );
    }
  });
};

const findPatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Node, offset: number, block: Node, requireGap = false): Optional<Range> => {
  if (pattern.start.length === 0 && !requireGap) {
    const rng = dom.createRng();
    rng.setStart(node, offset);
    rng.setEnd(node, offset);
    return Optional.some(rng);
  }

  return TextSearch.textBefore(node, offset, block).bind((spot) => {
    const start = findPatternStartFromSpot(dom, pattern, block, spot);
    return start.bind((startRange: Range) => {
      if (requireGap) {
        if (startRange.endContainer === spot.container && startRange.endOffset === spot.offset) {
          return Optional.none();
        } else if (spot.offset === 0 && startRange.endContainer.textContent?.length === startRange.endOffset) {
          return Optional.none();
        }
      }

      return Optional.some(startRange);
    });
  });
};

const findPattern = (editor: Editor, block: Node, details: PatternDetails): Optional<SearchResults> => {
  const dom = editor.dom;
  const root = dom.getRoot();
  const pattern = details.pattern;
  const endNode = details.position.container;
  const endOffset = details.position.offset;

  // Lean left to find the start of the end pattern, as it could be across fragmented nodes
  return TextSearch.scanLeft(endNode, endOffset - details.pattern.end.length, block).bind((spot) => {
    const endPathRng = generatePathRange(root, spot.container, spot.offset, endNode, endOffset);

    // If we have a replacement pattern, then it can't have nested patterns so just return immediately
    if (isReplacementPattern(pattern)) {
      return Optional.some({
        matches: [{
          pattern,
          startRng: endPathRng,
          endRng: endPathRng
        }],
        position: spot
      });
    } else {
      // Find any nested patterns, making sure not to process the current pattern again
      const resultsOpt = findPatternsRec(editor, details.remainingPatternSet, spot.container, spot.offset, block, details.allowTrailingSpaces);
      const results: SearchResults = resultsOpt.getOr({ matches: [], position: spot });
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
const findPatternsRec = (editor: Editor, patternSet: InlinePatternSet, node: Node, offset: number, block: Node, space: boolean): Optional<SearchResults> => {
  const dom = editor.dom;

  return TextSearch.textBefore(node, offset, dom.getRoot()).bind((endSpot) => {
    const rng = dom.createRng();
    rng.setStart(block, 0);
    rng.setEnd(node, offset);
    const text = rng.toString();
    const patterns = patternSet.inlinePatterns;

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      // If the text does not end with the same string as the pattern, then we can exit
      // early, because this pattern isn't going to match this text. This saves us doing more
      // expensive matching calls.
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }

      // Generate a new array without the current pattern
      const patternsWithoutCurrent = patterns.slice();
      patternsWithoutCurrent.splice(i, 1);

      // Try to find the current pattern
      const result = findPattern(editor, block, {
        pattern,
        remainingPatternSet: {
          ...patternSet,
          inlinePatterns: patternsWithoutCurrent
        },
        position: endSpot,
        // space tells us whether it's triggered by <space> or <enter>, so
        // we use that value for allowTrailingSpaces
        allowTrailingSpaces: space
      });

      // If a match was found then return that
      if (result.isSome()) {
        return result;
      }
    }

    return Optional.none();
  });
};

const applyPattern = (editor: Editor, pattern: InlinePattern, patternRange: Range): void => {
  editor.selection.setRng(patternRange);
  if (pattern.type === 'inline-format') {
    Arr.each(pattern.format, (format) => {
      editor.formatter.apply(format);
    });
  } else {
    editor.execCommand(pattern.cmd, false, pattern.value);
  }
};

const applyReplacementPattern = (editor: Editor, pattern: InlinePattern, marker: Marker, isRoot: (e: Node) => boolean): void => {
  // Remove the original text
  const markerRange = rangeFromMarker(editor.dom, marker);
  Utils.deleteRng(editor.dom, markerRange, isRoot);

  // Apply the replacement
  applyPattern(editor, pattern, markerRange);
};

const applyPatternWithContent = (editor: Editor, pattern: InlinePattern, startMarker: Marker, endMarker: Marker, isRoot: (e: Node) => boolean): void => {
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

const addMarkers = (dom: DOMUtils, matches: InlinePatternMatch[]): InlinePatternMatchWithMarkers[] => {
  const markerPrefix = Id.generate('mce_textpattern');

  // Add end markers
  const matchesWithEnds = Arr.foldr(matches, (acc, match) => {
    const endMarker = createMarker(dom, markerPrefix + `_end${acc.length}`, match.endRng);
    return acc.concat([{
      ...match,
      endMarker
    }]);
  }, [] as Array<InlinePatternMatch & { endMarker: Marker }>);

  // Add start markers
  return Arr.foldr(matchesWithEnds, (acc, match) => {
    const idx = matchesWithEnds.length - acc.length - 1;
    const startMarker = isReplacementPattern(match.pattern) ? match.endMarker : createMarker(dom, markerPrefix + `_start${idx}`, match.startRng);
    return acc.concat([{
      ...match,
      startMarker
    }]);
  }, [] as InlinePatternMatchWithMarkers[]);
};

const findPatterns = (editor: Editor, patternSet: InlinePatternSet, space: boolean): InlinePatternMatch[] => {
  const rng = editor.selection.getRng();
  if (!rng.collapsed) {
    return [];
  }

  return Utils.getParentBlock(editor, rng).bind((block) => {
    const offset = Math.max(0, rng.startOffset - (space ? 1 : 0));
    // TINY-8781: TODO: text_patterns should announce their changes for accessibility
    const extraPatterns = patternSet.dynamicPatternsLookup({
      text: block.textContent,
      block,
      // TINY-8779: When triggering inline patterns via space, we allow trailing spaces, because
      // inline patterns are triggered via a space keyup, so spaces might be present.
      // When triggering inline patterns via enter, we don't allow trailing spaces due to TINY-8779
      allowTrailingSpaces: space
    });
    const dynamicPatterns = getInlinePatterns(extraPatterns);
    const patterns = {
      ...patternSet,
      inlinePatterns: dynamicPatterns.concat(patternSet.inlinePatterns)
    };
    // patternSet.inlinePatterns = dynamicPatterns.concat(patternSet.inlinePatterns);
    return findPatternsRec(editor, patterns, rng.startContainer, offset, block, space);
  }).fold(() => [], (result) => result.matches);
};

const applyMatches = (editor: Editor, matches: InlinePatternMatch[]): void => {
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
    if (isReplacementPattern(match.pattern)) {
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
