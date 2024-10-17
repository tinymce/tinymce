import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { Reverser } from './Types';

const setup = (editor: Editor): Reverser => {
  const hasReversedAttr = (node: HTMLOListElement): boolean =>
    editor.dom.getAttrib(node, 'reversed') === 'true';

  const getSelectedOrderedList = (): Optional<HTMLOListElement> =>
    Optional.from(editor.dom.getParent(editor.selection.getNode(), 'ol'));

  const isInReversedOrderedList = () =>
    getSelectedOrderedList().filter(hasReversedAttr).isSome();

  const toggleReversedOrderedList = () => getSelectedOrderedList().each((orderedList) => {
    editor.dom.setAttrib(orderedList, 'reversed', hasReversedAttr(orderedList) ? null : 'true');
  });

  return {
    isInReversedOrderedList,
    toggleReversedOrderedList
  };
};

export {
  setup
};
