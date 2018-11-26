/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';

const removeMeta = (editor: Editor, html: string) => {
  const body = editor.dom.create('body', {}, html);
  Tools.each(body.querySelectorAll('meta'), (elm) => elm.parentNode.removeChild(elm));
  return body.innerHTML;
};

const pasteHtml = function (editor: Editor, html: string) {
  editor.insertContent(removeMeta(editor, html), {
    merge: Settings.shouldMergeFormats(editor),
    paste: true
  });

  return true;
};

/**
 * Tries to be smart depending on what the user pastes if it looks like an url
 * it will make a link out of the current selection. If it's an image url that looks
 * like an image it will check if it's an image and insert it as an image.
 *
 * @class tinymce.pasteplugin.SmartPaste
 * @private
 */

const isAbsoluteUrl = function (url: string) {
  return /^https?:\/\/[\w\?\-\/+=.&%@~#]+$/i.test(url);
};

const isImageUrl = function (url: string) {
  return isAbsoluteUrl(url) && /.(gif|jpe?g|png)$/.test(url);
};

const createImage = function (editor: Editor, url: string, pasteHtmlFn: typeof pasteHtml) {
  editor.undoManager.extra(function () {
    pasteHtmlFn(editor, url);
  }, function () {
    editor.insertContent('<img src="' + url + '">');
  });

  return true;
};

const createLink = function (editor: Editor, url: string, pasteHtmlFn: typeof pasteHtml) {
  editor.undoManager.extra(function () {
    pasteHtmlFn(editor, url);
  }, function () {
    editor.execCommand('mceInsertLink', false, url);
  });

  return true;
};

const linkSelection = function (editor: Editor, html: string, pasteHtmlFn: typeof pasteHtml) {
  return editor.selection.isCollapsed() === false && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtmlFn) : false;
};

const insertImage = function (editor: Editor, html: string, pasteHtmlFn: typeof pasteHtml) {
  return isImageUrl(html) ? createImage(editor, html, pasteHtmlFn) : false;
};

const smartInsertContent = function (editor: Editor, html: string) {
  Tools.each([
    linkSelection,
    insertImage,
    pasteHtml
  ], function (action) {
    return action(editor, html, pasteHtml) !== true;
  });
};

const insertContent = function (editor: Editor, html: string) {
  if (Settings.isSmartPasteEnabled(editor) === false) {
    pasteHtml(editor, html);
  } else {
    smartInsertContent(editor, html);
  }
};

export default {
  isImageUrl,
  isAbsoluteUrl,
  insertContent
};