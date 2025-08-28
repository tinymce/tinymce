import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  tinymce.init({
    selector: '#editor',
    license_key: 'gpl',
    inline: true,
    fixed_toolbar_container: '#toolbar',
  });
};
