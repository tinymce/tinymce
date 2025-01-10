import { Fun } from '@ephox/katamari';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

const contentStyles = `
.mce-annotation { background-color: lightgreen; }
[data-mce-annotation-active] { outline: 2px solid red }
[data-mce-annotation="beta"][data-mce-annotation-active] { background-color: yellow; }
`;

export default (): void => {
  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'div.tinymce',
    toolbar: 'annotate-alpha get-all-alpha remove-all-alpha remove-alpha',
    plugins: [ ],

    inline_boundaries: false,
    height: 400,
    content_style: contentStyles,

    setup: (editor) => {
      editor.ui.registry.addButton('annotate-alpha', {
        text: 'Annotate',
        onAction: () => {
          const comment = window.prompt('Comment with?');
          editor.annotator.annotate('alpha', {
            comment
          });
          editor.focus();
        },
        onSetup: (btnApi) => {
          editor.annotator.annotationChanged('alpha', (state, _name, _obj) => {
            btnApi.setEnabled(!state);
          });
          return Fun.noop;
        }
      });

      editor.ui.registry.addButton('get-all-alpha', {
        text: 'Get all',
        onAction: () => {
          // eslint-disable-next-line no-console
          console.log('annotations', editor.annotator.getAll('alpha'));
        }
      });

      editor.ui.registry.addButton('remove-all-alpha', {
        text: 'Remove all',
        onAction: () => {
          editor.annotator.removeAll('alpha');
          editor.focus();
        }
      });

      editor.ui.registry.addButton('remove-alpha', {
        text: 'Remove closest',
        onAction: () => {
          editor.annotator.remove('alpha');
          editor.focus();
        },
        enabled: false,
        onSetup: (btnApi) => {
          editor.annotator.annotationChanged('alpha', (state, _name, _obj) => {
            btnApi.setEnabled(state);
          });
          return Fun.noop;
        }
      });

      editor.on('init', () => {
        editor.annotator.register('alpha', {
          persistent: true,
          decorate: (_uid, data) => ({
            attributes: {
              'data-mce-comment': data.comment ? data.comment : '',
              'data-mce-author': data.author ? data.author : 'anonymous'
            }
          })
        });

        editor.annotator.register('beta', {
          persistent: true,
          decorate: (_uid, _data) => ({
            attributes: {}
          })
        });
      });
    },

    menubar: false
  });
};
