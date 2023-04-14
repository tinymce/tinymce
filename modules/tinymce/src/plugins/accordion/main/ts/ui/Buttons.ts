import { Menu, Toolbar } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../core/Utils';

const onSetup = (editor: Editor) => (buttonApi: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi) => {
  const onNodeChange = () => buttonApi.setEnabled(!Utils.isInSummary(editor));
  editor.on('NodeChange', onNodeChange);
  return () => editor.off('NodeChange', onNodeChange);
};

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('InsertAccordion');
  editor.ui.registry.addButton('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });
  editor.ui.registry.addMenuItem('accordion', { icon: 'accordion', text: 'Accordion', onSetup: onSetup(editor), onAction });

  editor.ui.registry.addToggleButton('accordiontoggle', {
    text: 'Toggle accordion',
    tooltip: 'Toggle accordion',
    onAction: () => editor.execCommand('ToggleAccordion')
  });

  editor.ui.registry.addToggleButton('accordionremove', {
    text: 'Remove accordion',
    tooltip: 'Remove accordion',
    onAction: () => editor.execCommand('RemoveAccordion')
  });

  editor.ui.registry.addContextToolbar('accordion', {
    predicate: (accordion: Node) =>
      editor.dom.is(accordion, 'details') && editor.getBody().contains(accordion) && editor.dom.isEditable(accordion.parentNode),
    items: 'accordiontoggle accordionremove',
    scope: 'node',
    position: 'node'
  });
};

export { register };
