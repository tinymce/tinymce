import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

void tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'wordcount code',
  toolbar: 'wordcount',
  height: 600
});

export {};
