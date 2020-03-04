/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const enableWhenDirty = function (editor) {
  return editor.getParam('save_enablewhendirty', true);
};

const hasOnSaveCallback = function (editor) {
  return !!editor.getParam('save_onsavecallback');
};

const hasOnCancelCallback = function (editor) {
  return !!editor.getParam('save_oncancelcallback');
};

export {
  enableWhenDirty,
  hasOnSaveCallback,
  hasOnCancelCallback
};
