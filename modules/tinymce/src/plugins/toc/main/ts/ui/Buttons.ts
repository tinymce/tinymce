/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Settings from '../api/Settings';
import * as Toc from '../core/Toc';
import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from '@ephox/bridge';

const toggleState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi) => {
  const toggleDisabledState = () => api.setDisabled(editor.mode.isReadOnly() || !Toc.hasHeaders(editor));

  toggleDisabledState();
  editor.on('LoadContent SetContent change', toggleDisabledState);
  return () => editor.on('LoadContent SetContent change', toggleDisabledState);
};

const isToc = (editor: Editor) => (elm) => elm && editor.dom.is(elm, '.' + Settings.getTocClass(editor)) && editor.getBody().contains(elm);

const register = (editor: Editor) => {
  editor.ui.registry.addButton('toc', {
    icon: 'toc',
    tooltip: 'Table of contents',
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
    text: 'Table of contents',
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

export {
  register
};
