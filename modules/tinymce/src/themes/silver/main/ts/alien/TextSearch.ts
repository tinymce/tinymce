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

// Note: This is duplicated with the TextPattern plugins `TextSearch` module, as there isn't really a nice way to share code across
// plugins/themes. So if any changes are made here, be sure to keep changes synced with the textpattern plugin

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

const isText = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;

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

const repeatLeft = <T>(dom: DOMUtils, node: Node, offset: number, process: ProcessCallback<T>, rootNode?: Node): OutcomeAdt => {
  const walker = new TreeWalker(node, rootNode || dom.getRoot());
  return repeat(dom, node, Option.some(offset), process, walker.prev, Option.none());
};

const repeatRight = <T>(dom: DOMUtils, node: Node, offset: number, process: ProcessCallback<T>, rootNode?: Node): OutcomeAdt => {
  const walker = new TreeWalker(node, rootNode || dom.getRoot());
  return repeat(dom, node, Option.some(offset), process, walker.next, Option.none());
};

export {
  repeatLeft,
  repeatRight
};
