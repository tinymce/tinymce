/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Event } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const fireSkinLoaded = (editor: Editor) => editor.fire('SkinLoaded');

const fireSkinLoadError = (editor: Editor, error: { message: string }) => editor.fire('SkinLoadError', error);

const fireResizeEditor = (editor: Editor) => editor.fire('ResizeEditor');

const fireBeforeRenderUI = (editor: Editor) => editor.fire('BeforeRenderUI');

const fireResizeContent = (editor: Editor, e?: Event) => editor.fire('ResizeContent', e);

const fireScrollContent = (editor: Editor, e: Event) => editor.fire('ScrollContent', e);

const fireTextColorChange = (editor: Editor, data: { name: string; color: string }) => editor.fire('TextColorChange', data);

export {
  fireSkinLoaded,
  fireSkinLoadError,
  fireResizeEditor,
  fireScrollContent,
  fireBeforeRenderUI,
  fireResizeContent,
  fireTextColorChange
};
