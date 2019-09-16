/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UIEvent } from '@ephox/dom-globals';

const fireSkinLoaded = (editor) => {
  return editor.fire('SkinLoaded');
};

const fireResizeEditor = (editor) => {
  return editor.fire('ResizeEditor');
};

const fireBeforeRenderUI = (editor) => {
  return editor.fire('BeforeRenderUI');
};

const fireResizeContent = (editor, e: UIEvent) => {
  return editor.fire('ResizeContent', e);
};

const fireScrollContent = (editor, e: UIEvent) => {
  return editor.fire('ScrollContent', e);
};

const fireTextColorChange = (editor, data) => {
  editor.fire('TextColorChange', data);
};

export default {
  fireSkinLoaded,
  fireResizeEditor,
  fireScrollContent,
  fireBeforeRenderUI,
  fireResizeContent,
  fireTextColorChange
};
