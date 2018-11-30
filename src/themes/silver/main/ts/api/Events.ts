/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const fireSkinLoaded = function (editor) {
  return editor.fire('SkinLoaded');
};

const fireResizeEditor = function (editor) {
  return editor.fire('ResizeEditor');
};

const fireBeforeRenderUI = function (editor) {
  return editor.fire('BeforeRenderUI');
};

export default {
  fireSkinLoaded,
  fireResizeEditor,
  fireBeforeRenderUI
};