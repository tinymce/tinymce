declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'directionality code lists',
  toolbar: 'ltr rtl code | bullist numlist',
  height: 600
});

export {};
