import { Fun } from '@ephox/katamari';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code MoveBlockDown MoveBlockUp',
  height: 600,
  setup: (editor) => {
    editor.ui.registry.addButton('MoveBlockDown', {
      text: 'MoveBlockDown',
      onAction: () => {
        editor.execCommand('MoveBlockDown');
      }
    });
    editor.ui.registry.addContextToolbar('MoveBlockDown', {
      items: 'MoveBlockDown',
      predicate: Fun.always
    });
    editor.ui.registry.addButton('MoveBlockUp', {
      text: 'MoveBlockUp',
      onAction: () => {
        editor.execCommand('MoveBlockUp');
      }
    });
    editor.ui.registry.addContextToolbar('MoveBlockUp', {
      items: 'MoveBlockUp',
      predicate: Fun.always,
      position: 'node'
    });
  }
});

export {};
