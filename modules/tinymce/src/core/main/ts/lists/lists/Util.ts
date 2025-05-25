import Editor from '../../api/Editor';

import * as Selection from './Selection';

const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

// Advlist/core/ListUtils.ts - Duplicated in Advlist plugin
const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && !editor.dom.isEditable(element);

const selectionIsWithinNonEditableList = (editor: Editor): boolean => {
  const parentList = Selection.getParentList(editor);
  return isWithinNonEditable(editor, parentList) || !editor.selection.isEditable();
};

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList) || !editor.selection.isEditable();
};

export {
  isCustomList,
  isWithinNonEditableList,
  selectionIsWithinNonEditableList
};
