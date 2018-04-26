/**
 * NewLineAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Adt,  Arr,  Option } from '@ephox/katamari';
import Settings from '../api/Settings';
import ContextSelectors from './ContextSelectors';
import NewLineUtils from './NewLineUtils';
import LazyEvaluator from '../util/LazyEvaluator';

const newLineAction = Adt.generate([
  { br: [ ] },
  { block: [ ] },
  { none: [ ] }
]);

const shouldBlockNewLine = function (editor, shiftKey) {
  return ContextSelectors.shouldBlockNewLine(editor);
};

const isBrMode = function (requiredState) {
  return function (editor, shiftKey) {
    const brMode = Settings.getForcedRootBlock(editor) === '';
    return brMode === requiredState;
  };
};

const inListBlock = function (requiredState) {
  return function (editor, shiftKey) {
    return NewLineUtils.isListItemParentBlock(editor) === requiredState;
  };
};

const inBlock = (blockName: string, requiredState: boolean) => {
  return function (editor, shiftKey) {
    const state = NewLineUtils.getParentBlockName(editor) === blockName.toUpperCase();
    return state === requiredState;
  };
};

const inPreBlock = (requiredState: boolean) => inBlock('pre', requiredState);
const inSummaryBlock = () => inBlock('summary', true);

const shouldPutBrInPre = function (requiredState) {
  return function (editor, shiftKey) {
    return Settings.shouldPutBrInPre(editor) === requiredState;
  };
};

const inBrContext = function (editor, shiftKey) {
  return ContextSelectors.shouldInsertBr(editor);
};

const hasShiftKey = function (editor, shiftKey) {
  return shiftKey;
};

const canInsertIntoEditableRoot = function (editor) {
  const forcedRootBlock = Settings.getForcedRootBlock(editor);
  const rootEditable = NewLineUtils.getEditableRoot(editor.dom, editor.selection.getStart());

  return rootEditable && editor.schema.isValidChild(rootEditable.nodeName, forcedRootBlock ? forcedRootBlock : 'P');
};

const match = function (predicates, action) {
  return function (editor, shiftKey) {
    const isMatch = Arr.foldl(predicates, function (res, p) {
      return res && p(editor, shiftKey);
    }, true);

    return isMatch ? Option.some(action) : Option.none();
  };
};

const getAction = function (editor, evt) {
  return LazyEvaluator.evaluateUntil([
    match([shouldBlockNewLine], newLineAction.none()),
    match([inSummaryBlock()], newLineAction.br()),
    match([inPreBlock(true), shouldPutBrInPre(false), hasShiftKey], newLineAction.br()),
    match([inPreBlock(true), shouldPutBrInPre(false)], newLineAction.block()),
    match([inPreBlock(true), shouldPutBrInPre(true), hasShiftKey], newLineAction.block()),
    match([inPreBlock(true), shouldPutBrInPre(true)], newLineAction.br()),
    match([inListBlock(true), hasShiftKey], newLineAction.br()),
    match([inListBlock(true)], newLineAction.block()),
    match([isBrMode(true), hasShiftKey, canInsertIntoEditableRoot], newLineAction.block()),
    match([isBrMode(true)], newLineAction.br()),
    match([inBrContext], newLineAction.br()),
    match([isBrMode(false), hasShiftKey], newLineAction.br()),
    match([canInsertIntoEditableRoot], newLineAction.block())
  ], [editor, evt.shiftKey]).getOr(newLineAction.none());
};

export default {
  getAction
};