declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'legacyoutput code',
  toolbar: 'legacyoutput fontselect fontsizeselect code bold italic underline strikethrough',
  height: 600
});

export {};
