import { document, HTMLTextAreaElement } from '@ephox/dom-globals';

declare let tinymce: any;

const elm = document.querySelector('.tinymce') as HTMLTextAreaElement;
elm.value = '[b]bbcode plugin[/b]';

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'bbcode code',
  toolbar: 'bbcode code',
  height: 600
});

export {};
