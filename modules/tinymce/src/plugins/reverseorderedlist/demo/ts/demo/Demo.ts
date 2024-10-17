import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea',
  plugins: 'reverseorderedlist code help lists',
  toolbar: 'reverseorderedlist | code | help | numlist bullist'
});

export {};
