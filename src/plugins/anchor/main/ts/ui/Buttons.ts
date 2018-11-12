/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const register = function (editor) {
  editor.ui.registry.addToggleButton('anchor', {
    icon: 'bookmark',
    tooltip: 'Anchor',
    onAction: () => editor.execCommand('mceAnchor'),
    onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('a:not([href])', buttonApi.setActive).unbind
  });

  editor.ui.registry.addMenuItem('anchor', {
    icon: 'bookmark',
    text: 'Anchor...',
    onAction: () => editor.execCommand('mceAnchor')
  });
};

export default {
  register
};