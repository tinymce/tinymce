import {Editor, TinyMCE} from 'tinymce';

declare const tinymce: TinyMCE;

const setup = (editor: Editor, url: string): void => {
  editor.ui.registry.addMenuItem('image', {
    icon: 'image',
    text: 'Open in new tab',
    onAction: () => {
      let node = editor.selection.getNode(), url;

      if (node.hasAttribute('data-mce-src')) {
        url = node.getAttribute('data-mce-src');
      } else if (node.hasAttribute('data-mce-href')) {
        url = node.getAttribute('data-mce-href');
      }

      if (url) {
        window.open(url, '_blank');
      }
    }
  });

  editor.ui.registry.addContextMenu('image', {
    update: (element: HTMLImageElement) => !element.src ? '' : 'image'
  });
};

export default (): void => {
  tinymce.PluginManager.add('teamuplinknewtab', setup);
};
