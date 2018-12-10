declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'insertdatetime code',
  toolbar: 'insertdatetime code',
  height: 600,
  menubar: 'insertdatetime',
  menu: {
    insertdatetime: {title: 'Insert Date/Time', items: 'insertdatetime'}
  },
});

export {};