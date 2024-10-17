import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea',
  plugins: 'happylist code help lists emoticons charmap',
  toolbar: 'happylist | code | help emoticons charmap | numlist bullist',
});

export {};
