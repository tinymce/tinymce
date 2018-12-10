declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'textpattern code',
  skin_url: '../../../../../js/tinymce/skins/oxide',
  toolbar: 'code',
  height: 600
});

export {};