import { TinyMCE } from 'tinymce';

import Plugin from '../../main/ts/Plugin';

declare let tinymce: TinyMCE;

Plugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code link teamuplinknewtab',
  contextmenu: 'image teamuplinknewtab',
});
