declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'wordcount code',
  toolbar: 'wordcount',
  height: 600
});

export {};