declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'autolink code',
  toolbar: 'autolink code',
  height: 600
});

export {};