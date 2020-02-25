/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import * as Actions from './Actions';

const setup = (editor: Editor, toggleState) => {
  editor.on('init', () => {
    // should be false when enabled, so toggling will change it to true
    const valueForToggling = !Settings.isEnabledByDefault(editor);
    toggleState.set(valueForToggling);
    Actions.toggleVisualChars(editor, toggleState);
  });
};

export {
  setup
};
