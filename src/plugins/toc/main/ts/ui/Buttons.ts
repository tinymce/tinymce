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
  editor.ui.registry.addButton('toc', {
    tooltip: 'Table of Contents',
    onAction: () => editor.execCommand('mceInsertToc'),
    icon: 'toc',
    onPostRender: toggleState(editor)
  });

  editor.ui.registry.addButton('tocupdate', {
    tooltip: 'Update',
    onAction: () => editor.execCommand('mceUpdateToc'),
    icon: 'reload'
  });

  editor.ui.registry.addMenuItem('toc', {
    text: 'Table of Contents',
    onAction: () => editor.execCommand('mceInsertToc'),
    icon: 'toc',
    onPostRender: toggleState(editor)
  });

  editor.ui.registry.addContextToolbar('toc', {
    type: 'contexttoolbar',
    items: [ 'tocupdate' ],
    predicate: isToc(editor),
    position: 'node'
  });
};

export default {
  register
};