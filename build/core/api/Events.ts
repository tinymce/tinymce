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

const firePreProcess = (editor: Editor, args) => editor.fire('PreProcess', args);

const firePostProcess = (editor: Editor, args) => editor.fire('PostProcess', args);

const fireRemove = (editor: Editor) => editor.fire('remove');

const fireSwitchMode = (editor: Editor, mode: EditorMode) => editor.fire('SwitchMode', { mode });

export default {
  firePreProcess,
  firePostProcess,
  fireRemove,
  fireSwitchMode
};