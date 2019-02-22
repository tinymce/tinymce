/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Cell, Option } from '@ephox/katamari';
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
    const unbindCell = Cell<Option<Function>>(Option.none());

    const init = () => {
      api.setActive(editor.formatter.match(item.name));
      const unbind = editor.formatter.formatChangedWithUnbind(item.name, (state: boolean) => api.setActive(state)).unbind;
      unbindCell.set(Option.some(unbind));
    };

    // The editor may or may not have been setup yet, so check for that
    editor.formatter ? init() : editor.on('init', init);

    return () => unbindCell.get().each((unbind) => unbind());
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