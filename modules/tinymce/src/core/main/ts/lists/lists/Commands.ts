import { Type } from '@ephox/katamari';

import Editor from '../../api/Editor';
import { backspaceDelete } from '../actions/Delete';
import { flattenListSelection } from '../actions/Indentation';
import * as ToggleList from '../actions/ToggleList';
import { updateList } from '../actions/Update';

import * as Selection from './Selection';

const queryListCommandState = (editor: Editor, listName: string) => (): boolean => {
  const parentList = Selection.getParentList(editor);
  return Type.isNonNullable(parentList) && parentList.nodeName === listName;
};

const setup = (editor: Editor): void => {
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

  editor.addCommand('mceListUpdate', (ui, detail) => {
    if (Type.isObject(detail)) {
      updateList(editor, detail);
    }
  });
  editor.addCommand('mceListBackspaceDelete', (_ui, forward) => {
    backspaceDelete(editor, forward);
  });

  editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState(editor, 'UL'));
  editor.addQueryStateHandler('InsertOrderedList', queryListCommandState(editor, 'OL'));
  editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState(editor, 'DL'));
};

export {
  setup
};
