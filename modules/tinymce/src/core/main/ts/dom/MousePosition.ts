/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';

/**
 * This module calculates an absolute coordinate inside the editor body for both local and global mouse events.
 *
 * @private
 * @class tinymce.dom.MousePosition
 */

const getAbsolutePosition = function (elm) {
  let doc, docElem, win, clientRect;

  clientRect = elm.getBoundingClientRect();
  doc = elm.ownerDocument;
  docElem = doc.documentElement;
  win = doc.defaultView;

  return {
    top: clientRect.top + win.pageYOffset - docElem.clientTop,
    left: clientRect.left + win.pageXOffset - docElem.clientLeft
  };
};

const getBodyPosition = function (editor: Editor) {
  return editor.inline ? getAbsolutePosition(editor.getBody()) : { left: 0, top: 0 };
};

const getScrollPosition = function (editor: Editor) {
  const body = editor.getBody();
  return editor.inline ? { left: body.scrollLeft, top: body.scrollTop } : { left: 0, top: 0 };
};

const getBodyScroll = function (editor: Editor) {
  const body = editor.getBody(), docElm = editor.getDoc().documentElement;
  const inlineScroll = { left: body.scrollLeft, top: body.scrollTop };
  const iframeScroll = { left: body.scrollLeft || docElm.scrollLeft, top: body.scrollTop || docElm.scrollTop };

  return editor.inline ? inlineScroll : iframeScroll;
};

const getMousePosition = function (editor: Editor, event) {
  if (event.target.ownerDocument !== editor.getDoc()) {
    const iframePosition = getAbsolutePosition(editor.getContentAreaContainer());
    const scrollPosition = getBodyScroll(editor);

    return {
      left: event.pageX - iframePosition.left + scrollPosition.left,
      top: event.pageY - iframePosition.top + scrollPosition.top
    };
  }

  return {
    left: event.pageX,
    top: event.pageY
  };
};

const calculatePosition = function (bodyPosition, scrollPosition, mousePosition) {
  return {
    pageX: (mousePosition.left - bodyPosition.left) + scrollPosition.left,
    pageY: (mousePosition.top - bodyPosition.top) + scrollPosition.top
  };
};

const calc = function (editor: Editor, event) {
  return calculatePosition(getBodyPosition(editor), getScrollPosition(editor), getMousePosition(editor, event));
};

export default {
  calc
};