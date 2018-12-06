declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'hr code',
  toolbar: 'hr code',
  height: 600
});

export {};