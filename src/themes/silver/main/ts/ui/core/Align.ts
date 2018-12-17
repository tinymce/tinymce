/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu, Toolbar } from '@ephox/bridge';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const toggleFormat = (editor: Editor, fmt: string) => {
  return () => {
    editor.execCommand('mceToggleFormat', false, fmt);
  };
};

const register = (editor: Editor) => {
  const defaultAlignIcon = 'align-left';
  const alignMenuItems = [
    { type: 'menuitem', text: 'Left', icon: 'align-left', onAction: toggleFormat(editor, 'alignleft') },
    { type: 'menuitem', text: 'Center', icon: 'align-center', onAction: toggleFormat(editor, 'aligncenter') },
    { type: 'menuitem', text: 'Right', icon: 'align-right', onAction: toggleFormat(editor, 'alignright') },
    { type: 'menuitem', text: 'Justify', icon: 'align-justify', onAction: toggleFormat(editor, 'alignjustify') }
  ] as Menu.MenuItemApi[];

  editor.ui.registry.addNestedMenuItem('align', {
    text: 'Align',
    icon: defaultAlignIcon,
    getSubmenuItems: () => alignMenuItems
  });

  const alignToolbarButtons = [
    { name: 'alignleft', text: 'Align left', cmd: 'JustifyLeft', icon: 'align-left' },
    { name: 'aligncenter', text: 'Align center', cmd: 'JustifyCenter', icon: 'align-center' },
    { name: 'alignright', text: 'Align right', cmd: 'JustifyRight', icon: 'align-right' },
    { name: 'alignjustify', text: 'Justify', cmd: 'JustifyFull', icon: 'align-justify' }
  ];

  const onSetup = (item) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    if (editor.formatter) {
      editor.formatter.formatChanged(item.name, api.setActive);
    } else {
      editor.on('init', () => {
        editor.formatter.formatChanged(item.name, api.setActive);
      });
    }

    return () => {};
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