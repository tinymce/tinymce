import type { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'lists advlist code',
  toolbar: 'bullist numlist | outdent indent | code alert confirm',
  height: 600,
  setup: (editor) => {
    const alert = () => editor.windowManager.alert('This is the body of the alert dialog');
    const confirm = () => editor.windowManager.confirm('This is the body of the confirm dialog');

    editor.ui.registry.addButton('alert', {
      text: 'Alert',
      onAction: alert
    });
    editor.ui.registry.addButton('confirm', {
      text: 'Confirm',
      onAction: confirm
    });
  }
});