import { Arr, Cell, Fun } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as CaretContainerRemove from '../caret/CaretContainerRemove';
import CaretPosition from '../caret/CaretPosition';
import * as WordSelection from '../selection/WordSelection';
import * as BoundaryCaret from './BoundaryCaret';
import * as BoundaryLocation from './BoundaryLocation';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

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
  Options.isInlineBoundariesEnabled(editor) ? findLocation(editor, caret, forward).isSome() : false;

const moveWord = (forward: boolean, editor: Editor, _caret: Cell<Text>) =>
  Options.isInlineBoundariesEnabled(editor) ? WordSelection.moveByWord(forward, editor) : false;

const setupSelectedState = (editor: Editor): Cell<Text> => {
  const caret = Cell(null);
  const isInlineTarget: NodePredicate = Fun.curry(InlineUtils.isInlineTarget, editor);

  editor.on('NodeChange', (e) => {
    if (Options.isInlineBoundariesEnabled(editor)) {
      toggleInlines(isInlineTarget, editor.dom, e.parents);
      safeRemoveCaretContainer(editor, caret);
      renderInsideInlineCaret(isInlineTarget, editor, caret, e.parents);
    }
  });

  return caret;
};

const moveNextWord = Fun.curry(moveWord, true);
const movePrevWord = Fun.curry(moveWord, false);

const moveToLineEndPoint = (editor: Editor, forward: boolean, caret: Cell<Text>): boolean => {
  if (Options.isInlineBoundariesEnabled(editor)) {
    // Try to find the line endpoint, however if one isn't found then assume we're already at the end point
    const linePoint = NavigationUtils.getLineEndPoint(editor, forward).getOrThunk(() => {
      const rng = editor.selection.getRng();
      return forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);
    });

    return BoundaryLocation.readLocation(Fun.curry(InlineUtils.isInlineTarget, editor), editor.getBody(), linePoint).exists((loc) => {
      const outsideLoc = BoundaryLocation.outside(loc);
      return BoundaryCaret.renderCaret(caret, outsideLoc).exists((pos) => {
        setCaretPosition(editor, pos);
        return true;
      });
    });
  } else {
    return false;
  }
};

export {
  move,
  moveNextWord,
  movePrevWord,
  moveToLineEndPoint,
  setupSelectedState,
  setCaretPosition
};
