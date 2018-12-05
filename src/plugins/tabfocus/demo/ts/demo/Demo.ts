declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'tabfocus code',
  toolbar: 'code',
  skin_url: '../../../../../js/tinymce/skins/oxide',
  height: 600
});

export {};