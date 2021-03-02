/* eslint-disable */
import Editor from 'tinymce/core/api/Editor';
import ModelManager from 'tinymce/core/api/ModelManager';
import Model from 'tinymce/models/dom/Model';

declare let tinymce: any;

export default () => {
  Model();
  const DomModel = ModelManager.get('dom');

  tinymce.init({
    selector: 'textarea.tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        const runtimeModel = new DomModel(ed, ModelManager.urls.dom);
        console.log('demo model created', runtimeModel);
        console.log('demo model getNodes', runtimeModel.getNodes());
      })
    }
  });
};
