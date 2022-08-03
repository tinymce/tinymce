import { Adt, Arr, Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as LazyEvaluator from '../util/LazyEvaluator';
import * as ContextSelectors from './ContextSelectors';
import * as NewLineUtils from './NewLineUtils';

export interface NewLineActionAdt {
  fold: <T> (
    br: VoidFunction,
    block: VoidFunction,
    none: VoidFunction,
  ) => T;
  match: <T> (branches: {
    br: VoidFunction;
    block: VoidFunction;
    none: VoidFunction;
  }) => T;
  log: (label: string) => void;
}

const newLineAction: {
  br: () => NewLineActionAdt;
  block: () => NewLineActionAdt;
  none: () => NewLineActionAdt;
} = Adt.generate([
  { br: [ ] },
  { block: [ ] },
  { none: [ ] }
]);

const shouldBlockNewLine = (editor: Editor, _shiftKey: boolean) => {
  return ContextSelectors.shouldBlockNewLine(editor);
};

const inListBlock = (requiredState: boolean) => {
  return (editor: Editor, _shiftKey: boolean) => {
    return NewLineUtils.isListItemParentBlock(editor) === requiredState;
  };
};

const inBlock = (blockName: string, requiredState: boolean) => (editor: Editor, _shiftKey: boolean) => {
  const state = NewLineUtils.getParentBlockName(editor) === blockName.toUpperCase();
  return state === requiredState;
};

const inPreBlock = (requiredState: boolean) => inBlock('pre', requiredState);
const inSummaryBlock = () => inBlock('summary', true);

const shouldPutBrInPre = (requiredState: boolean) => {
  return (editor: Editor, _shiftKey: boolean) => {
    return Options.shouldPutBrInPre(editor) === requiredState;
  };
};

const inBrContext = (editor: Editor, _shiftKey: boolean) => {
  return ContextSelectors.shouldInsertBr(editor);
};

const hasShiftKey = (_editor: Editor, shiftKey: boolean) => {
  return shiftKey;
};

const canInsertIntoEditableRoot = (editor: Editor) => {
  const forcedRootBlock = Options.getForcedRootBlock(editor);
  const rootEditable = NewLineUtils.getEditableRoot(editor.dom, editor.selection.getStart()).getOr(null);

  return rootEditable && editor.schema.isValidChild(rootEditable.nodeName, forcedRootBlock);
};

const match = (predicates: Array<(editor: Editor, shiftKey: boolean) => boolean>, action: NewLineActionAdt) => {
  return (editor: Editor, shiftKey: boolean) => {
    const isMatch = Arr.foldl(predicates, (res, p) => {
      return res && p(editor, shiftKey);
    }, true);

    return isMatch ? Optional.some(action) : Optional.none();
  };
};

const getAction = (editor: Editor, evt?: EditorEvent<KeyboardEvent>): NewLineActionAdt => {
  return LazyEvaluator.evaluateUntil([
    match([ shouldBlockNewLine ], newLineAction.none()),
    match([ inSummaryBlock() ], newLineAction.br()),
    match([ inPreBlock(true), shouldPutBrInPre(false), hasShiftKey ], newLineAction.br()),
    match([ inPreBlock(true), shouldPutBrInPre(false) ], newLineAction.block()),
    match([ inPreBlock(true), shouldPutBrInPre(true), hasShiftKey ], newLineAction.block()),
    match([ inPreBlock(true), shouldPutBrInPre(true) ], newLineAction.br()),
    match([ inListBlock(true), hasShiftKey ], newLineAction.br()),
    match([ inListBlock(true) ], newLineAction.block()),
    match([ inBrContext ], newLineAction.br()),
    match([ hasShiftKey ], newLineAction.br()),
    match([ canInsertIntoEditableRoot ], newLineAction.block())
  ], [ editor, !!(evt && evt.shiftKey) ]).getOr(newLineAction.none());
};

export {
  getAction
};
