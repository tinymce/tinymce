/* eslint-disable */
import Editor from 'tinymce/core/api/Editor';

declare let tinymce: any;

export default () => {
  tinymce.init({
    selector: 'textarea.tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        const runtimeModel = ed.model;
        console.log('demo model created', runtimeModel);
        console.log('demo model getNodes', runtimeModel.getNodes());
      })
    }
  });
};
