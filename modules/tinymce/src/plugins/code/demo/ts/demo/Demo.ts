
import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'test-update-text fontsize align alignleft code',
  height: 600,
  setup: (editor) => {
    editor.ui.registry.addToggleButton('test-update-text', {
      text: 'Before',
      onAction: (api) => {
        api.setText('After');
      },
    });
  }
});

export {};
