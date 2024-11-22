import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  tinymce.init({
    selector: 'textarea',
    plugins: [ 'code' ],
    // Enable scripts in bundled_css_demo.html before uncommenting below lines
    // skin: 'oxide-dark',
    // content_css: 'dark'
  });
};
