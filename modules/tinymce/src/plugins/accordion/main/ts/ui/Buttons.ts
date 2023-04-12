import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from '@ephox/bridge';

const isSummary = (node: Node): node is HTMLElement =>
  node.nodeName === 'SUMMARY';

const isInSummary = (editor: Editor): boolean => {
  const node = editor.selection.getNode();
  return isSummary(node) || Boolean(editor.dom.getParent(node, isSummary));
};

const onSetup = (editor: Editor) => (buttonApi: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi) => {
  const f = () => buttonApi.setEnabled(!isInSummary(editor));
  editor.on('NodeChange', f);
  return () => editor.off('NodeChange', f);
};

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('InsertAccordion');
  editor.ui.registry.addButton('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });
  editor.ui.registry.addMenuItem('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });
};

export { register };
