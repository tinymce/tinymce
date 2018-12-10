declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'fullscreen code',
  toolbar: 'fullscreen code',
  height: 600
});

export {};