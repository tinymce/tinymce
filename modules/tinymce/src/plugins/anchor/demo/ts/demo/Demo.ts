import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'anchor code',
  toolbar: 'anchor code',
  height: 600
});

export {};
