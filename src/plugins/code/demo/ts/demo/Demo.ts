declare const tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code',
  height: 600
});

export {};
