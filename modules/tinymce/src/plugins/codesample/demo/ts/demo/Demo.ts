import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

void tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  content_css: '../../../../../js/tinymce/skins/content/default/content.css',
  height: 600
});

void tinymce.init({
  selector: 'div.tinymce',
  inline: true,
  plugins: 'codesample code',
  toolbar: 'codesample code',
  content_css: '../../../../../js/tinymce/skins/content/default/content.css',
  height: 600
});

export {};
