/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import { onSetupFormatToggle } from './complex/utils/Utils';

const register = (editor: Editor) => {
  const alignToolbarButtons = [
    { name: 'alignleft', text: 'Align left', cmd: 'JustifyLeft', icon: 'align-left' },
    { name: 'aligncenter', text: 'Align center', cmd: 'JustifyCenter', icon: 'align-center' },
    { name: 'alignright', text: 'Align right', cmd: 'JustifyRight', icon: 'align-right' },
    { name: 'alignjustify', text: 'Justify', cmd: 'JustifyFull', icon: 'align-justify' }
  ];

  Tools.each(alignToolbarButtons, (item) => {
    editor.ui.registry.addToggleButton(item.name, {
      tooltip: item.text,
      onAction: () => editor.execCommand(item.cmd),
      icon: item.icon,
      onSetup: onSetupFormatToggle(editor, item.name)
    });
  });

  const alignNoneToolbarButton = { name: 'alignnone', text: 'No alignment', cmd: 'JustifyNone', icon: 'align-none' };
  editor.ui.registry.addButton(alignNoneToolbarButton.name, {
    tooltip: alignNoneToolbarButton.text,
    onAction: () => editor.execCommand(alignNoneToolbarButton.cmd),
    icon: alignNoneToolbarButton.icon
  });
};

export default { register };