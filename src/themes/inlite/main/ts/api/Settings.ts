/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/api/EditorManager';
import EditorSettings from '../alien/EditorSettings';
import Layout from '../core/Layout';

const toAbsoluteUrl = function (editor, url) {
  return editor.documentBaseURI.toAbsolute(url);
};

const urlFromName = function (name) {
  const prefix = EditorManager.baseURL + '/skins/';
  return name ? prefix + name : prefix + 'lightgray';
};

const getTextSelectionToolbarItems = function (editor) {
  return EditorSettings.getToolbarItemsOr(editor, 'selection_toolbar', ['bold', 'italic', '|', 'quicklink', 'h2', 'h3', 'blockquote']);
};

const getInsertToolbarItems = function (editor) {
  return EditorSettings.getToolbarItemsOr(editor, 'insert_toolbar', ['quickimage', 'quicktable']);
};

const getPositionHandler = function (editor) {
  return EditorSettings.getHandlerOr(editor, 'inline_toolbar_position_handler', Layout.defaultHandler);
};

const getSkinUrl = function (editor) {
  const settings = editor.settings;
  return settings.skin_url ? toAbsoluteUrl(editor, settings.skin_url) : urlFromName(settings.skin);
};

const isSkinDisabled = function (editor) {
  return editor.settings.skin === false;
};

export default {
  getTextSelectionToolbarItems,
  getInsertToolbarItems,
  getPositionHandler,
  getSkinUrl,
  isSkinDisabled
};