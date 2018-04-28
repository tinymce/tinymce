/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import Toc from '../core/Toc';

const toggleState = function (editor) {
  return function (e) {
    const ctrl = e.control;

    editor.on('LoadContent SetContent change', function () {
      ctrl.disabled(editor.readonly || !Toc.hasHeaders(editor));
    });
  };
};

const isToc = function (editor) {
  return function (elm) {
    return elm && editor.dom.is(elm, '.' + Settings.getTocClass(editor)) && editor.getBody().contains(elm);
  };
};

const register = function (editor) {
  editor.addButton('toc', {
    tooltip: 'Table of Contents',
    cmd: 'mceInsertToc',
    icon: 'toc',
    onPostRender: toggleState(editor)
  });

  editor.addButton('tocupdate', {
    tooltip: 'Update',
    cmd: 'mceUpdateToc',
    icon: 'reload'
  });

  editor.addMenuItem('toc', {
    text: 'Table of Contents',
    context: 'insert',
    cmd: 'mceInsertToc',
    onPostRender: toggleState(editor)
  });

  editor.addContextToolbar(isToc(editor), 'tocupdate');
};

export default {
  register
};