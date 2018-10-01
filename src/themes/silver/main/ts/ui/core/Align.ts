/**
 * Align.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import { Editor } from '../../../../../../core/main/ts/api/Editor';

const toggleFormat = (editor: Editor, fmt: string) => {
  return () => {
    editor.execCommand('mceToggleFormat', false, fmt);
  };
};

const register = (editor) => {
  const defaultAlignIcon = 'align-left';
  const alignMenuItems = [
    { type: 'menuitem', text: 'Left', icon: 'align-left', onAction: toggleFormat(editor, 'alignleft') },
    { type: 'menuitem', text: 'Center', icon: 'align-center', onAction: toggleFormat(editor, 'aligncenter') },
    { type: 'menuitem', text: 'Right', icon: 'align-right', onAction: toggleFormat(editor, 'alignright') },
    { type: 'menuitem', text: 'Justify', icon: 'align-justify', onAction: toggleFormat(editor, 'alignjustify') }
  ];

  editor.ui.registry.addMenuItem('align', {
    text: 'Align',
    icon: defaultAlignIcon,
    hasSubmenu: true,
    getSubmenuItems: () => alignMenuItems
  });

  const alignToolbarButtons = [
    { name: 'alignleft', text: 'Align left', cmd: 'JustifyLeft', icon: 'align-left' },
    { name: 'aligncenter', text: 'Align center', cmd: 'JustifyCenter', icon: 'align-center' },
    { name: 'alignright', text: 'Align right', cmd: 'JustifyRight', icon: 'align-right' },
    { name: 'alignjustify', text: 'Justify', cmd: 'JustifyFull', icon: 'align-justify' }
  ];

  const onSetup = (item) => (api) => {
    if (editor.formatter) {
      editor.formatter.formatChanged(item.name, api.setActive);
    } else {
      editor.on('init', () => {
        editor.formatter.formatChanged(item.name, api.setActive);
      });
    }
  };

  Tools.each(alignToolbarButtons, (item) => {
    editor.ui.registry.addToggleButton(item.name, {
      tooltip: item.text,
      onAction: () => editor.execCommand(item.cmd),
      icon: item.icon,
      onSetup: onSetup(item)
    });
  });

  const alignNoneToolbarButton = { name: 'alignnone', text: 'No alignment', cmd: 'JustifyNone', icon: 'align-justify' };
  editor.ui.registry.addButton(alignNoneToolbarButton.name, {
    tooltip: alignNoneToolbarButton.text,
    onAction: () => editor.execCommand(alignNoneToolbarButton.cmd),
    icon: alignNoneToolbarButton.icon,
    onSetup: onSetup(alignNoneToolbarButton)
  });
};

export default { register };