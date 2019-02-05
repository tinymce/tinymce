/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const register = (editor: Editor) => {
  const alignToolbarButtons = [
    { name: 'alignleft', text: 'Align left', cmd: 'JustifyLeft', icon: 'align-left' },
    { name: 'aligncenter', text: 'Align center', cmd: 'JustifyCenter', icon: 'align-center' },
    { name: 'alignright', text: 'Align right', cmd: 'JustifyRight', icon: 'align-right' },
    { name: 'alignjustify', text: 'Justify', cmd: 'JustifyFull', icon: 'align-justify' }
  ];

  const onSetupToggleButton = (item) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const handler = (state: boolean) => {
      api.setActive(state);
    };

    if (editor.formatter) {
      api.setActive(editor.formatter.match(item.name));
      editor.formatter.formatChanged(item.name, handler);
    } else {
      editor.on('init', () => {
        api.setActive(editor.formatter.match(item.name));
        editor.formatter.formatChanged(item.name, handler);
      });
    }

    return () => { };
  };

  Tools.each(alignToolbarButtons, (item) => {
    editor.ui.registry.addToggleButton(item.name, {
      tooltip: item.text,
      onAction: () => editor.execCommand(item.cmd),
      icon: item.icon,
      onSetup: onSetupToggleButton(item)
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