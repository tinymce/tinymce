/**
 * SmartPaste.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/util/Tools';
import Settings from '../api/Settings';

/**
 * Tries to be smart depending on what the user pastes if it looks like an url
 * it will make a link out of the current selection. If it's an image url that looks
 * like an image it will check if it's an image and insert it as an image.
 *
 * @class tinymce.pasteplugin.SmartPaste
 * @private
 */

const isAbsoluteUrl = function (url) {
  return /^https?:\/\/[\w\?\-\/+=.&%@~#]+$/i.test(url);
};

const isImageUrl = function (url) {
  return isAbsoluteUrl(url) && /.(gif|jpe?g|png)$/.test(url);
};

const createImage = function (editor, url, pasteHtml) {
  editor.undoManager.extra(function () {
    pasteHtml(editor, url);
  }, function () {
    editor.insertContent('<img src="' + url + '">');
  });

  return true;
};

const createLink = function (editor, url, pasteHtml) {
  editor.undoManager.extra(function () {
    pasteHtml(editor, url);
  }, function () {
    editor.execCommand('mceInsertLink', false, url);
  });

  return true;
};

const linkSelection = function (editor, html, pasteHtml) {
  return editor.selection.isCollapsed() === false && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtml) : false;
};

const insertImage = function (editor, html, pasteHtml) {
  return isImageUrl(html) ? createImage(editor, html, pasteHtml) : false;
};

const pasteHtml = function (editor, html) {
  editor.insertContent(html, {
    merge: Settings.shouldMergeFormats(editor),
    paste: true
  });

  return true;
};

const smartInsertContent = function (editor, html) {
  Tools.each([
    linkSelection,
    insertImage,
    pasteHtml
  ], function (action) {
    return action(editor, html, pasteHtml) !== true;
  });
};

const insertContent = function (editor, html) {
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