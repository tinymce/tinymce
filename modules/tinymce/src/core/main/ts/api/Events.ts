/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import Editor from './Editor';

const firePreProcess = (editor: Editor, args) => editor.fire('PreProcess', args);

const firePostProcess = (editor: Editor, args) => editor.fire('PostProcess', args);

const fireRemove = (editor: Editor) => editor.fire('remove');

const fireDetach = (editor: Editor) => editor.fire('detach');

const fireSwitchMode = (editor: Editor, mode: string) => editor.fire('SwitchMode', { mode });

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
  fireDetach,
  fireSwitchMode,
  fireObjectResizeStart,
  fireObjectResized
};