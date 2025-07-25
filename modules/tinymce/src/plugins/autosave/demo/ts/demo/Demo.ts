import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'autosave code',
  toolbar: 'restoredraft code',
  height: 600,
  autosave_interval: '10s',
  menus: {
    File: [ 'restoredraft' ]
  }
});

export {};
