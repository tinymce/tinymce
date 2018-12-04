/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Tools from 'tinymce/core/api/util/Tools';
import { Text, Node } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { InlinePattern, BlockPattern, ReplacementPattern } from '../api/Pattern';
import { Editor } from 'tinymce/core/api/Editor';
import { findInlinePattern, findPattern, findReplacementPattern, ReplacementMatch } from './FindPatterns';

const isText = (node: Node): node is Text => {
  return node && node.nodeType === 3;
};

const setSelection = (editor: Editor, textNode: Text, offset: number): void => {
  const newRng = editor.dom.createRng();
  newRng.setStart(textNode, offset);
  newRng.setEnd(textNode, offset);
  editor.selection.setRng(newRng);
};

const splitContainer = (container, pattern, endOffset, startOffset) => {
  // Split text node and remove start/end from text node
  container = startOffset > 0 ? container.splitText(startOffset) : container;
  container.splitText(endOffset - startOffset + pattern.end.length);
  container.deleteData(0, pattern.start.length);
  container.deleteData(container.data.length - pattern.end.length, pattern.end.length);

  return container;
};

const splitAndApply = (editor: Editor, container, found, inline) => {
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
    return splitAndApply(editor, rng.startContainer, foundPattern, inline);
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
  let selection, dom, container, firstTextNode, node, format, textBlockElm, pattern, walker, rng, offset;

  selection = editor.selection;
  dom = editor.dom;

  if (!selection.isCollapsed()) {
    return;
  }

  textBlockElm = dom.getParent(selection.getStart(), 'p');
  if (textBlockElm) {
    walker = new TreeWalker(textBlockElm, textBlockElm);
    while ((node = walker.next())) {
      if (isText(node)) {
        firstTextNode = node;
        break;
      }
    }

    if (firstTextNode) {
      pattern = findPattern(patterns, firstTextNode.data);
      if (!pattern) {
        return;
      }

      rng = selection.getRng(true);
      container = rng.startContainer;
      offset = rng.startOffset;

      if (firstTextNode === container) {
        offset = Math.max(0, offset - pattern.start.length);
      }

      if (Tools.trim(firstTextNode.data).length === pattern.start.length) {
        return;
      }

      if (pattern.format) {
        format = editor.formatter.get(pattern.format);
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

const selectionInsertText = (editor: Editor, string: string) => {
  const rng = editor.selection.getRng();
  const container = rng.startContainer;

  if (isText(container)) {
    const offset = rng.startOffset;
    container.insertData(offset, string);
    setSelection(editor, container, offset + string.length);
  } else {
    const newNode = editor.dom.doc.createTextNode(string);
    rng.insertNode(newNode);
    setSelection(editor, newNode, newNode.length);
  }
};

const applyReplacement = (editor: Editor, target: Text, match: ReplacementMatch) => {
  target.deleteData(match.startOffset, match.pattern.start.length);
  editor.insertContent(match.pattern.replacement);

  Option.from(target.nextSibling).filter(isText).each((nextSibling: Text) => {
    nextSibling.insertData(0, target.data);
    editor.dom.remove(target);
  });
};

const extractChar = (node: Text, match: ReplacementMatch): string => {
  const offset = match.startOffset + match.pattern.start.length;
  const char = node.data.slice(offset, offset + 1);
  node.deleteData(offset, 1);
  return char;
};

const applyReplacementPattern = (editor: Editor, patterns: ReplacementPattern[], inline: boolean) => {
  const rng = editor.selection.getRng();
  const container = rng.startContainer;

  if (rng.collapsed && isText(container)) {
    findReplacementPattern(patterns, rng.startOffset, container.data).each((match) => {
      const char = inline ? Option.some(extractChar(container, match)) : Option.none();

      applyReplacement(editor, container, match);

      char.each((ch) => selectionInsertText(editor, ch));
    });
  }
};

const applyReplacementPatternSpace = (editor: Editor, patterns: ReplacementPattern[]) => {
  applyReplacementPattern(editor, patterns, true);
};

const applyReplacementPatternEnter = (editor: Editor, patterns: ReplacementPattern[]) => {
  applyReplacementPattern(editor, patterns, false);
};

export {
  applyReplacementPattern,
  applyReplacementPatternSpace,
  applyReplacementPatternEnter,
  applyInlinePatternSpace,
  applyInlinePatternEnter,
  applyBlockPattern
};