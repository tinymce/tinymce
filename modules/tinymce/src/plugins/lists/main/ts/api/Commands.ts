/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { setParentListAttributes } from '../actions/Attributes';
import { flattenListSelection, indentListSelection, outdentListSelection } from '../actions/Indendation';
import * as ToggleList from '../actions/ToggleList';
import { getParentList } from '../core/Selection';
import * as Dialog from '../ui/Dialog';

const queryListCommandState = (editor, listName) => {
  return () => {
    const parentList = getParentList(editor);
    return parentList && parentList.nodeName === listName;
  };
};

const registerDialog = (editor) => {
  editor.addCommand('mceListProps', () => {
    Dialog.open(editor);
  });
};

const register = (editor) => {
  editor.on('BeforeExecCommand', (e) => {
    const cmd = e.command.toLowerCase();

    if (cmd === 'indent') {
      indentListSelection(editor);
    } else if (cmd === 'outdent') {
      outdentListSelection(editor);
    }
  });

  editor.addCommand('InsertUnorderedList', (ui, detail) => {
    ToggleList.toggleList(editor, 'UL', detail);
  });

  editor.addCommand('InsertOrderedList', (ui, detail) => {
    ToggleList.toggleList(editor, 'OL', detail);
  });

  editor.addCommand('InsertDefinitionList', (ui, detail) => {
    ToggleList.toggleList(editor, 'DL', detail);
  });

  editor.addCommand('RemoveList', () => {
    flattenListSelection(editor);
  });

  registerDialog(editor);

  editor.addCommand('SetListAttributes', (ui, detail) => {
    setParentListAttributes(editor, detail);
  });

  editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState(editor, 'UL'));
  editor.addQueryStateHandler('InsertOrderedList', queryListCommandState(editor, 'OL'));
  editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState(editor, 'DL'));
};

export {
  registerDialog,
  register
};
