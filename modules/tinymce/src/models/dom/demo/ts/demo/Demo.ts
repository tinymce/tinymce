import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'div.tinymce',
  setup: (ed) => {
    ed.on('init', () => {
      const runtimeModel = ed.model;
      // eslint-disable-next-line no-console
      console.log('demo model created', runtimeModel);
    });
  }
});
