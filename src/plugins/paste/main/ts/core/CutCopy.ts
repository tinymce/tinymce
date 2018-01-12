/**
 * CutCopy.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/Env';
import InternalHtml from './InternalHtml';
import Utils from './Utils';

const noop = function () {
};

const hasWorkingClipboardApi = function (clipboardData) {
  // iOS supports the clipboardData API but it doesn't do anything for cut operations
  // Edge 15 has a broken HTML Clipboard API see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11780845/
  return Env.iOS === false && clipboardData !== undefined && typeof clipboardData.setData === 'function' && Utils.isMsEdge() !== true;
};

const setHtml5Clipboard = function (clipboardData, html, text) {
  if (hasWorkingClipboardApi(clipboardData)) {
    try {
      clipboardData.clearData();
      clipboardData.setData('text/html', html);
      clipboardData.setData('text/plain', text);
      clipboardData.setData(InternalHtml.internalHtmlMime(), html);
      return true;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
};

const setClipboardData = function (evt, data, fallback, done) {
  if (setHtml5Clipboard(evt.clipboardData, data.html, data.text)) {
    evt.preventDefault();
    done();
  } else {
    fallback(data.html, done);
  }
};

const fallback = function (editor) {
  return function (html, done) {
    const markedHtml = InternalHtml.mark(html);
    const outer = editor.dom.create('div', {
      'contenteditable': 'false',
      'data-mce-bogus': 'all'
    });
    const inner = editor.dom.create('div', { contenteditable: 'true' }, markedHtml);
    editor.dom.setStyles(outer, {
      position: 'fixed',
      left: '-3000px',
      width: '1000px',
      overflow: 'hidden'
    });
    outer.appendChild(inner);
    editor.dom.add(editor.getBody(), outer);

    const range = editor.selection.getRng();
    inner.focus();

    const offscreenRange = editor.dom.createRng();
    offscreenRange.selectNodeContents(inner);
    editor.selection.setRng(offscreenRange);

    setTimeout(function () {
      outer.parentNode.removeChild(outer);
      editor.selection.setRng(range);
      done();
    }, 0);
  };
};

const getData = function (editor) {
  return {
    html: editor.selection.getContent({ contextual: true }),
    text: editor.selection.getContent({ format: 'text' })
  };
};

const cut = function (editor) {
  return function (evt) {
    if (editor.selection.isCollapsed() === false) {
      setClipboardData(evt, getData(editor), fallback(editor), function () {
        // Chrome fails to execCommand from another execCommand with this message:
        // "We don't execute document.execCommand() this time, because it is called recursively.""
        setTimeout(function () { // detach
          editor.execCommand('Delete');
        }, 0);
      });
    }
  };
};

const copy = function (editor) {
  return function (evt) {
    if (editor.selection.isCollapsed() === false) {
      setClipboardData(evt, getData(editor), fallback(editor), noop);
    }
  };
};

const register = function (editor) {
  editor.on('cut', cut(editor));
  editor.on('copy', copy(editor));
};

export default {
  register
};