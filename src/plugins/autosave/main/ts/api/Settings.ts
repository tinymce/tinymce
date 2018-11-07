/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import * as Time from '../core/Time';
import { document } from '@ephox/dom-globals';

const shouldAskBeforeUnload = (editor) => {
  return editor.getParam('autosave_ask_before_unload', true);
};

const getAutoSavePrefix = (editor) => {
  let prefix = editor.getParam('autosave_prefix', 'tinymce-autosave-{path}{query}{hash}-{id}-');

  prefix = prefix.replace(/\{path\}/g, document.location.pathname);
  prefix = prefix.replace(/\{query\}/g, document.location.search);
  prefix = prefix.replace(/\{hash\}/g, document.location.hash);
  prefix = prefix.replace(/\{id\}/g, editor.id);

  return prefix;
};

const shouldRestoreWhenEmpty = (editor) => {
  return editor.getParam('autosave_restore_when_empty', false);
};

const getAutoSaveInterval = (editor) => {
  return Time.parse(editor.settings.autosave_interval, '30s');
};

const getAutoSaveRetention = (editor) => {
  return Time.parse(editor.settings.autosave_retention, '20m');
};

export {
  shouldAskBeforeUnload,
  getAutoSavePrefix,
  shouldRestoreWhenEmpty,
  getAutoSaveInterval,
  getAutoSaveRetention
};