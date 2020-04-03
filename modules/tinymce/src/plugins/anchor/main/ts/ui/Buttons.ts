/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor) => {
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

export {
  register
};
