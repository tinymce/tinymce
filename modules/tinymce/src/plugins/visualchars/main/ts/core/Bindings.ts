/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import * as Actions from './Actions';

const setup = (editor: Editor, toggleState: Cell<boolean>) => {
  editor.on('init', () => {
    toggleState.set(Settings.isEnabledByDefault(editor));
    Actions.applyVisualChars(editor, toggleState);
  });
};

export {
  setup
};
