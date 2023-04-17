import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Utils from './Utils';

const setupEnterKeyInSummary = (editor: Editor): void => {
  editor.on('keydown', (event): void => {
    if (event.shiftKey || event.keyCode !== VK.ENTER || !Utils.isInSummary(editor)) {
      return;
    }
    event.preventDefault();
    editor.execCommand('ToggleAccordion');
  });
};

const setupEnterKeyInAccordionBody = (editor: Editor): void => {
  editor.on('keydown', (event): void => {
    if (event.shiftKey || event.keyCode !== VK.ENTER) {
      return;
    }

    const selectedNode = editor.selection.getNode();
    const node = editor.dom.isBlock(selectedNode)
      ? selectedNode
      : editor.dom.getParent(selectedNode, editor.dom.isBlock);
    if (node?.nodeName !== 'P') {
      return;
    }
    if (!editor.dom.isEmpty(node)) {
      return;
    }

    const body = editor.dom.getParent(node, Utils.isAccordionBody);
    if (!body) {
      return;
    }

    event.preventDefault();

    const details = editor.dom.getParent(node, Utils.isDetails);
    if (!details) {
      return;
    }

    const paragraph = editor.dom.create('p');
    paragraph.innerHTML = '<br data-mce-bogus="1" />';
    details.insertAdjacentElement('afterend', paragraph);
    editor.selection.setCursorLocation(paragraph, 0);
  });
};

const setup = (editor: Editor): void => {
  setupEnterKeyInSummary(editor);
  setupEnterKeyInAccordionBody(editor);
};

export { setup };
