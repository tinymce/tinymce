/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Singleton } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';
import { FormatterFormatItem } from '../BespokeSelect';

const onSetupFormatToggle = (editor: Editor, name: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
  const boundCallback = Singleton.unbindable();

  const init = () => {
    api.setActive(editor.formatter.match(name));
    const binding = editor.formatter.formatChanged(name, api.setActive);
    boundCallback.set(binding);
  };

  // The editor may or may not have been setup yet, so check for that
  editor.initialized ? init() : editor.on('init', init);

  return boundCallback.clear;
};

const onActionToggleFormat = (editor: Editor) => (rawItem: FormatterFormatItem) => () => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.execCommand('mceToggleFormat', false, rawItem.format);
  });
};

export {
  onSetupFormatToggle,
  onActionToggleFormat
};
