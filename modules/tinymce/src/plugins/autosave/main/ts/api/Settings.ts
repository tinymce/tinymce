/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Time from '../core/Time';
import { document } from '@ephox/dom-globals';

const shouldAskBeforeUnload = (editor) => editor.getParam('autosave_ask_before_unload', true);

const getAutoSavePrefix = (editor) => {
  const location = document.location;

  return editor.getParam('autosave_prefix', 'tinymce-autosave-{path}{query}{hash}-{id}-')
    .replace(/{path}/g, location.pathname)
    .replace(/{query}/g, location.search)
    .replace(/{hash}/g, location.hash)
    .replace(/{id}/g, editor.id);
};

const shouldRestoreWhenEmpty = (editor) => editor.getParam('autosave_restore_when_empty', false);

const getAutoSaveInterval = (editor) => Time.parse(editor.settings.autosave_interval, '30s');

const getAutoSaveRetention = (editor) => Time.parse(editor.settings.autosave_retention, '20m');

export {
  shouldAskBeforeUnload,
  getAutoSavePrefix,
  shouldRestoreWhenEmpty,
  getAutoSaveInterval,
  getAutoSaveRetention
};
