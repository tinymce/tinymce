/**
 * EditorView.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.EditorView',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse'
  ],
  function (Fun, Option, Compare, Element, Css, Traverse) {
    var getProp = function (propName, elm) {
      var rawElm = elm.dom();
      return rawElm[propName];
    };

    var getComputedSizeProp = function (propName, elm) {
      return parseInt(Css.get(elm, propName), 10);
    };

    var getClientWidth = Fun.curry(getProp, 'clientWidth');
    var getClientHeight = Fun.curry(getProp, 'clientHeight');
    var getMarginTop = Fun.curry(getComputedSizeProp, 'margin-top');
    var getMarginLeft = Fun.curry(getComputedSizeProp, 'margin-left');

    var getBoundingClientRect = function (elm) {
      return elm.dom().getBoundingClientRect();
    };

    var isInsideElementContentArea = function (bodyElm, clientX, clientY) {
      var clientWidth = getClientWidth(bodyElm);
      var clientHeight = getClientHeight(bodyElm);

      return clientX >= 0 && clientY >= 0 && clientX <= clientWidth && clientY <= clientHeight;
    };

    var transpose = function (inline, elm, clientX, clientY) {
      var clientRect = getBoundingClientRect(elm);
      var deltaX = inline ? clientRect.left + elm.dom().clientLeft + getMarginLeft(elm) : 0;
      var deltaY = inline ? clientRect.top + elm.dom().clientTop + getMarginTop(elm) : 0;
      var x = clientX - deltaX;
      var y = clientY - deltaY;

      return { x: x, y: y };
    };

    // Checks if the specified coordinate is within the visual content area excluding the scrollbars
    var isXYInContentArea = function (editor, clientX, clientY) {
      var bodyElm = Element.fromDom(editor.getBody());
      var targetElm = editor.inline ? bodyElm : Traverse.documentElement(bodyElm);
      var transposedPoint = transpose(editor.inline, targetElm, clientX, clientY);

      return isInsideElementContentArea(targetElm, transposedPoint.x, transposedPoint.y);
    };

    var fromDomSafe = function (node) {
      return Option.from(node).map(Element.fromDom);
    };

    var isEditorAttachedToDom = function (editor) {
      var rawContainer = editor.inline ? editor.getBody() : editor.getContentAreaContainer();

      return fromDomSafe(rawContainer).map(function (container) {
        return Compare.contains(Traverse.owner(container), container);
      }).getOr(false);
    };

    return {
      isXYInContentArea: isXYInContentArea,
      isEditorAttachedToDom: isEditorAttachedToDom
    };
  }
);
