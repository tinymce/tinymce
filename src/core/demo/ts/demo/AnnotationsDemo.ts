/**
 * CommandsDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Editor } from 'tinymce/core/api/Editor';
import { prompt, document } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {

  const button = document.createElement('button');
  button.innerHTML = 'Get all annotations';
  button.addEventListener('click', () => {
    // tslint:disable no-console
    console.log('annotations', tinymce.activeEditor.experimental.annotator.getAll('alpha'));
    // tslint:enable no-console
  });
  document.body.appendChild(button);

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/lightgray',
    selector: 'textarea.tinymce',
    toolbar: 'annotate-alpha',
    plugins: [ ],

    content_style: '.mce-annotation { background-color: darkgreen; color: white; }',

    setup: (ed: Editor) => {
      ed.addButton('annotate-alpha', {
        text: 'Annotate',
        onclick: () => {
          const comment = prompt('Comment with?');
          ed.experimental.annotator.annotate('alpha', {
            comment
          });
          ed.focus();
        },

        onpostrender: (ctrl) => {
          const button = ctrl.control;
          ed.on('init', () => {
            ed.experimental.annotator.annotationChanged('alpha', (state, name, obj) => {
              if (! state) {
                button.active(false);
              } else {
                button.active(true);
              }
            });
          });
        }
      });

      ed.on('init', () => {
        ed.experimental.annotator.register('alpha', {
          persistent: true,
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-mce-comment': data.comment
              }
            };
          }
        });

      });
    },

    theme: 'modern',
    menubar: false
  });
}