/**
 * NewLineAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.newline.NewLineAction',
  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'tinymce.core.api.Settings',
    'tinymce.core.newline.ContextSelectors',
    'tinymce.core.newline.NewLineUtils',
    'tinymce.core.util.LazyEvaluator'
  ],
  function (Adt, Arr, Option, Settings, ContextSelectors, NewLineUtils, LazyEvaluator) {
    var newLineAction = Adt.generate([
      { br: [ ] },
      { block: [ ] },
      { none: [ ] }
    ]);

    var shouldBlockNewLine = function (editor, shiftKey) {
      return ContextSelectors.shouldBlockNewLine(editor);
    };

    var isBrMode = function (requiredState) {
      return function (editor, shiftKey) {
        var brMode = Settings.getForcedRootBlock(editor) === '';
        return brMode === requiredState;
      };
    };

    var inListBlock = function (requiredState) {
      return function (editor, shiftKey) {
        return NewLineUtils.isListItemParentBlock(editor) === requiredState;
      };
    };

    var inPreBlock = function (requiredState) {
      return function (editor, shiftKey) {
        var inPre = NewLineUtils.getParentBlockName(editor) === 'PRE';
        return inPre === requiredState;
      };
    };

    var shouldPutBrInPre = function (requiredState) {
      return function (editor, shiftKey) {
        return Settings.shouldPutBrInPre(editor) === requiredState;
      };
    };

    var inBrContext = function (editor, shiftKey) {
      return ContextSelectors.shouldInsertBr(editor);
    };

    var hasShiftKey = function (editor, shiftKey) {
      return shiftKey;
    };

    var canInsertIntoEditableRoot = function (editor) {
      var forcedRootBlock = Settings.getForcedRootBlock(editor);
      var rootEditable = NewLineUtils.getEditableRoot(editor.dom, editor.selection.getStart());

      return rootEditable && editor.schema.isValidChild(rootEditable.nodeName, forcedRootBlock ? forcedRootBlock : 'P');
    };

    var match = function (predicates, action) {
      return function (editor, shiftKey) {
        var isMatch = Arr.foldl(predicates, function (res, p) {
          return res && p(editor, shiftKey);
        }, true);

        return isMatch ? Option.some(action) : Option.none();
      };
    };

    var getAction = function (editor, evt) {
      return LazyEvaluator.evaluateUntil([
        match([shouldBlockNewLine], newLineAction.none()),
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

    return {
      getAction: getAction
    };
  }
);
