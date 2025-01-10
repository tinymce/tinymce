import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'insertdatetime code',
  toolbar: 'insertdatetime code',
  height: 600,
  menubar: 'insertdatetime',
  menu: {
    insertdatetime: { title: 'Insert Date/Time', items: 'insertdatetime' }
  }
});

export {};
