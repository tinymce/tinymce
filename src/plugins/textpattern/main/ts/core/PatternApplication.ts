/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Text, Range, Node } from '@ephox/dom-globals';
import { Strings, Arr, Id, Option, Options, Type, Obj } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { DomTextSearch } from '@ephox/robin';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Formatter from 'tinymce/core/api/Formatter';
import Tools from 'tinymce/core/api/util/Tools';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { BlockPattern } from '../api/Pattern';
import { InlinePatternMatch } from './FindPatterns';
import { convertPathRangeToRange, isElement } from './PathRange';

const cleanEmptyNodes = (dom: DOMUtils, node: Node) => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node)) {
    const parent = node.parentNode;
    dom.remove(node);
    cleanEmptyNodes(dom, parent);
  }
};

const deleteRng = (dom: DOMUtils, rng: Range, clean = true) => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  rng.deleteContents();

  // Clean up any empty nodes if required
  if (clean) {
    if (rng.startContainer.textContent.length === 0) {
      dom.remove(rng.startContainer);
    }
    if (rng.endContainer.textContent.length === 0) {
      dom.remove(rng.endContainer);
    }
    cleanEmptyNodes(dom, startParent);
    if (startParent !== endParent) {
      cleanEmptyNodes(dom, endParent);
    }
  }
};

// Handles inline formats like *abc* and **abc**
const applyInlinePatterns = (editor: Editor, areas: InlinePatternMatch[]) => {
  const dom: DOMUtils = editor.dom;
  const newMarker = (id: string) => dom.create('span', {'data-mce-type': 'bookmark', 'id': id});
  const markerRange = (ids: {start: string, end?: string}) => {
    const start = Option.from(dom.select('#' + ids.start)[0]);
    const end = Option.from(dom.select('#' + ids.end)[0]);
    return Options.lift(start, end, (start, end) => {
      const range = dom.createRng();
      range.setStartAfter(start);
      range.setEndBefore(end);
      return range;
    });
  };
  const markerPrefix = Id.generate('mce_');
  const markerIds = Arr.map(areas, (_area, i) => {
    return {
      start: markerPrefix + '_' + i + '_start',
      end: markerPrefix + '_' + i + '_end',
    };
  });
  // store the cursor position
  const cursor = editor.selection.getBookmark();
  // add marks for the left and right sides of the ranges and delete the pattern start/end
  for (let i = areas.length - 1; i >= 0; i--) {
    // insert right side marker
    const { pattern, end } = areas[i];
    const endRng = convertPathRangeToRange(dom.getRoot(), end).getOrDie('Failed to resolve range[' + i + '].end');
    const endNode = endRng.endContainer;
    const endOffset = endRng.endOffset;

    // Split the content and insert an end marker
    const textOutsideRange = endOffset === 0 ? endNode : (endNode as Text).splitText(endOffset);
    textOutsideRange.parentNode.insertBefore(newMarker(markerIds[ i ].end), textOutsideRange);

    if (pattern.start.length > 0) {
      // Delete the end pattern, if we have a pattern that has content
      deleteRng(dom, endRng);
    }
  }
  for (let i = 0; i < areas.length; i++) {
    // insert left side marker
    const { pattern, start } = areas[i];
    const startRng = convertPathRangeToRange(dom.getRoot(), start).getOrDie('Failed to resolve range[' + i + '].start');
    const startNode = startRng.endContainer as Text;
    const startOffset = startRng.endOffset;

    const textInsideRange = startOffset === 0 ? startNode : startNode.splitText(startOffset);
    textInsideRange.parentNode.insertBefore(newMarker(markerIds[i].start), textInsideRange);

    // delete the start pattern
    if (pattern.start.length > 0) {
      deleteRng(dom, startRng);
    } else {
      markerRange(markerIds[i]).each((range) => deleteRng(dom, range));
    }
  }
  // apply the patterns
  for (let i = 0; i < areas.length; i++) {
    const { pattern } = areas[i];
    const optRange = markerRange(markerIds[i]);
    optRange.each((range) => {
      editor.selection.setRng(range);
      if (pattern.type === 'inline-format') {
        pattern.format.forEach((format) => {
          editor.formatter.apply(format);
        });
      } else {
        editor.execCommand(pattern.cmd, false, pattern.value);
      }
    });
    // remove the markers
    dom.remove(markerIds[i].start);
    dom.remove(markerIds[i].end);
  }
  // return the selection
  editor.selection.moveToBookmark(cursor);
};

const isBlockFormatName = (name: string, formatter: Formatter) => {
  const formatSet = formatter.get(name);
  return Type.isArray(formatSet) && Arr.head(formatSet).exists((format) => Obj.has(format as any, 'block'));
};

// Handles block formats like ##abc or 1. abc
const applyBlockPattern = (editor: Editor, pattern: BlockPattern) => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const block = dom.getParent(rng.startContainer, dom.isBlock);
  if (!block || !dom.is(block, 'p') || !isElement(block)) {
    return;
  }

  const blockText = Tools.trim(block.textContent);
  if (!Strings.startsWith(blockText, pattern.start) || blockText.length === pattern.start.length) {
    return;
  }

  const stripPattern = () => {
    // The pattern could be across fragmented text nodes, so we need to find the end
    // of the pattern and then remove all elements between the start/end range
    const firstTextNode = DomDescent.freefallLtr(Element.fromDom(block)).element();
    DomTextSearch.scanRight(firstTextNode, pattern.start.length).each((end) => {
      const rng = dom.createRng();
      rng.setStart(block, 0);
      rng.setEnd(end.element().dom(), end.offset());

      deleteRng(dom, rng);
    });
  };

  // add a marker to store the cursor position
  const cursor = editor.selection.getBookmark();
  if (pattern.type === 'block-format') {
    if (isBlockFormatName(pattern.format, editor.formatter)) {
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
  // return the selection
  editor.selection.moveToBookmark(cursor);
};

export {
  applyInlinePatterns,
  applyBlockPattern
};