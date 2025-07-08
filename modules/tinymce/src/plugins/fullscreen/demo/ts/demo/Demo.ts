import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'fullscreen code',
  toolbar: 'fullscreen code',
  height: 600,
  fullscreen_native: true
});

tinymce.init({
  selector: 'textarea.tinymce2',
  license_key: 'gpl',
  plugins: 'fullscreen code',
  toolbar: 'fullscreen code',
  height: 600
});

export {};
