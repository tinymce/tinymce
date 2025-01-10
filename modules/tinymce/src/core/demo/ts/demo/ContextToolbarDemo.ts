
import { Merger } from '@ephox/katamari';

import { RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const settings: RawEditorOptions = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'textarea',
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'importcss', 'codesample'
    ],
    toolbar: 'bold italic',
    setup: (ed) => {
      ed.ui.registry.addContextToolbar('foo', {
        predicate: (node) => node.nodeName.toUpperCase() === 'P',
        items: [
          {
            // label: 'Formatting',
            name: 'Formatting',
            items: [ 'bold', 'italic' ]
          },
          {
            label: 'History',
            items: [ 'undo', 'redo' ]
          },
          {
            items: [ 'undo', 'italic' ]
          }
        ],
        position: 'line',
        scope: 'editor'
      });

      ed.ui.registry.addContextToolbar('bar', {
        predicate: (node) => node.nodeName.toUpperCase() === 'DIV',
        items: 'bold italic | undo redo',
        position: 'line',
        scope: 'editor'
      });
    }
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
};
