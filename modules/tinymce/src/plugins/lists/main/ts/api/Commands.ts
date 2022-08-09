import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { flattenListSelection, indentListSelection, outdentListSelection } from '../actions/Indendation';
import * as ToggleList from '../actions/ToggleList';
import { updateList } from '../actions/Update';
import { getParentList } from '../core/Selection';
import * as Dialog from '../ui/Dialog';

const queryListCommandState = (editor: Editor, listName: string) => (): boolean => {
  const parentList = getParentList(editor);
  return Type.isNonNullable(parentList) && parentList.nodeName === listName;
};

const registerDialog = (editor: Editor): void => {
  editor.addCommand('mceListProps', () => {
    Dialog.open(editor);
  });
};

const register = (editor: Editor): void => {
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

  editor.addCommand('mceListUpdate', (ui, detail) => {
    if (Type.isObject(detail)) {
      updateList(editor, detail);
    }
  });

  editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState(editor, 'UL'));
  editor.addQueryStateHandler('InsertOrderedList', queryListCommandState(editor, 'OL'));
  editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState(editor, 'DL'));
};

export {
  registerDialog,
  register
};
