import { Editor, TinyMCE } from 'tinymce';

declare const tinymce: TinyMCE;

const setup = (editor: Editor, url: string): void => {
  editor.ui.registry.addButton('teamuplinknewtab', {
    text: 'teamuplinknewtab button',
    onAction: () => {
      editor.setContent('<p>content added from teamuplinknewtab</p>');
    }
  });
};

export default (): void => {
  tinymce.PluginManager.add('teamuplinknewtab', setup);
};
