/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Util from '../core/Util';

const register = (editor: Editor): void => {
  const exec = (command: string) => () => editor.execCommand(command);

  if (!editor.hasPlugin('advlist')) {
    editor.ui.registry.addToggleButton('numlist', {
      icon: 'ordered-list',
      active: false,
      tooltip: 'Numbered list',
      onAction: exec('InsertOrderedList'),
      onSetup: (api) => Util.listState(editor, 'OL', api.setActive)
    });

    editor.ui.registry.addToggleButton('bullist', {
      icon: 'unordered-list',
      active: false,
      tooltip: 'Bullet list',
      onAction: exec('InsertUnorderedList'),
      onSetup: (api) => Util.listState(editor, 'UL', api.setActive)
    });
  }
};

export {
  register
};
