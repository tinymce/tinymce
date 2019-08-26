/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UIEvent } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const fireSkinLoaded = (editor: Editor) => {
  return editor.fire('SkinLoaded');
};

const fireResizeEditor = (editor: Editor) => {
  return editor.fire('ResizeEditor');
};

const fireBeforeRenderUI = (editor: Editor) => {
  return editor.fire('BeforeRenderUI');
};

const fireResizeContent = (editor: Editor, e: UIEvent) => {
  return editor.fire('ResizeContent', e);
};

const fireScrollContent = (editor: Editor, e: UIEvent) => {
  return editor.fire('ScrollContent', e);
};

const fireTextColorChange = (editor: Editor, data: { name: string; color: string }) => {
  return editor.fire('TextColorChange', data);
};

export default {
  fireSkinLoaded,
  fireResizeEditor,
  fireScrollContent,
  fireBeforeRenderUI,
  fireResizeContent,
  fireTextColorChange
};
