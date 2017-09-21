/**
 * DeleteUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteUtils',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.PredicateFind',
    'tinymce.core.dom.ElementType'
  ],
  function (Option, Compare, Element, PredicateFind, ElementType) {
    var isBeforeRoot = function (rootNode) {
      return function (elm) {
        return Compare.eq(rootNode, Element.fromDom(elm.dom().parentNode));
      };
    };

    var getParentBlock = function (rootNode, elm) {
      return Compare.contains(rootNode, elm) ? PredicateFind.closest(elm, function (element) {
        return ElementType.isTextBlock(element) || ElementType.isListItem(element);
      }, isBeforeRoot(rootNode)) : Option.none();
    };

    var placeCaretInEmptyBody = function (editor) {
      var body = editor.getBody();
      var node = body.firstChild && editor.dom.isBlock(body.firstChild) ? body.firstChild : body;
      editor.selection.setCursorLocation(node, 0);
    };

    var paddEmptyBody = function (editor) {
      if (editor.dom.isEmpty(editor.getBody())) {
        editor.setContent('');
        placeCaretInEmptyBody(editor);
      }
    };

    return {
      getParentBlock: getParentBlock,
      paddEmptyBody: paddEmptyBody
    };
  }
);
