/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { onActionExecCommand, onSetupFormatToggle } from './ControlUtils';

const register = (editor: Editor) => {
  const alignToolbarButtons = [
    { name: 'alignleft', text: 'Align left', cmd: 'JustifyLeft', icon: 'align-left' },
    { name: 'aligncenter', text: 'Align center', cmd: 'JustifyCenter', icon: 'align-center' },
    { name: 'alignright', text: 'Align right', cmd: 'JustifyRight', icon: 'align-right' },
    { name: 'alignjustify', text: 'Justify', cmd: 'JustifyFull', icon: 'align-justify' }
  ];

  Arr.each(alignToolbarButtons, (item) => {
    editor.ui.registry.addToggleButton(item.name, {
      tooltip: item.text,
      icon: item.icon,
      onAction: onActionExecCommand(editor, item.cmd),
      onSetup: onSetupFormatToggle(editor, item.name)
    });
  });

  editor.ui.registry.addButton('alignnone', {
    tooltip: 'No alignment',
    icon: 'align-none',
    onAction: onActionExecCommand(editor, 'JustifyNone')
  });
};

export {
  register
};
