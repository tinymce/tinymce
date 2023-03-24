import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists image accordion code',
  toolbar: 'numlist bullist | image | accordion | code',
  menu: { tools: { title: 'Tools', items: 'accordion code' }},
});

export {};
