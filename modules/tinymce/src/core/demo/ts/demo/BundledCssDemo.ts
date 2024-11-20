import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  tinymce.init({
    selector: 'textarea',
    plugins: [ 'code' ],
    // skin: 'oxide-dark',
    // content_css: 'dark'
  });
};
