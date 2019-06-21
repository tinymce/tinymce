declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'speech code',
  toolbar: 'listen code'
});

export {};