/**
 * EditorView.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun, Option } from '@ephox/katamari';
import { Compare, Element, Css, Traverse } from '@ephox/sugar';

const getProp = function (propName, elm) {
  const rawElm = elm.dom();
  return rawElm[propName];
};

const getComputedSizeProp = function (propName, elm) {
  return parseInt(Css.get(elm, propName), 10);
};

const getClientWidth = Fun.curry(getProp, 'clientWidth');
const getClientHeight = Fun.curry(getProp, 'clientHeight');
const getMarginTop = Fun.curry(getComputedSizeProp, 'margin-top');
const getMarginLeft = Fun.curry(getComputedSizeProp, 'margin-left');

const getBoundingClientRect = function (elm) {
  return elm.dom().getBoundingClientRect();
};

const isInsideElementContentArea = function (bodyElm, clientX, clientY) {
  const clientWidth = getClientWidth(bodyElm);
  const clientHeight = getClientHeight(bodyElm);

  return clientX >= 0 && clientY >= 0 && clientX <= clientWidth && clientY <= clientHeight;
};

const transpose = function (inline, elm, clientX, clientY) {
  const clientRect = getBoundingClientRect(elm);
  const deltaX = inline ? clientRect.left + elm.dom().clientLeft + getMarginLeft(elm) : 0;
  const deltaY = inline ? clientRect.top + elm.dom().clientTop + getMarginTop(elm) : 0;
  const x = clientX - deltaX;
  const y = clientY - deltaY;

  return { x, y };
};

// Checks if the specified coordinate is within the visual content area excluding the scrollbars
const isXYInContentArea = function (editor, clientX, clientY) {
  const bodyElm = Element.fromDom(editor.getBody());
  const targetElm = editor.inline ? bodyElm : Traverse.documentElement(bodyElm);
  const transposedPoint = transpose(editor.inline, targetElm, clientX, clientY);

  return isInsideElementContentArea(targetElm, transposedPoint.x, transposedPoint.y);
};

const fromDomSafe = function (node) {
  return Option.from(node).map(Element.fromDom);
};

const isEditorAttachedToDom = function (editor) {
  const rawContainer = editor.inline ? editor.getBody() : editor.getContentAreaContainer();

  return fromDomSafe(rawContainer).map(function (container) {
    return Compare.contains(Traverse.owner(container), container);
  }).getOr(false);
};

export default {
  isXYInContentArea,
  isEditorAttachedToDom
};