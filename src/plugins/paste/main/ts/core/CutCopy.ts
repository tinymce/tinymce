/**
 * CutCopy.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/api/Env';
import InternalHtml from './InternalHtml';
import Utils from './Utils';
import { Editor } from 'tinymce/core/api/Editor';
import { DataTransfer, ClipboardEvent, Range } from '@ephox/dom-globals';

const noop = function () {
};

interface SelectionContentData {
  html: string;
  text: string;
}

const hasWorkingClipboardApi = (clipboardData: DataTransfer) => {
  // iOS supports the clipboardData API but it doesn't do anything for cut operations
  // Edge 15 has a broken HTML Clipboard API see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11780845/
  return Env.iOS === false && clipboardData !== undefined && typeof clipboardData.setData === 'function' && Utils.isMsEdge() !== true;
};

const setHtml5Clipboard = (clipboardData: DataTransfer, html: string, text: string) => {
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

type DoneFn = () => void;
type FallbackFn = (html: string, done: DoneFn) => void;

const setClipboardData = (evt: ClipboardEvent, data: SelectionContentData, fallback: FallbackFn, done: DoneFn) => {
  if (setHtml5Clipboard(evt.clipboardData, data.html, data.text)) {
    evt.preventDefault();
    done();
  } else {
    fallback(data.html, done);
  }
};

const fallback = (editor: Editor): FallbackFn => (html, done) => {
  const markedHtml = InternalHtml.mark(html);
  const outer = editor.dom.create('div', {
    'contenteditable': 'false',
    'data-mce-bogus': 'all'
  });
  const inner = editor.dom.create('div', { contenteditable: 'true' }, markedHtml);
  editor.dom.setStyles(outer, {
    position: 'fixed',
    top: '0',
    left: '-3000px',
    width: '1000px',
    overflow: 'hidden'
  });
  outer.appendChild(inner);
  editor.dom.add(editor.getBody(), outer);

  const range = editor.selection.getRng();
  inner.focus();

  const offscreenRange: Range = editor.dom.createRng();
  offscreenRange.selectNodeContents(inner);
  editor.selection.setRng(offscreenRange);

  setTimeout(() => {
    editor.selection.setRng(range);
    outer.parentNode.removeChild(outer);
    done();
  }, 0);
};

const getData = (editor: Editor): SelectionContentData => (
  {
    html: editor.selection.getContent({ contextual: true }),
    text: editor.selection.getContent({ format: 'text' })
  }
);

const cut = (editor: Editor) => (evt: ClipboardEvent) => {
  if (editor.selection.isCollapsed() === false) {
    setClipboardData(evt, getData(editor), fallback(editor), () => {
      // Chrome fails to execCommand from another execCommand with this message:
      // "We don't execute document.execCommand() this time, because it is called recursively.""
      setTimeout(() => { // detach
        editor.execCommand('Delete');
      }, 0);
    });
  }
};

const copy = (editor: Editor) => (evt: ClipboardEvent) => {
  if (editor.selection.isCollapsed() === false) {
    setClipboardData(evt, getData(editor), fallback(editor), noop);
  }
};

const register = (editor: Editor) => {
  editor.on('cut', cut(editor));
  editor.on('copy', copy(editor));
};

export default {
  register
};