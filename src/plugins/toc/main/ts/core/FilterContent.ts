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

var setup = function (editor) {
  var $ = editor.$, tocClass = Settings.getTocClass(editor);

  editor.on('PreProcess', function (e) {
    var $tocElm = $('.' + tocClass, e.node);
    if ($tocElm.length) {
      $tocElm.removeAttr('contentEditable');
      $tocElm.find('[contenteditable]').removeAttr('contentEditable');
    }
  });

  editor.on('SetContent', function () {
    var $tocElm = $('.' + tocClass);
    if ($tocElm.length) {
      $tocElm.attr('contentEditable', false);
      $tocElm.children(':first-child').attr('contentEditable', true);
    }
  });
};

export default {
  setup: setup
};