/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Option } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import * as LazyEvaluator from '../util/LazyEvaluator';
import * as ContextSelectors from './ContextSelectors';
import * as NewLineUtils from './NewLineUtils';

const newLineAction = Adt.generate([
  { br: [ ] },
  { block: [ ] },
  { none: [ ] }
]);

const shouldBlockNewLine = function (editor: Editor, _shiftKey) {
  return ContextSelectors.shouldBlockNewLine(editor);
};

const isBrMode = function (requiredState) {
  return function (editor: Editor, _shiftKey) {
    const brMode = Settings.getForcedRootBlock(editor) === '';
    return brMode === requiredState;
  };
};

const inListBlock = function (requiredState) {
  return function (editor: Editor, _shiftKey) {
    return NewLineUtils.isListItemParentBlock(editor) === requiredState;
  };
};

const inBlock = (blockName: string, requiredState: boolean) => function (editor: Editor, _shiftKey) {
  const state = NewLineUtils.getParentBlockName(editor) === blockName.toUpperCase();
  return state === requiredState;
};

const inPreBlock = (requiredState: boolean) => inBlock('pre', requiredState);
const inSummaryBlock = () => inBlock('summary', true);

const shouldPutBrInPre = function (requiredState) {
  return function (editor: Editor, _shiftKey) {
    return Settings.shouldPutBrInPre(editor) === requiredState;
  };
};

const inBrContext = function (editor: Editor, _shiftKey) {
  return ContextSelectors.shouldInsertBr(editor);
};

const hasShiftKey = function (_editor: Editor, shiftKey) {
  return shiftKey;
};

const canInsertIntoEditableRoot = function (editor: Editor) {
  const forcedRootBlock = Settings.getForcedRootBlock(editor);
  const rootEditable = NewLineUtils.getEditableRoot(editor.dom, editor.selection.getStart());

  return rootEditable && editor.schema.isValidChild(rootEditable.nodeName, forcedRootBlock ? forcedRootBlock : 'P');
};

const match = function (predicates, action) {
  return function (editor: Editor, shiftKey) {
    const isMatch = Arr.foldl(predicates, function (res, p) {
      return res && p(editor, shiftKey);
    }, true);

    return isMatch ? Option.some(action) : Option.none();
  };
};

const getAction = function (editor: Editor, evt?) {
  return LazyEvaluator.evaluateUntil([
    match([ shouldBlockNewLine ], newLineAction.none()),
    match([ inSummaryBlock() ], newLineAction.br()),
    match([ inPreBlock(true), shouldPutBrInPre(false), hasShiftKey ], newLineAction.br()),
    match([ inPreBlock(true), shouldPutBrInPre(false) ], newLineAction.block()),
    match([ inPreBlock(true), shouldPutBrInPre(true), hasShiftKey ], newLineAction.block()),
    match([ inPreBlock(true), shouldPutBrInPre(true) ], newLineAction.br()),
    match([ inListBlock(true), hasShiftKey ], newLineAction.br()),
    match([ inListBlock(true) ], newLineAction.block()),
    match([ isBrMode(true), hasShiftKey, canInsertIntoEditableRoot ], newLineAction.block()),
    match([ isBrMode(true) ], newLineAction.br()),
    match([ inBrContext ], newLineAction.br()),
    match([ isBrMode(false), hasShiftKey ], newLineAction.br()),
    match([ canInsertIntoEditableRoot ], newLineAction.block())
  ], [ editor, !!(evt && evt.shiftKey) ]).getOr(newLineAction.none());
};

export {
  getAction
};
