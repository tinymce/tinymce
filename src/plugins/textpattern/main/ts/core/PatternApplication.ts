/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import NodeType from 'tinymce/core/dom/NodeType';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { BlockPattern } from '../api/Pattern';
import { PatternArea } from './FindPatterns';
import { resolvePath } from './PathRange';
import { Strings, Arr } from '@ephox/katamari';

// Handles inline formats like *abc* and **abc**
const applyInlinePatterns = (editor: Editor, areas: PatternArea[]) => {
  const dom: DOMUtils = editor.dom;
  const newMarker = () => dom.create('span', {'data-mce-type': 'bookmark'});
  const markers = Arr.map(areas, () => ({ start: newMarker(), end: newMarker() }));

  // store the cursor position
  const cursor = editor.selection.getBookmark();
  // add marks for the left and right sides of the ranges and delete the pattern start/end
  for (let i = areas.length - 1; i >= 0; i--) {
    // insert right side marker
    const { pattern, range } = areas[i];
    const { node: endNode, offset: endOffset } = resolvePath(dom.getRoot(), range.end).getOrDie('Failed to resolve range[' + i + '].end');
    const textOutsideRange = endOffset === 0 ? endNode : endNode.splitText(endOffset);
    textOutsideRange.parentNode.insertBefore(markers[i].end, textOutsideRange);
    // delete the end pattern, note we can't do that if the pattern has no start (ie is a replacement pattern)
    if (pattern.end.length > 0 && pattern.start.length !== 0) {
      endNode.deleteData(endOffset - pattern.end.length, pattern.end.length);
    }
  }
  for (let i = 0; i < areas.length; i++) {
    // insert left side marker
    const { pattern, range } = areas[i];
    const { node: startNode, offset: startOffset } = resolvePath(dom.getRoot(), range.start).getOrDie('Failed to resolve range.start');
    const textInsideRange = startOffset === 0 ? startNode : startNode.splitText(startOffset);
    textInsideRange.parentNode.insertBefore(markers[i].start, textInsideRange);
    // delete the start pattern
    if (pattern.start.length > 0) {
      textInsideRange.deleteData(0, pattern.start.length);
    } else {
      textInsideRange.deleteData(0, pattern.end.length);
    }
  }
  // apply the patterns
  for (let i = 0; i < areas.length; i++) {
    const { pattern } = areas[i];
    const { start, end } = markers[i];
    const doc = start.ownerDocument;
    const range = doc.createRange();
    range.setStartAfter(start);
    range.setEndBefore(end);
    editor.selection.setRng(range);
    if (pattern.type === 'inline-format') {
      pattern.format.forEach((format) => {
        editor.formatter.apply(format);
      });
    } else {
      editor.execCommand(pattern.cmd, false, pattern.value);
    }
    // remove the markers
    start.parentNode.removeChild(start);
    end.parentNode.removeChild(end);
  }
  // return the selection
  editor.selection.moveToBookmark(cursor);
};

// Handles block formats like ##abc or 1. abc
const applyBlockPattern = (editor: Editor, pattern: BlockPattern) => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const block = dom.getParent(rng.startContainer, dom.isBlock);
  if (!block || !dom.is(block, 'p') || !NodeType.isElement(block)) {
    return;
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
    return;
  }
  if (!Strings.startsWith(firstTextNode.data, pattern.start)) {
    return;
  }
  if (Tools.trim(block.textContent).length === pattern.start.length) {
    return;
  }

  // add a marker to store the cursor position
  const cursor = editor.selection.getBookmark();
  if (pattern.type === 'block-format') {
    const format = editor.formatter.get(pattern.format);
    if (format && format[0].block) {
      editor.undoManager.transact(function () {
        firstTextNode.deleteData(0, pattern.start.length);
        editor.selection.select(block);
        editor.formatter.apply(pattern.format);
      });
    }
  } else if (pattern.type === 'block-command') {
    editor.undoManager.transact(function () {
      firstTextNode.deleteData(0, pattern.start.length);
      editor.selection.select(block);
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