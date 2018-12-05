declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'directionality code',
  toolbar: 'ltr rtl code',
  height: 600
});

export {};