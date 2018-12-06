declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/oxide',
  plugins: 'pagebreak code',
  toolbar: 'pagebreak code',
  height: 600
});

export {};