/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';

type PasteFn = (editor: Editor, html: string) => boolean;

const pasteHtml = (editor: Editor, html: string): boolean => {
  editor.insertContent(html, {
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

const isAbsoluteUrl = (url: string): boolean =>
  /^https?:\/\/[\w\?\-\/+=.&%@~#]+$/i.test(url);

const isImageUrl = (editor: Editor, url: string): boolean => {
  return isAbsoluteUrl(url) && Arr.exists(Settings.getAllowedImageFileTypes(editor), (type) =>
    Strings.endsWith(url.toLowerCase(), `.${type.toLowerCase()}`)
  );
};

const createImage = (editor: Editor, url: string, pasteHtmlFn: PasteFn): boolean => {
  editor.undoManager.extra(() => {
    pasteHtmlFn(editor, url);
  }, () => {
    editor.insertContent('<img src="' + url + '">');
  });

  return true;
};

const createLink = (editor: Editor, url: string, pasteHtmlFn: PasteFn): boolean => {
  editor.undoManager.extra(() => {
    pasteHtmlFn(editor, url);
  }, () => {
    editor.execCommand('mceInsertLink', false, url);
  });

  return true;
};

const linkSelection = (editor: Editor, html: string, pasteHtmlFn: PasteFn): boolean => {
  return editor.selection.isCollapsed() === false && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtmlFn) : false;
};

const insertImage = (editor: Editor, html: string, pasteHtmlFn: PasteFn): boolean => {
  return isImageUrl(editor, html) ? createImage(editor, html, pasteHtmlFn) : false;
};

const smartInsertContent = (editor: Editor, html: string): void => {
  Tools.each([
    linkSelection,
    insertImage,
    pasteHtml
  ], (action) => {
    return action(editor, html, pasteHtml) !== true;
  });
};

const insertContent = (editor: Editor, html: string, pasteAsText: boolean): void => {
  if (pasteAsText || Settings.isSmartPasteEnabled(editor) === false) {
    pasteHtml(editor, html);
  } else {
    smartInsertContent(editor, html);
  }
};

export {
  isImageUrl,
  isAbsoluteUrl,
  insertContent
};
