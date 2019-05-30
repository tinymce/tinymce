declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'visualchars code',
  toolbar: 'visualchars code',
  visualchars_default_state: true,
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  height: 600
});

export {};