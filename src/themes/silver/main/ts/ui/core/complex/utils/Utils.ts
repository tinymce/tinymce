/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Cell, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { FormatItem } from '../BespokeSelect';

type Unbinder = () => void;

const onSetupFormatToggle = (editor: Editor, name: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
  const unbindCell = Cell<Option<Unbinder>>(Option.none());

  const init = () => {
    api.setActive(editor.formatter.match(name));
    const unbind = editor.formatter.formatChanged(name, api.setActive).unbind;
    unbindCell.set(Option.some(unbind));
  };

  // The editor may or may not have been setup yet, so check for that
  editor.initialized ? init() : editor.on('init', init);

  return () => unbindCell.get().each((unbind) => unbind());
};

const onActionToggleFormat = (editor: Editor) => (rawItem: FormatItem) => () => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.execCommand('mceToggleFormat', false, rawItem.format);
  });
};

export {
  onSetupFormatToggle,
  onActionToggleFormat
};