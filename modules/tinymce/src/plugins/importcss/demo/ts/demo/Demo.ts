import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

const elm = document.querySelector('.tinymce') as HTMLTextAreaElement;
elm.value = 'The format menu should show "red"';

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'importcss code',
  toolbar: 'styles code',
  height: 600,
  content_css: '../css/rules.css'
});

export {};
