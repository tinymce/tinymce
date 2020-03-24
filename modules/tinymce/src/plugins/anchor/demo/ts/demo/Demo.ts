declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'anchor code',
  toolbar: 'anchor code',
  height: 600
});

export {};
