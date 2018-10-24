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

const toggleState = (editor) => (api) => {
  const toggleDisabledState = () => api.setDisabled(editor.readonly || !Toc.hasHeaders(editor));

  toggleDisabledState();
  editor.on('LoadContent SetContent change', toggleDisabledState);
  return () => editor.on('LoadContent SetContent change', toggleDisabledState);
};

const isToc = (editor) => {
  return (elm) => {
    return elm && editor.dom.is(elm, '.' + Settings.getTocClass(editor)) && editor.getBody().contains(elm);
  };
};

const register = (editor) => {
  editor.ui.registry.addButton('toc', {
    icon: 'toc',
    tooltip: 'Table of Contents',
    onAction: () => editor.execCommand('mceInsertToc'),
    onSetup: toggleState(editor)
  });

  editor.ui.registry.addButton('tocupdate', {
    icon: 'reload',
    tooltip: 'Update',
    onAction: () => editor.execCommand('mceUpdateToc')
  });

  editor.ui.registry.addMenuItem('toc', {
    icon: 'toc',
    text: 'Table of Contents',
    onAction: () => editor.execCommand('mceInsertToc'),
    onSetup: toggleState(editor)
  });

  editor.ui.registry.addContextToolbar('toc', {
    items: 'tocupdate',
    predicate: isToc(editor),
    scope: 'node',
    position: 'node'
  });
};

export default {
  register
};