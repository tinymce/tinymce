import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists advlist code',
  toolbar: 'bullist numlist | outdent indent | code',
  height: 600
});

export {};
