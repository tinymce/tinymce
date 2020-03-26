/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from '@ephox/bridge';

const stateSelectorAdapter = (editor: Editor, selector: string[]) => (buttonApi: Toolbar.ToolbarToggleButtonInstanceApi) =>
  editor.selection.selectorChangedWithUnbind(selector.join(','), buttonApi.setActive).unbind;

const register = function (editor: Editor) {
  editor.ui.registry.addToggleButton('media', {
    tooltip: 'Insert/edit media',
    icon: 'embed',
    onAction: () => {
      editor.execCommand('mceMedia');
    },
    onSetup: stateSelectorAdapter(editor, [ 'img[data-mce-object]', 'span[data-mce-object]', 'div[data-ephox-embed-iri]' ])
  });

  editor.ui.registry.addMenuItem('media', {
    icon: 'embed',
    text: 'Media...',
    onAction: () => {
      editor.execCommand('mceMedia');
    }
  });
};

export {
  register
};
