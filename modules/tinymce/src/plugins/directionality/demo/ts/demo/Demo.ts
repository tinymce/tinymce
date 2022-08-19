import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'directionality code lists',
  toolbar: 'ltr rtl code | bullist numlist',
  height: 600
});

export {};
