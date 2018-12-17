declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'toc code',
  toolbar: 'toc code formatselect',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  height: 600
});

export {};