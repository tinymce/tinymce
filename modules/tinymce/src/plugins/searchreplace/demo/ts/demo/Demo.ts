import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'searchreplace',
  toolbar: 'searchreplace',
  height: 600,
  menubar: 'custom',
  menu: {
    custom: { title: 'Custom', items: 'searchreplace' }
  }
});

export {};
