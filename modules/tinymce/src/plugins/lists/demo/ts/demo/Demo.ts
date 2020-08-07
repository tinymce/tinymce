declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists code',
  toolbar: 'numlist bullist | code',
  height: 600,
  contextmenu: 'lists'
});

export {};
