/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const enableWhenDirty = (editor: Editor): boolean =>
  editor.getParam('save_enablewhendirty', true);

const hasOnSaveCallback = (editor: Editor): boolean =>
  !!editor.getParam('save_onsavecallback');

const hasOnCancelCallback = (editor: Editor): boolean =>
  !!editor.getParam('save_oncancelcallback');

export {
  enableWhenDirty,
  hasOnSaveCallback,
  hasOnCancelCallback
};
