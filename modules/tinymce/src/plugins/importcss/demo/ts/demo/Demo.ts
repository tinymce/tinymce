declare let tinymce: any;

const elm: any = document.querySelector('.tinymce');
elm.value = 'The format menu should show "red"';

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'importcss code',
  toolbar: 'styles code',
  height: 600,
  content_css: '../css/rules.css'
});

export {};
