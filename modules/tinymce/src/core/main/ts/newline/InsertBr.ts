/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import * as BoundaryLocation from '../keyboard/BoundaryLocation';
import * as InlineUtils from '../keyboard/InlineUtils';
import * as NormalizeRange from '../selection/NormalizeRange';
import { rangeInsertNode } from '../selection/RangeInsertNode';

// Walks the parent block to the right and look for BR elements
const hasRightSideContent = (schema: Schema, container, parentBlock) => {
  const walker = new DomTreeWalker(container, parentBlock);
  let node;
  const nonEmptyElementsMap = schema.getNonEmptyElements();

  while ((node = walker.next())) {
    if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
      return true;
    }
  }
};

const moveSelectionToBr = (editor: Editor, brElm: HTMLBRElement, extraBr: boolean) => {
  const rng = editor.dom.createRng();
  if (!extraBr) {
    rng.setStartAfter(brElm);
    rng.setEndAfter(brElm);
  } else {
    rng.setStartBefore(brElm);
    rng.setEndBefore(brElm);
  }
  editor.selection.setRng(rng);
  ScrollIntoView.scrollRangeIntoView(editor, rng);
};

const insertBrAtCaret = (editor: Editor, evt?) => {
  // We load the current event in from EnterKey.js when appropriate to heed
  // certain event-specific variations such as ctrl-enter in a list
  const selection = editor.selection;
  const dom = editor.dom;
  const rng = selection.getRng();
  let brElm: HTMLBRElement;
  let extraBr: boolean;

  NormalizeRange.normalize(dom, rng).each((normRng) => {
    rng.setStart(normRng.startContainer, normRng.startOffset);
    rng.setEnd(normRng.endContainer, normRng.endOffset);
  });

  let offset = rng.startOffset;
  let container = rng.startContainer;

  // Resolve node index
  if (container.nodeType === 1 && container.hasChildNodes()) {
    const isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
    if (isAfterLastNodeInContainer && container.nodeType === 3) {
      offset = container.nodeValue.length;
    } else {
      offset = 0;
    }
  }

  let parentBlock = dom.getParent(container, dom.isBlock);
  const containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;
  const containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

  // Enter inside block contained within a LI then split or insert before/after LI
  const isControlKey = !!(evt && evt.ctrlKey);
  if (containerBlockName === 'LI' && !isControlKey) {
    parentBlock = containerBlock;
  }

  if (container && container.nodeType === 3 && offset >= container.nodeValue.length) {
    // Insert extra BR element at the end block elements
    if (!hasRightSideContent(editor.schema, container, parentBlock)) {
      brElm = dom.create('br');
      rng.insertNode(brElm);
      rng.setStartAfter(brElm);
      rng.setEndAfter(brElm);
      extraBr = true;
    }
  }

  brElm = dom.create('br');
  rangeInsertNode(dom, rng, brElm);

  moveSelectionToBr(editor, brElm, extraBr);
  editor.undoManager.add();
};

const insertBrBefore = (editor: Editor, inline) => {
  const br = SugarElement.fromTag('br');
  Insert.before(SugarElement.fromDom(inline), br);
  editor.undoManager.add();
};

const insertBrAfter = (editor: Editor, inline) => {
  if (!hasBrAfter(editor.getBody(), inline)) {
    Insert.after(SugarElement.fromDom(inline), SugarElement.fromTag('br'));
  }

  const br = SugarElement.fromTag('br');
  Insert.after(SugarElement.fromDom(inline), br);
  moveSelectionToBr(editor, br.dom, false);
  editor.undoManager.add();
};

const isBeforeBr = (pos) => {
  return NodeType.isBr(pos.getNode());
};

const hasBrAfter = (rootNode, startNode) => {
  if (isBeforeBr(CaretPosition.after(startNode))) {
    return true;
  } else {
    return CaretFinder.nextPosition(rootNode, CaretPosition.after(startNode)).map((pos) => {
      return NodeType.isBr(pos.getNode());
    }).getOr(false);
  }
};

const isAnchorLink = (elm) => {
  return elm && elm.nodeName === 'A' && 'href' in elm;
};

const isInsideAnchor = (location) => {
  return location.fold(
    Fun.never,
    isAnchorLink,
    isAnchorLink,
    Fun.never
  );
};

const readInlineAnchorLocation = (editor: Editor) => {
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const position = CaretPosition.fromRangeStart(editor.selection.getRng());
  return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), position).filter(isInsideAnchor);
};

const insertBrOutsideAnchor = (editor: Editor, location) => {
  location.fold(
    Fun.noop,
    Fun.curry(insertBrBefore, editor),
    Fun.curry(insertBrAfter, editor),
    Fun.noop
  );
};

const insert = (editor: Editor, evt?) => {
  const anchorLocation = readInlineAnchorLocation(editor);

  if (anchorLocation.isSome()) {
    anchorLocation.each(Fun.curry(insertBrOutsideAnchor, editor));
  } else {
    insertBrAtCaret(editor, evt);
  }
};

export {
  insert
};
