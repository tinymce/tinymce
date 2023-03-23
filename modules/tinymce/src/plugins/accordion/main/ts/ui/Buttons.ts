import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('InsertAccordion');
  editor.ui.registry.addButton('accordion', { icon: 'accordion', text: 'Accordion', onAction });
  editor.ui.registry.addMenuItem('accordion', { icon: 'accordion', text: 'Accordion', onAction });
};

export { register };
