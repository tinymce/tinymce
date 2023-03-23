import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'accordion code',
  toolbar: 'accordion | code',
  menu: { tools: { title: 'Tools', items: 'accordion code' }},
});

export {};
