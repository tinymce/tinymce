/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Id, Option, Strings } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { InlinePattern } from '../api/Pattern';
import * as TextSearch from '../text/TextSearch';
import * as Spot from './Spot';
import * as Utils from './Utils';

interface Marker {
  start: Node;
  end: Node;
}

interface PatternDetails {
  pattern: InlinePattern;
  remainingPatterns: InlinePattern[];
  currentPos: Spot.SpotPoint<Text>;
}

interface MatchDetails extends PatternDetails {
  marker: Marker;
}

const newMarker = (dom: DOMUtils, id: string) => dom.create('span', { 'data-mce-type': 'bookmark', 'id': id });

const rangeFromMarker = (dom: DOMUtils, marker: Marker): Range => {
  const rng = dom.createRng();
  rng.setStartAfter(marker.start);
  rng.setEndBefore(marker.end);
  return rng;
};

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

const applyPattern = (editor: Editor, pattern: InlinePattern, marker: Marker) => {
  const patternRange = rangeFromMarker(editor.dom, marker);
  editor.selection.setRng(patternRange);
  if (pattern.type === 'inline-format') {
    pattern.format.forEach((format) => {
      editor.formatter.apply(format);
    });
  } else {
    editor.execCommand(pattern.cmd, false, pattern.value);
  }
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
  applyPattern(editor, pattern, { start: startMarker.end, end: endMarker.start });
};

const processPatternMatch = (editor: Editor, block: Node, markerPrefix: string, details: MatchDetails): Option<Spot.SpotPoint<Text>> => {
  const dom = editor.dom;
  const isRoot = (e: Node) => e === block;
  const pattern = details.pattern;
  const endMarker = details.marker;

  // If the pattern has start & end, then it may have nested patterns.
  // If not, then it's just a replacement pattern.
  if (pattern.start.length > 0 && pattern.end.length > 0) {
    // Apply any nested patterns, making sure not to process the current pattern again
    const previousSpotOpt = findAndApplyPatternsRec(editor, details.remainingPatterns, endMarker.start, 0, block);
    const previousSpot = previousSpotOpt.getOr(details.currentPos);

    // Find the start of the matched pattern
    const start = findPatternStart(dom, pattern, previousSpot.element, previousSpot.offset, block, previousSpotOpt.isNone());
    return start.map((startRng) => {
      // Create the start markers
      const textEnd = startRng.endOffset === 0 ? startRng.endContainer : (startRng.endContainer as Text).splitText(startRng.endOffset);
      const textStart = startRng.startOffset === 0 ? startRng.startContainer : (startRng.startContainer as Text).splitText(startRng.startOffset);
      const startMarker = {
        end: textEnd.parentNode.insertBefore(newMarker(dom, markerPrefix + '_start-end'), textEnd),
        start: textStart.parentNode.insertBefore(newMarker(dom, markerPrefix + '_start-start'), textStart)
      };

      // Apply the pattern
      applyPatternWithContent(editor, pattern, startMarker, endMarker, isRoot);

      // Remove the start markers
      Utils.cleanEmptyNodes(dom, startMarker.end, isRoot);
      Utils.cleanEmptyNodes(dom, startMarker.start, isRoot);

      return Spot.point(startRng.startContainer as Text, startRng.startOffset);
    });
  } else {
    // Remove the replacement text
    const markerRange = rangeFromMarker(dom, endMarker);
    Utils.deleteRng(dom, markerRange, isRoot);

    // Apply the pattern
    applyPattern(editor, pattern, endMarker);

    return Option.some(details.currentPos);
  }
};

const findAndApplyPattern = (editor: Editor, block: Node, details: PatternDetails): { match: Option<Spot.SpotPoint<Text>>; currentPos: Spot.SpotPoint<Text> } => {
  const dom = editor.dom;
  const isRoot = (e: Node) => e === block;
  const endNode = details.currentPos.element;
  const endOffset = details.currentPos.offset;

  // Lean left to find the start of the end pattern, as it could be across fragmented nodes
  return TextSearch.scanLeft(endNode, endOffset - details.pattern.end.length, block).map((spot) => {
    // Store the current selection
    const cursor = editor.selection.getBookmark();
    const markerPrefix = Id.generate('mce_textpattern');

    // Create the end markers
    const textEnd = endOffset === 0 ? endNode : endNode.splitText(endOffset);
    const textStart = spot.offset === 0 ? spot.element : spot.element.splitText(spot.offset);
    const endMarker = {
      end: textEnd.parentNode.insertBefore(newMarker(dom, markerPrefix + '_end-end'), textEnd),
      start: textStart.parentNode.insertBefore(newMarker(dom, markerPrefix + '_end-start'), textStart)
    };

    // Process the matched pattern
    const match = processPatternMatch(editor, block, markerPrefix, {
      ...details,
      marker: endMarker,
      currentPos: spot
    });

    // Remove the end markers
    // Note: Use dom.get() here instead of endMarker.end/start, as applying the format/command can
    // clone the nodes meaning the old reference isn't usable
    Utils.cleanEmptyNodes(dom, dom.get(markerPrefix + '_end-end'), isRoot);
    Utils.cleanEmptyNodes(dom, dom.get(markerPrefix + '_end-start'), isRoot);

    // restore the selection
    editor.selection.moveToBookmark(cursor);

    return {
      match,
      currentPos: Spot.point(textStart, textStart.data.length)
    };
  }).getOr({
    match: Option.none(),
    currentPos: details.currentPos
  });
};

// Assumptions:
// 0. Patterns are sorted by priority so we should preferentially match earlier entries
// 1. Patterns may be nested but may only occur once
// 2. Patterns will not have matching prefixes which contain space or standard punctuation ',', '.', ';', ':', '!', '?'
// 3. Patterns will not extend outside of the root element
// 4. All pattern ends must be directly before the cursor (represented by node + offset)
// 5. Only text nodes matter
const findAndApplyPatternsRec = (editor: Editor, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<Spot.SpotPoint<Text>> => {
  const dom = editor.dom;

  return TextSearch.textBefore(node, offset, dom.getRoot()).bind((endSpot) => {
    const rng = dom.createRng();
    rng.setStart(block, 0);
    rng.setEnd(node, offset);
    const text = rng.toString();

    let currentPos = endSpot;
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }

      // Generate a new array without the current pattern
      const patternsWithoutCurrent = patterns.slice();
      patternsWithoutCurrent.splice(i, 1);

      // Try to find and apply the current pattern
      const result = findAndApplyPattern(editor, block, {
        pattern,
        remainingPatterns: patternsWithoutCurrent,
        currentPos
      });

      // If a match was found then return that, otherwise update the current search position
      if (result.match.isSome()) {
        return result.match;
      } else {
        currentPos = result.currentPos;
      }
    }

    return Option.none();
  });
};

const applyPatterns = (editor: Editor, patterns: InlinePattern[]): boolean => {
  const rng = editor.selection.getRng();
  if (rng.collapsed === false) {
    return false;
  }

  const block = editor.dom.getParent(rng.startContainer, editor.dom.isBlock);
  const offset = Utils.isText(rng.startContainer) ? rng.startOffset - 1 : rng.startOffset;

  return findAndApplyPatternsRec(editor, patterns, rng.startContainer, offset, block).isSome();
};

export { applyPatterns };