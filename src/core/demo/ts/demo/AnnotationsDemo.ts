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
import { prompt } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {
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
          ed.annotator.annotate('alpha', {
            comment
          });
          ed.focus();
        },

        onpostrender: (ctrl) => {
          const button = ctrl.control;
          ed.on('init', () => {
            ed.annotator.annotationChanged((uid, name) => {
              if (uid === null || name === null) {
                button.active(false);
              } else {
                button.active(name === 'alpha');
              }
            });
          });
        }
      });

      ed.on('init', () => {
        ed.annotator.register('alpha', {
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