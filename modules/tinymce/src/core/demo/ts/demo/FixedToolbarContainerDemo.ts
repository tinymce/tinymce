import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  tinymce.init({
    selector: '#editor',
    inline: true,
    fixed_toolbar_container: '#toolbar',
    plugins: 'template' // lets you check notification positioning
  });
};
