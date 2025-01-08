import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

void tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code',
  height: 600
});

export {};
