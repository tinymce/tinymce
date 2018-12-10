declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'autosave code',
  toolbar: 'restoredraft code',
  height: 600,
  autosave_interval: '10s',
  menus: {
    File: [ 'restoredraft' ]
  }
});

export {};