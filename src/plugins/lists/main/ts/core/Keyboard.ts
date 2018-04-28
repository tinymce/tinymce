/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import VK from 'tinymce/core/api/util/VK';
import Indent from '../actions/Indent';
import Outdent from '../actions/Outdent';
import Settings from '../api/Settings';
import Delete from './Delete';

const setupTabKey = function (editor) {
  editor.on('keydown', function (e) {
    // Check for tab but not ctrl/cmd+tab since it switches browser tabs
    if (e.keyCode !== VK.TAB || VK.metaKeyPressed(e)) {
      return;
    }

    if (editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD')) {
      e.preventDefault();

      if (e.shiftKey) {
        Outdent.outdentSelection(editor);
      } else {
        Indent.indentSelection(editor);
      }
    }
  });
};

const setup = function (editor) {
  if (Settings.shouldIndentOnTab(editor)) {
    setupTabKey(editor);
  }

  Delete.setup(editor);
};

export default {
  setup
};