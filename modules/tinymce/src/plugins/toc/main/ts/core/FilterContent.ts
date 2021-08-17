/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../api/Settings';

const setup = (editor: Editor): void => {
  const $ = editor.$, tocClass = Settings.getTocClass(editor);

  editor.on('PreProcess', (e) => {
    const $tocElm = $('.' + tocClass, e.node);
    if ($tocElm.length) {
      $tocElm.removeAttr('contentEditable');
      $tocElm.find('[contenteditable]').removeAttr('contentEditable');
    }
  });

  editor.on('SetContent', () => {
    const $tocElm = $('.' + tocClass);
    if ($tocElm.length) {
      $tocElm.attr('contentEditable', false);
      $tocElm.children(':first-child').attr('contentEditable', true);
    }
  });
};

export {
  setup
};
