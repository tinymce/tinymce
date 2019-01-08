/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from './Actions';
import { Editor } from 'tinymce/core/api/Editor';

const setupButtons = (editor: Editor) => {
  const formatBlock = function (name: string) {
    return function () {
      Actions.formatBlock(editor, name);
    };
  };

  for (let i = 1; i < 6; i++) {
    const name = 'h' + i;

    editor.ui.registry.addToggleButton(name, {
      text: name.toUpperCase(),
      tooltip: 'Heading ' + i,
      onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind(name, buttonApi.setActive).unbind,
      onAction: formatBlock(name)
    });
  }
};

export default {
  setupButtons
};

// const addToEditor = function (editor: Editor, panel: InlitePanel) {
//   editor.addButton('quicklink', {
//     icon: 'link',
//     tooltip: 'Insert/Edit link',
//     stateSelector: 'a[href]',
//     onclick () {
//       panel.showForm(editor, 'quicklink');
//     }
//   });
// }