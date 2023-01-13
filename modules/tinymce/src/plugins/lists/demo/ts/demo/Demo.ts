import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists code',
  toolbar: 'numlist bullist | outdent indent | code',
  height: 600,
  contextmenu: 'lists'
});

export {};
