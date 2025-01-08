import {Editor, TinyMCE} from 'tinymce';

declare const tinymce: TinyMCE;

const setup = (editor: Editor, url: string): void => {
  editor.ui.registry.addMenuItem('teamuplinknewtab', {
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
  editor.ui.registry.addContextMenu('teamuplinknewtab', {
    update: function(element) {
      return (element.hasAttribute('data-mce-src') || element.hasAttribute('data-mce-href')) ? 'teamuplinknewtab' : '';
    }
  });
};

export default (): void => {
  tinymce.PluginManager.add('teamuplinknewtab', setup);
};
