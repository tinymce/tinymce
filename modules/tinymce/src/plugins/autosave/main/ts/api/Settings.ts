/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Time from '../core/Time';
import { document } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const shouldAskBeforeUnload = (editor: Editor) => editor.getParam('autosave_ask_before_unload', true);

const getAutoSavePrefix = (editor: Editor) => {
  const location = document.location;

  return editor.getParam('autosave_prefix', 'tinymce-autosave-{path}{query}{hash}-{id}-')
    .replace(/{path}/g, location.pathname)
    .replace(/{query}/g, location.search)
    .replace(/{hash}/g, location.hash)
    .replace(/{id}/g, editor.id);
};

const shouldRestoreWhenEmpty = (editor: Editor) => editor.getParam('autosave_restore_when_empty', false);

const getAutoSaveInterval = (editor: Editor) => Time.parse(editor.getParam('autosave_interval'), '30s');

const getAutoSaveRetention = (editor: Editor) => Time.parse(editor.getParam('autosave_retention'), '20m');

const getForcedRootBlock = (editor: Editor) => editor.getParam('forced_root_block');

export {
  shouldAskBeforeUnload,
  getAutoSavePrefix,
  shouldRestoreWhenEmpty,
  getAutoSaveInterval,
  getAutoSaveRetention,
  getForcedRootBlock
};
