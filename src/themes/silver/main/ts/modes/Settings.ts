import { SelectorFind, Body } from '@ephox/sugar';

const fixedContainerSelector = (editor) => editor.getParam('fixed_toolbar_container');
const fixedContainerElement = (editor) => SelectorFind.descendant(Body.body(), fixedContainerSelector(editor));
const useFixedContainer = (editor) => editor.getParam('inline', false) && fixedContainerElement(editor).isSome();

export {
  fixedContainerElement,
  useFixedContainer
};