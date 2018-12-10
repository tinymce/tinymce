declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css',
  height: 600
});

tinymce.init({
  selector: 'div.tinymce',
  inline: true,
  plugins: 'codesample code',
  toolbar: 'codesample code',
  codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css',
  height: 600
});

export {};
