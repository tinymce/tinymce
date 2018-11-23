/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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