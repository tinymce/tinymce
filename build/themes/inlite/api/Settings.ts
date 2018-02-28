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
import { Editor } from 'tinymce/core/api/Editor';

const toAbsoluteUrl = function (editor: Editor, url: string) {
  return editor.documentBaseURI.toAbsolute(url);
};

const urlFromName = function (name: string) {
  const prefix = EditorManager.baseURL + '/skins/';
  return name ? prefix + name : prefix + 'lightgray';
};

const getTextSelectionToolbarItems = function (editor: Editor) {
  return EditorSettings.getToolbarItemsOr(editor, 'selection_toolbar', ['bold', 'italic', '|', 'quicklink', 'h2', 'h3', 'blockquote']);
};

const getInsertToolbarItems = function (editor: Editor) {
  return EditorSettings.getToolbarItemsOr(editor, 'insert_toolbar', ['quickimage', 'quicktable']);
};

const getPositionHandler = function (editor: Editor) {
  return EditorSettings.getHandlerOr(editor, 'inline_toolbar_position_handler', Layout.defaultHandler);
};

const getSkinUrl = function (editor: Editor) {
  const settings = editor.settings;
  return settings.skin_url ? toAbsoluteUrl(editor, settings.skin_url) : urlFromName(settings.skin);
};

const isSkinDisabled = function (editor: Editor) {
  return editor.settings.skin === false;
};

export default {
  getTextSelectionToolbarItems,
  getInsertToolbarItems,
  getPositionHandler,
  getSkinUrl,
  isSkinDisabled
};