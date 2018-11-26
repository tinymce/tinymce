/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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