declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'visualchars code',
  toolbar: 'visualchars code',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  height: 600
});

export {};