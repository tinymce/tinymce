declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'fullpage code',
  toolbar: 'fullpage code',
  height: 600,
  menubar: 'view tools custom',
  menu: {
    custom: { title: 'Custom', items: 'fullpage' }
  }
});

export {};