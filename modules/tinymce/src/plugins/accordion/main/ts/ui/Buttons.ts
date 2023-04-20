import { Menu, Toolbar } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';

const isSummary = (node: Node): node is HTMLElement =>
  node.nodeName === 'SUMMARY';

const isInSummary = (editor: Editor): boolean => {
  const node = editor.selection.getNode();
  return isSummary(node) || Boolean(editor.dom.getParent(node, isSummary));
};

const onSetup = (editor: Editor) => (buttonApi: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi) => {
  const onNodeChange = () => buttonApi.setEnabled(!isInSummary(editor));
  editor.on('NodeChange', onNodeChange);
  return () => editor.off('NodeChange', onNodeChange);
};

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('InsertAccordion');
  editor.ui.registry.addButton('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });
  editor.ui.registry.addMenuItem('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });
};

export { register };
