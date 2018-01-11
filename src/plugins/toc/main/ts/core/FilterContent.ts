/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';

const setup = function (editor) {
  const $ = editor.$, tocClass = Settings.getTocClass(editor);

  editor.on('PreProcess', function (e) {
    const $tocElm = $('.' + tocClass, e.node);
    if ($tocElm.length) {
      $tocElm.removeAttr('contentEditable');
      $tocElm.find('[contenteditable]').removeAttr('contentEditable');
    }
  });

  editor.on('SetContent', function () {
    const $tocElm = $('.' + tocClass);
    if ($tocElm.length) {
      $tocElm.attr('contentEditable', false);
      $tocElm.children(':first-child').attr('contentEditable', true);
    }
  });
};

export default {
  setup
};