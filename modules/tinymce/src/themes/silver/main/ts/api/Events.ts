/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const fireSkinLoaded = (editor) => {
  return editor.fire('SkinLoaded');
};

const fireResizeEditor = (editor) => {
  return editor.fire('ResizeEditor');
};

const fireBeforeRenderUI = (editor) => {
  return editor.fire('BeforeRenderUI');
};

const fireResizeContent = (editor) => {
  return editor.fire('ResizeContent');
};

const fireTextColorChange = (editor, data) => {
  editor.fire('TextColorChange', data);
};

export default {
  fireSkinLoaded,
  fireResizeEditor,
  fireBeforeRenderUI,
  fireResizeContent,
  fireTextColorChange
};