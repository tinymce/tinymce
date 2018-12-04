import { prompt, document } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {

  const button = document.createElement('button');
  button.innerHTML = 'Get all annotations';
  button.addEventListener('click', () => {
    // tslint:disable no-console
    console.log('annotations', tinymce.activeEditor.annotator.getAll('alpha'));
    // tslint:enable no-console
  });
  document.body.appendChild(button);

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/oxide',
    selector: 'textarea.tinymce',
    toolbar: 'annotate-alpha',
    plugins: [ ],

    content_style: '.mce-annotation { background-color: darkgreen; color: white; }',

    setup: (editor) => {
      editor.ui.registry.addButton('annotate-alpha', {
        text: 'Annotate',
        onAction() {
          const comment = prompt('Comment with?');
          editor.annotator.annotate('alpha', {
            comment
          });
          editor.focus();
        },
        onSetup (btnApi) {
          editor.annotator.annotationChanged('alpha', (state, name, obj) => {
            btnApi.setDisabled(state);
          });
        }
      });

      editor.on('init', () => {
        editor.annotator.register('alpha', {
          persistent: true,
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-mce-comment': data.comment ? data.comment : '',
                'data-mce-author': data.author ? data.author : 'anonymous'
              }
            };
          }
        });
      });
    },

    menubar: false
  });
}