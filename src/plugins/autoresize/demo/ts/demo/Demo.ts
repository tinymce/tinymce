declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  plugins: 'autoresize code',
  toolbar: 'autoresize code',
  height: 600
});

export {};