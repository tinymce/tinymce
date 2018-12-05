import { document } from '@ephox/dom-globals';

declare let tinymce: any;

let elm: any;
elm = document.querySelector('.tinymce');
elm.value = '[b]bbcode plugin[/b]';

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'bbcode code',
  toolbar: 'bbcode code',
  height: 600
});

export {};