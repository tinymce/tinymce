/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Fun } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Settings from '../api/Settings';
import * as CaretContainerRemove from '../caret/CaretContainerRemove';
import CaretPosition from '../caret/CaretPosition';
import * as WordSelection from '../selection/WordSelection';
import * as BoundaryCaret from './BoundaryCaret';
import * as BoundaryLocation from './BoundaryLocation';
import * as InlineUtils from './InlineUtils';

const setCaretPosition = (editor: Editor, pos: CaretPosition) => {
  const rng = editor.dom.createRng();
  rng.setStart(pos.container(), pos.offset());
  rng.setEnd(pos.container(), pos.offset());
  editor.selection.setRng(rng);
};

type NodePredicate = (node: Node) => boolean;

const setSelected = (state: boolean, elm: HTMLElement) => {
  if (state) {
    elm.setAttribute('data-mce-selected', 'inline-boundary');
  } else {
    elm.removeAttribute('data-mce-selected');
  }
};

const renderCaretLocation = (editor: Editor, caret: Cell<Text>, location: BoundaryLocation.LocationAdt) =>
  BoundaryCaret.renderCaret(caret, location).map((pos) => {
    setCaretPosition(editor, pos);
    return location;
  });

const findLocation = (editor: Editor, caret: Cell<Text>, forward: boolean) => {
  const rootNode = editor.getBody();
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const location = BoundaryLocation.findLocation(forward, isInlineTarget, rootNode, from);
  return location.bind((location) => renderCaretLocation(editor, caret, location));
};

const toggleInlines = (isInlineTarget: NodePredicate, dom: DOMUtils, elms: Node[]) => {
  const inlineBoundaries = Arr.map(SelectorFilter.descendants(SugarElement.fromDom(dom.getRoot()), '*[data-mce-selected="inline-boundary"]'), (e) => e.dom);
  const selectedInlines = Arr.filter(inlineBoundaries, isInlineTarget);
  const targetInlines = Arr.filter(elms, isInlineTarget);
  Arr.each(Arr.difference(selectedInlines, targetInlines), Fun.curry(setSelected, false));
  Arr.each(Arr.difference(targetInlines, selectedInlines), Fun.curry(setSelected, true));
};

const safeRemoveCaretContainer = (editor: Editor, caret: Cell<Text>) => {
  if (editor.selection.isCollapsed() && editor.composing !== true && caret.get()) {
    const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (CaretPosition.isTextPosition(pos) && InlineUtils.isAtZwsp(pos) === false) {
      setCaretPosition(editor, CaretContainerRemove.removeAndReposition(caret.get(), pos));
      caret.set(null);
    }
  }
};

const renderInsideInlineCaret = (isInlineTarget: NodePredicate, editor: Editor, caret: Cell<Text>, elms: Node[]) => {
  if (editor.selection.isCollapsed()) {
    const inlines = Arr.filter(elms, isInlineTarget);
    Arr.each(inlines, (_inline) => {
      const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
      BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), pos).bind((location) =>
        renderCaretLocation(editor, caret, location)
      );
    });
  }
};

const move = (editor: Editor, caret: Cell<Text>, forward: boolean) =>
  Settings.isInlineBoundariesEnabled(editor) ? findLocation(editor, caret, forward).isSome() : false;

const moveWord = (forward: boolean, editor: Editor, _caret: Cell<Text>) =>
  Settings.isInlineBoundariesEnabled(editor) ? WordSelection.moveByWord(forward, editor) : false;

const setupSelectedState = (editor: Editor): Cell<Text> => {
  const caret = Cell(null);
  const isInlineTarget: NodePredicate = Fun.curry(InlineUtils.isInlineTarget, editor);

  editor.on('NodeChange', (e) => {
    // IE will steal the focus when changing the selection since it uses a single selection model
    // as such we should ignore the first node change, as we don't want the editor to steal focus
    // during the initial load. If the content is changed afterwords then we are okay with it
    // stealing focus since it likely means the editor is being interacted with.
    if (Settings.isInlineBoundariesEnabled(editor) && !(Env.browser.isIE() && e.initial)) {
      toggleInlines(isInlineTarget, editor.dom, e.parents);
      safeRemoveCaretContainer(editor, caret);
      renderInsideInlineCaret(isInlineTarget, editor, caret, e.parents);
    }
  });

  return caret;
};

const moveNextWord = Fun.curry(moveWord, true);
const movePrevWord = Fun.curry(moveWord, false);

export {
  move,
  moveNextWord,
  movePrevWord,
  setupSelectedState,
  setCaretPosition
};
