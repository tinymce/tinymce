import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'table lists image accordion code',
  toolbar: 'table | numlist bullist | image | accordion | code',
  menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
  details_initial_state: 'inherited',
  details_serialize_state: 'inherited',
});

export {};
