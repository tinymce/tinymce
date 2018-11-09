/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const stateSelectorAdapter = (editor, selector) => (buttonApi) =>
  editor.selection.selectorChangedWithUnbind(selector.join(','), buttonApi.setActive).unbind;

const register = function (editor) {
  editor.ui.registry.addToggleButton('media', {
    tooltip: 'Insert/edit media',
    icon: 'embed',
    onAction: () => {
      editor.execCommand('mceMedia');
    },
    onSetup: stateSelectorAdapter(editor, ['img[data-mce-object]', 'span[data-mce-object]', 'div[data-ephox-embed-iri]'])
  });

  editor.ui.registry.addMenuItem('media', {
    icon: 'embed',
    text: 'Media...',
    onAction: () => {
      editor.execCommand('mceMedia');
    }
  });
};

export default {
  register
};