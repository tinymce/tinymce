declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  plugins: 'nonbreaking code',
  toolbar: 'nonbreaking code',
  height: 600
});

export {};