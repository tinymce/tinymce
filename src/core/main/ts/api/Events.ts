/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { EditorMode } from 'tinymce/core/Mode';
import { HTMLElement } from '@ephox/dom-globals';

const firePreProcess = (editor: Editor, args) => editor.fire('PreProcess', args);

const firePostProcess = (editor: Editor, args) => editor.fire('PostProcess', args);

const fireRemove = (editor: Editor) => editor.fire('remove');

const fireSwitchMode = (editor: Editor, mode: EditorMode) => editor.fire('SwitchMode', { mode });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResizeStart', { target, width, height });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResized', { target, width, height });
};

export default {
  firePreProcess,
  firePostProcess,
  fireRemove,
  fireSwitchMode,
  fireObjectResizeStart,
  fireObjectResized
};