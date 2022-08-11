import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  plugins: 'save code',
  toolbar: 'save code',
  height: 600
  // save_onsavecallback: () => { console.log('saved'); }
});

export {};
