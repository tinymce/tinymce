/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Id, Option, Strings } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import Editor from 'tinymce/core/api/Editor';
import { BlockPattern, InlinePattern, Pattern } from '../api/Pattern';
import * as Spot from './Spot';
import * as TextSearch from './TextSearch';
import { TextWalker } from './TextWalker';
import * as Utils from './Utils';

interface Marker {
  start: Node;
  end: Node;
}

const newMarker = (dom: DOMUtils, id: string) => dom.create('span', {'data-mce-type': 'bookmark', 'id': id});

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

const findInlinePatternStart = (dom: DOMUtils, pattern: InlinePattern, node: Node, offset: number, block: Node, requireGap = false): Option<Range> => {
  if (pattern.start.length === 0 && !requireGap) {
    const rng = dom.createRng();
    rng.setStart(node, offset);
    rng.setEnd(node, offset);
    return Option.some(rng);
  }

  const process = (phase: TextSearch.Phase<Range>, element: Text, text: string, optOffset: Option<number>) => {
    // Abort if the element is outside the block
    if (element === block) {
      return phase.abort();
    }

    const searchText = text.substring(0, optOffset.getOr(text.length));
    const startEndIndex = searchText.lastIndexOf(pattern.start.charAt(pattern.start.length - 1));
    const startIndex = searchText.lastIndexOf(pattern.start);
    if (startIndex !== -1) {
      // Complete start string found
      const rng = dom.createRng();
      rng.setStart(element, startIndex);
      rng.setEnd(element, startIndex + pattern.start.length);
      return phase.finish(rng);
    } else if (startEndIndex !== -1) {
      // Potential partial string found, so lean left to see if the start pattern exists over fragmented text nodes
      return TextSearch.scanLeft(element, startEndIndex + 1 - pattern.start.length, block).fold(
        () => phase.kontinue(),
        (spot) => {
          // Build up the range between the last char and the first char
          const rng = dom.createRng();
          rng.setStart(spot.element, spot.offset);
          rng.setEnd(element, startEndIndex + 1);

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

  return TextSearch.textBefore(node, offset, block).bind((spot) => {
    const start = TextSearch.repeatLeft(dom, spot.element, spot.offset, process, block).fold(Option.none, Option.none, Option.some);
    return start.bind((startRange: Range) => {
      if (requireGap) {
        if (startRange.endContainer === spot.element && startRange.endOffset === spot.offset) {
          return Option.none();
        } else if (spot.offset === 0 && (startRange.endContainer as Text).data.length === startRange.endOffset) {
          return Option.none();
        }
      }

      return Option.some(startRange);
    });
  });
};

const applyInlinePattern = (editor: Editor, pattern: InlinePattern, marker: Marker) => {
  const patternRange = editor.dom.createRng();
  patternRange.setStartAfter(marker.start);
  patternRange.setEndBefore(marker.end);
  editor.selection.setRng(patternRange);
  if (pattern.type === 'inline-format') {
    pattern.format.forEach((format) => {
      editor.formatter.apply(format);
    });
  } else {
    editor.execCommand(pattern.cmd, false, pattern.value);
  }
};

const applyInlinePatternWithContent = (editor: Editor, pattern: InlinePattern, startMarker: Marker, endMarker: Marker, isRoot: (e: Node) => boolean) => {
  const dom = editor.dom;

  // Create the marker ranges for the patterns start/end content
  const markerEndRange = dom.createRng();
  markerEndRange.setStartAfter(endMarker.start);
  markerEndRange.setEndBefore(endMarker.end);
  const markerStartRange = dom.createRng();
  markerStartRange.setStartAfter(startMarker.start);
  markerStartRange.setEndBefore(startMarker.end);

  // Clean up the pattern start/end content
  Utils.deleteRng(dom, markerStartRange, isRoot);
  Utils.deleteRng(dom, markerEndRange, isRoot);

  // Apply the pattern
  applyInlinePattern(editor, pattern, { start: startMarker.end, end: endMarker.start });
};

// Assumptions:
// 0. Patterns are sorted by priority so we should preferentially match earlier entries
// 1. Patterns may be nested but may only occur once
// 2. Patterns will not have matching prefixes which contain space or standard punctuation ',', '.', ';', ':', '!', '?'
// 3. Patterns will not extend outside of the root element
// 4. All pattern ends must be directly before the cursor (represented by node + offset)
// 5. Only text nodes matter
const applyInlinePatternRec = (editor: Editor, patterns: InlinePattern[], node: Node, offset: number, block: Node): Option<Spot.SpotPoint<Node>> => {
  const dom = editor.dom;
  const isRoot = (e: Node) => e === block;

  return TextSearch.textBefore(node, offset, dom.getRoot()).bind((endSpot) => {
    const rng = dom.createRng();
    rng.setStart(block, 0);
    rng.setEnd(node, offset);
    const text = rng.toString();

    let endNode = endSpot.element;
    let endOffset = endSpot.offset;
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      if (!Strings.endsWith(text, pattern.end)) {
        continue;
      }

      // Lean left to find the start of the end pattern, as it could be across fragmented nodes
      const match = TextSearch.scanLeft(endNode, endOffset - pattern.end.length, block).bind((spot) => {
        // Store the current selection
        const cursor = editor.selection.getBookmark();
        const markerPrefix = Id.generate('mce_textpattern');

        // Create the end markers
        const textEndEnd = endOffset === 0 ? endNode : endNode.splitText(endOffset);
        const textEndStart = spot.offset === 0 ? spot.element : spot.element.splitText(spot.offset);
        const endMarker = {
          end: textEndEnd.parentNode.insertBefore(newMarker(dom, markerPrefix + '_end-end'), textEndEnd),
          start: textEndStart.parentNode.insertBefore(newMarker(dom, markerPrefix + '_end-start'), textEndStart)
        };

        endNode = textEndStart;
        endOffset = textEndStart.data.length;

        try {
          // If the pattern has start & end, then it may have nested patterns. If not, then it's just a replacement pattern.
          if (pattern.start.length > 0 && pattern.end.length > 0) {
            // Apply any nested patterns, making sure not to process the current pattern again
            const patternsWithoutCurrent = patterns.slice();
            patternsWithoutCurrent.splice(i, 1);
            const previousSpotOpt = applyInlinePatternRec(editor, patternsWithoutCurrent, endMarker.start, 0, block);
            const previousSpot = previousSpotOpt.getOr(spot);

            // Apply the pattern
            const start = findInlinePatternStart(dom, pattern, previousSpot.element, previousSpot.offset, block, previousSpotOpt.isNone());
            return start.map((startRng) => {
              // Create the start markers
              const textStartEnd = startRng.endOffset === 0 ? startRng.endContainer : (startRng.endContainer as Text).splitText(startRng.endOffset);
              const textStartStart = startRng.startOffset === 0 ? startRng.startContainer : (startRng.startContainer as Text).splitText(startRng.startOffset);
              const startMarker = {
                end: textStartEnd.parentNode.insertBefore(newMarker(dom, markerPrefix + '_start-end'), textStartEnd),
                start: textStartStart.parentNode.insertBefore(newMarker(dom, markerPrefix + '_start-start'), textStartStart)
              };

              // Apply the pattern
              applyInlinePatternWithContent(editor, pattern, startMarker, endMarker, isRoot);

              // Remove the start markers
              Utils.cleanEmptyNodes(dom, startMarker.end, isRoot);
              Utils.cleanEmptyNodes(dom, startMarker.start, isRoot);

              return Spot.point(startRng.startContainer, startRng.startOffset);
            });
          } else {
            // Remove the replacement text
            const markerRange = dom.createRng();
            markerRange.setStartAfter(endMarker.start);
            markerRange.setEndBefore(endMarker.end);
            Utils.deleteRng(dom, markerRange, isRoot);

            // Apply the pattern
            applyInlinePattern(editor, pattern, endMarker);

            return Option.some(spot);
          }
        } finally {
          // Remove the end markers
          // Note: Use dom.get() here instead of endMarker.end/start, as applying the format/command can
          // clone the nodes meaning the old reference isn't usable
          Utils.cleanEmptyNodes(dom, dom.get(markerPrefix + '_end-end'), isRoot);
          Utils.cleanEmptyNodes(dom, dom.get(markerPrefix + '_end-start'), isRoot);

          // restore the selection
          editor.selection.moveToBookmark(cursor);
        }
      });

      if (match.isSome()) {
        return match;
      }
    }

    return Option.none();
  });
};

const applyNestedInlinePatterns = (editor: Editor, patterns: InlinePattern[]): boolean => {
  const rng = editor.selection.getRng();
  if (rng.collapsed === false) {
    return false;
  }

  const block = editor.dom.getParent(rng.startContainer, editor.dom.isBlock);
  const offset = Utils.isText(rng.startContainer) ? rng.startOffset - 1 : rng.startOffset;

  return applyInlinePatternRec(editor, patterns, rng.startContainer, offset, block).isSome();
};

const applyBlockPatterns = (editor: Editor, patterns: BlockPattern[]) => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const block = dom.getParent(rng.startContainer, dom.isBlock);

  if (!(dom.is(block, 'p') && Utils.isElement(block))) {
    return Option.none();
  }

  const blockText = block.textContent;

  // Find the pattern
  const matchedPattern = findPattern(patterns, blockText);
  return matchedPattern.each((pattern) => {
    if (Tools.trim(blockText).length === pattern.start.length) {
      return;
    }

    const stripPattern = () => {
      // The pattern could be across fragmented text nodes, so we need to find the end
      // of the pattern and then remove all elements between the start/end range
      const firstTextNode = TextWalker(block, block).next();
      firstTextNode.each((node) => {
        TextSearch.scanRight(node, pattern.start.length, block).each((end) => {
          const rng = dom.createRng();
          rng.setStart(node, 0);
          rng.setEnd(end.element, end.offset);

          Utils.deleteRng(dom, rng, (e: Node) => e === block);
        });
      });
    };

    // add a marker to store the cursor position
    const cursor = editor.selection.getBookmark();
    try {
      if (pattern.type === 'block-format') {
        if (Utils.isBlockFormatName(pattern.format, editor.formatter)) {
          editor.undoManager.transact(() => {
            stripPattern();
            editor.formatter.apply(pattern.format);
          });
        }
      } else if (pattern.type === 'block-command') {
        editor.undoManager.transact(() => {
          stripPattern();
          editor.execCommand(pattern.cmd, false, pattern.value);
        });
      }
    } finally {
      // return the selection
      editor.selection.moveToBookmark(cursor);
    }
  });
};

export { findPattern, applyBlockPatterns, applyNestedInlinePatterns, };
