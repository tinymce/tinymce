/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import NodeType from 'tinymce/core/dom/NodeType';
import { BlockPattern, InlinePattern, ReplacementPattern } from '../api/Pattern';
import { findInlinePattern, findPattern, findReplacementPattern, ReplacementMatch } from './FindPatterns';

const setSelection = (editor: Editor, textNode: Text, offset: number): void => {
  const newRng = editor.dom.createRng();
  newRng.setStart(textNode, offset);
  newRng.setEnd(textNode, offset);
  editor.selection.setRng(newRng);
};

const splitContainer = (container: Text, pattern: InlinePattern, endOffset: number, startOffset: number) => {
  // Split text node and remove start/end from text node
  container = startOffset > 0 ? container.splitText(startOffset) : container;
  container.splitText(endOffset - startOffset + pattern.end.length);
  container.deleteData(0, pattern.start.length);
  container.deleteData(container.data.length - pattern.end.length, pattern.end.length);

  return container;
};

const splitAndApply = (editor: Editor, container: Text, found: {pattern: InlinePattern, startOffset: number, endOffset: number}, inline: boolean) => {
  const formatArray = Tools.isArray(found.pattern.format) ? found.pattern.format : [found.pattern.format];
  const validFormats = Tools.grep(formatArray, (formatName) => {
    const format = editor.formatter.get(formatName);
    return format && format[0].inline;
  });

  if (validFormats.length !== 0) {
    editor.undoManager.transact(() => {
      container = splitContainer(container, found.pattern, found.endOffset, found.startOffset);
      // The splitContainer function above moves the selection range in Safari
      // so we have to set it back to the next sibling, the nbsp behind the
      // split text node, when applying inline formats.
      if (inline) {
        editor.selection.setCursorLocation(container.nextSibling, 1);
      }
      formatArray.forEach((format) => {
        editor.formatter.apply(format, {}, container);
      });
    });

    return container;
  }
};

// Handles inline formats like *abc* and **abc**
const applyInlinePattern = (editor: Editor, patterns: InlinePattern[], inline: boolean): Option<Text> => {
  const rng = editor.selection.getRng();
  return Option.from(findInlinePattern(patterns, rng, inline)).map((foundPattern) => {
    return splitAndApply(editor, rng.startContainer as Text, foundPattern, inline);
  });
};

const applyInlinePatternSpace = (editor: Editor, patterns: InlinePattern[]): void => {
  applyInlinePattern(editor, patterns, true).each((wrappedTextNode) => {
    // Move space after the newly formatted node
    const lastChar = wrappedTextNode.data.slice(-1);
    if (/[\u00a0 ]/.test(lastChar)) {
      wrappedTextNode.deleteData(wrappedTextNode.data.length - 1, 1);
      const lastCharNode = editor.dom.doc.createTextNode(lastChar);
      editor.dom.insertAfter(lastCharNode, wrappedTextNode.parentNode);
      setSelection(editor, lastCharNode, 1);
    }
  });
};

const applyInlinePatternEnter = (editor: Editor, patterns: InlinePattern[]): void => {
  applyInlinePattern(editor, patterns, false).each((wrappedTextNode) => {
    setSelection(editor, wrappedTextNode, wrappedTextNode.data.length);
  });
};

// Handles block formats like ##abc or 1. abc
const applyBlockPattern = (editor: Editor, patterns: BlockPattern[]): void => {

  const selection = editor.selection;
  const dom = editor.dom;

  if (!selection.isCollapsed()) {
    return;
  }

  const textBlockElm = dom.getParent(selection.getStart(), 'p');
  if (textBlockElm) {
    const walker = new TreeWalker(textBlockElm, textBlockElm);
    let node: Node;
    let firstTextNode: Text;
    while ((node = walker.next())) {
      if (NodeType.isText(node)) {
        firstTextNode = node;
        break;
      }
    }

    if (firstTextNode) {
      const pattern = findPattern(patterns, firstTextNode.data);
      if (!pattern) {
        return;
      }

      const rng = selection.getRng();
      const container = rng.startContainer;
      let offset = rng.startOffset;

      if (firstTextNode === container) {
        offset = Math.max(0, offset - pattern.start.length);
      }

      if (Tools.trim(firstTextNode.data).length === pattern.start.length) {
        return;
      }

      if (pattern.format) {
        const format = editor.formatter.get(pattern.format);
        if (format && format[0].block) {
          firstTextNode.deleteData(0, pattern.start.length);
          editor.formatter.apply(pattern.format, {}, firstTextNode);

          rng.setStart(container, offset);
          rng.collapse(true);
          selection.setRng(rng);
        }
      }

      if (pattern.cmd) {
        editor.undoManager.transact(function () {
          firstTextNode.deleteData(0, pattern.start.length);
          editor.execCommand(pattern.cmd);
        });
      }
    }
  }
};

const replaceData = (target: Text, match: ReplacementMatch) => {
  target.deleteData(match.startOffset, match.pattern.start.length);
  target.insertData(match.startOffset, match.pattern.replacement);
};

const replaceMiddle = (editor: Editor, target: Text, match: ReplacementMatch) => {
  const startOffset = editor.selection.getRng().startOffset;
  replaceData(target, match);
  const newOffset = startOffset - match.pattern.start.length + match.pattern.replacement.length;
  setSelection(editor, target, newOffset);
};

const replaceEnd = (editor: Editor, target: Text, match: ReplacementMatch) => {
  replaceData(target, match);
  setSelection(editor, target, target.data.length);
};

const replace = (editor: Editor, target: Text, match: ReplacementMatch) => {
  if (match.startOffset < target.data.length) {
    replaceMiddle(editor, target, match);
  } else {
    replaceEnd(editor, target, match);
  }
};

const applyReplacementPattern = (editor: Editor, patterns: ReplacementPattern[]) => {
  const rng = editor.selection.getRng();
  const container = rng.startContainer;

  if (rng.collapsed && NodeType.isText(container)) {
    findReplacementPattern(patterns, rng.startOffset, container.data).each((match) => {
      replace(editor, container, match);
    });
  }
};

export {
  applyReplacementPattern,
  applyInlinePatternSpace,
  applyInlinePatternEnter,
  applyBlockPattern
};