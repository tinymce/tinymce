/**
 * ContextSelectors.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.newline.ContextSelectors',
  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.api.Settings',
    'tinymce.core.newline.NewLineUtils'
  ],
  function (Element, Selectors, Settings, NewLineUtils) {
    var matchesSelector = function (editor, selector) {
      return NewLineUtils.getParentBlock(editor).filter(function (parentBlock) {
        return selector.length > 0 && Selectors.is(Element.fromDom(parentBlock), selector);
      }).isSome();
    };

    var shouldInsertBr = function (editor) {
      return matchesSelector(editor, Settings.getBrNewLineSelector(editor));
    };

    var shouldBlockNewLine = function (editor) {
      return matchesSelector(editor, Settings.getNoNewLineSelector(editor));
    };

    return {
      shouldInsertBr: shouldInsertBr,
      shouldBlockNewLine: shouldBlockNewLine
    };
  }
);
