import Editor from 'tinymce/core/api/Editor';

declare let tinymce: any;

tinymce.init({
  selector: 'div.tinymce',
  setup: (ed: Editor) => {
    ed.on('init', () => {
      const runtimeModel = ed.model;
      // eslint-disable-next-line no-console
      console.log('demo model created', runtimeModel);
    });
  }
});
