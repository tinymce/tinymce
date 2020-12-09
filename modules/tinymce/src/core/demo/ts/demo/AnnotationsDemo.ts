import { Fun } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

declare let tinymce: any;

export default function () {

  const button = document.createElement('button');
  button.innerHTML = 'Get all annotations';
  button.addEventListener('click', () => {
    // eslint-disable-next-line no-console
    console.log('annotations', tinymce.activeEditor.annotator.getAll('alpha'));
  });
  document.body.appendChild(button);

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'textarea.tinymce',
    toolbar: 'annotate-alpha',
    plugins: [ ],

    content_style: '.mce-annotation { background-color: darkgreen; color: white; }',

    setup: (editor: Editor) => {
      editor.ui.registry.addButton('annotate-alpha', {
        text: 'Annotate',
        onAction() {
          const comment = window.prompt('Comment with?');
          editor.annotator.annotate('alpha', {
            comment
          });
          editor.focus();
        },
        onSetup(btnApi) {
          editor.annotator.annotationChanged('alpha', (state, _name, _obj) => {
            btnApi.setDisabled(state);
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
      });
    },

    menubar: false
  });
}
