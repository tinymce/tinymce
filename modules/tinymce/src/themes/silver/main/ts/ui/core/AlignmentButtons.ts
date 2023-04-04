import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { onActionExecCommand, onSetupEditableToggle, onSetupStateToggle } from './ControlUtils';

const register = (editor: Editor): void => {
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
      onSetup: onSetupStateToggle(editor, item.name)
    });
  });

  editor.ui.registry.addButton('alignnone', {
    tooltip: 'No alignment',
    icon: 'align-none',
    onSetup: onSetupEditableToggle(editor),
    onAction: onActionExecCommand(editor, 'JustifyNone')
  });
};

export {
  register
};
