/**
 * Bindings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import Actions from './Actions';

const setup = function (editor, toggleState) {
  // should be false when enabled, so toggling will change it to true
  const valueForToggling = !Settings.isEnabledByDefault(editor);

  editor.on('init', function () {
    toggleState.set(valueForToggling);
    Actions.toggleVisualChars(editor, toggleState);
  });
};

export default {
  setup
};
