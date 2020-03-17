/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const fireRestoreDraft = (editor) => editor.fire('RestoreDraft');

const fireStoreDraft = (editor) => editor.fire('StoreDraft');

const fireRemoveDraft = (editor) => editor.fire('RemoveDraft');

export {
  fireRestoreDraft,
  fireStoreDraft,
  fireRemoveDraft
};