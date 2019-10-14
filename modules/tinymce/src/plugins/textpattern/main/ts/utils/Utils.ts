/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Obj, Option, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Formatter from 'tinymce/core/api/Formatter';
import * as Settings from '../api/Settings';
import { InlinePattern, Pattern } from '../core/PatternTypes';

const isElement = (node: Node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE;
const isText = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;

const cleanEmptyNodes = (dom: DOMUtils, node: Node, isRoot: (e: Node) => boolean) => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node) && !isRoot(node)) {
    const parent = node.parentNode;
    dom.remove(node);
    cleanEmptyNodes(dom, parent, isRoot);
  }
};

const deleteRng = (dom: DOMUtils, rng: Range, isRoot: (e: Node) => boolean, clean = true) => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  rng.deleteContents();

  // Clean up any empty nodes if required
  if (clean && !isRoot(rng.startContainer)) {
    if (isText(rng.startContainer) && rng.startContainer.data.length === 0) {
      dom.remove(rng.startContainer);
    }
    if (isText(rng.endContainer) && rng.endContainer.data.length === 0) {
      dom.remove(rng.endContainer);
    }
    cleanEmptyNodes(dom, startParent, isRoot);
    if (startParent !== endParent) {
      cleanEmptyNodes(dom, endParent, isRoot);
    }
  }
};

const isBlockFormatName = (name: string, formatter: Formatter): boolean => {
  const formatSet = formatter.get(name);
  return Type.isArray(formatSet) && Arr.head(formatSet).exists((format) => Obj.has(format as any, 'block'));
};

const isInlinePattern = (pattern: Pattern): pattern is InlinePattern => {
  return Obj.has(pattern as Record<string, any>, 'end');
};

const isReplacementPattern = (pattern: InlinePattern) => {
  return pattern.start.length === 0;
};

// Finds a matching pattern to the specified text
const findPattern = <P extends Pattern>(patterns: P[], text: string): Option<P> => {
  return Arr.find(patterns, (pattern) => {
    if (text.indexOf(pattern.start) !== 0) {
      return false;
    }

    if (isInlinePattern(pattern) && pattern.end && text.lastIndexOf(pattern.end) !== (text.length - pattern.end.length)) {
      return false;
    }

    return true;
  });
};

const getParentBlock = (editor: Editor, rng: Range) => {
  const parentBlockOpt = Option.from(editor.dom.getParent(rng.startContainer, editor.dom.isBlock));
  if (Settings.getForcedRootBlock(editor) === '') {
    return parentBlockOpt.orThunk(() => Option.some(editor.getBody()));
  } else {
    return parentBlockOpt;
  }
};

export {
  cleanEmptyNodes,
  deleteRng,
  findPattern,
  getParentBlock,
  isBlockFormatName,
  isElement,
  isReplacementPattern,
  isText
};
