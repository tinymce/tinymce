import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  plugins: 'autoresize code',
  toolbar: 'autoresize code',
  height: 600
});

export {};
