/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fireRestoreDraft = (editor) => {
  return editor.fire('RestoreDraft');
};

const fireStoreDraft = (editor) => {
  return editor.fire('StoreDraft');
};

const fireRemoveDraft = (editor) => {
  return editor.fire('RemoveDraft');
};

export {
  fireRestoreDraft,
  fireStoreDraft,
  fireRemoveDraft
};