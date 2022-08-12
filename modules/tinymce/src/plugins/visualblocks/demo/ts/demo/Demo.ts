import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'visualblocks code',
  toolbar: 'visualblocks code',
  content_css: '../../../../../js/tinymce/skins/content/default/content.css',
  visualblocks_default_state: true,
  // end_container_on_empty_block: true,
  // Style formats
  style_formats: [
    { title: 'h1', block: 'h1' },
    { title: 'h2', block: 'h2' },
    { title: 'h3', block: 'h3' },
    { title: 'h4', block: 'h4' },
    { title: 'h5', block: 'h5' },
    { title: 'h6', block: 'h6' },
    { title: 'p', block: 'p' },
    { title: 'div', block: 'div' },
    { title: 'pre', block: 'pre' },
    { title: 'section', block: 'section', wrapper: true, merge_siblings: false },
    { title: 'article', block: 'article', wrapper: true, merge_siblings: false },
    { title: 'blockquote', block: 'blockquote', wrapper: true },
    { title: 'hgroup', block: 'hgroup', wrapper: true },
    { title: 'aside', block: 'aside', wrapper: true },
    { title: 'figure', block: 'figure', wrapper: true }
  ],
  height: 600
});

export {};
