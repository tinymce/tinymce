/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Adt, Arr, Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { isText } from '../utils/Utils';
import * as Spot from '../utils/Spot';
import { TextWalker } from './TextWalker';

export interface OutcomeAdt extends Adt {
  fold: <R, T = any>(aborted: () => R, edge: (edge: Node) => R, success: (info: T) => R) => R;
  match: <R, T = any>(matches: {aborted: () => R, edge: (edge: Node) => R, success: (info: T) => R}) => R;
}

export interface Outcome<T> {
  aborted: () => OutcomeAdt;
  edge: (elm: Node) => OutcomeAdt;
  success: (info: T) => OutcomeAdt;
}

export interface PhaseAdt extends Adt {
  fold: <R, T = any>(abort: () => R, kontinue: () => R, finish: (info: T) => R) => R;
  match: <R, T = any>(matches: {abort: () => R, kontinue: () => R, finish: (info: T) => R}) => R;
}

export interface Phase<T> {
  abort: () => PhaseAdt;
  kontinue: () => PhaseAdt;
  finish: (info: T) => PhaseAdt;
}

export type ProcessCallback<T> = (phase: Phase<T>, element: Text, text: string, optOffset: Option<number>) => PhaseAdt;

// Finds the text node before the specified node, or just returns the node if it's already on a text node
const textBefore = (node: Node, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (isText(node) && offset >= 0) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textWalker = TextWalker(node, rootNode);
    return textWalker.prev().map((prev) => {
      return Spot.point(prev, prev.data.length);
    });
  }
};

const scanLeft = (node: Text, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (!isText(node)) {
    return Option.none();
  }
  const text = node.textContent;
  if (offset >= 0 && offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textWalker = TextWalker(node, rootNode);
    return textWalker.prev().bind((prev) => {
      const prevText = prev.textContent;
      return scanLeft(prev, offset + prevText.length, rootNode);
    });
  }
};

const scanRight = (node: Text, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (!isText(node)) {
    return Option.none();
  }
  const text = node.textContent;
  if (offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textWalker = TextWalker(node, rootNode);
    return textWalker.next().bind((next) => {
      return scanRight(next, offset - text.length, rootNode);
    });
  }
};

// This largely is derived from robins isBoundary check, however it also treats contenteditable=false elements as a boundary
// See robins `Structure.isEmptyTag` for the list of quasi block elements
const isBoundary = (dom: DOMUtils, node: Node) => dom.isBlock(node) || Arr.contains(['BR', 'IMG', 'HR', 'INPUT'], node.nodeName) || dom.getContentEditable(node) === 'false';

const outcome = Adt.generate<Outcome<any>>([
  { aborted: [ ] },
  { edge: [ 'element' ] },
  { success: [ 'info' ] }
]);

const phase = Adt.generate<Phase<any>>([
  { abort: [ ] },
  { kontinue: [ ] },
  { finish: [ 'info' ] }
]);

const repeat = <T>(dom: DOMUtils, node: Node, offset: Option<number>, process: ProcessCallback<T>, walker: () => Node, recent: Option<Node>): OutcomeAdt => {
  const terminate = () => {
    return recent.fold(outcome.aborted, outcome.edge);
  };

  const recurse = () => {
    const next = walker();
    if (next) {
      return repeat(dom, next, Option.none(), process, walker, Option.some(node));
    } else {
      return terminate();
    }
  };

  if (isBoundary(dom, node)) {
    return terminate();
  } else if (!isText(node)) {
    return recurse();
  } else {
    const text = node.textContent;
    return process(phase, node, text, offset).fold<OutcomeAdt, T>(outcome.aborted, () => recurse(), outcome.success);
  }
};

const repeatLeft = <T>(dom: DOMUtils, node: Node, offset: number, process: ProcessCallback<T>, rootNode: Node): OutcomeAdt => {
  const walker = new TreeWalker(node, rootNode);
  return repeat(dom, node, Option.some(offset), process, walker.prev, Option.none());
};

const repeatRight = <T>(dom: DOMUtils, node: Node, offset: number, process: ProcessCallback<T>, rootNode: Node): OutcomeAdt => {
  const walker = new TreeWalker(node, rootNode);
  return repeat(dom, node, Option.some(offset), process, walker.next, Option.none());
};

export {
  repeatLeft,
  repeatRight,
  scanLeft,
  scanRight,
  textBefore
};
