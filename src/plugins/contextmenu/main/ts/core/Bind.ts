/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Coords from './Coords';
import ContextMenu from '../ui/ContextMenu';

const isNativeOverrideKeyEvent = function (editor, e) {
  return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
};

const setup = function (editor, visibleState, menu) {
  editor.on('contextmenu', function (e) {
    if (isNativeOverrideKeyEvent(editor, e)) {
      return;
    }

    e.preventDefault();
    ContextMenu.show(editor, Coords.getPos(editor, e), visibleState, menu);
  });
};

export default {
  setup
};