/* tslint:disable:no-console */
import { console, setTimeout } from '@ephox/dom-globals';

declare let tinymce: any;

export default () => {
  const openDialog = (editor) => {
    // The end user will use this as config
    const api = editor.windowManager.openUrl({
      title: 'Example',
      url: './examples/iframe.html',
      onMessage: (api, message) => {
        console.log('Custom message received from iframe', message);
      },
      onClose: () => {
        console.log('Closing dialog');
      }
    });

    // Send a dummy message to the iframe after 2 seconds
    setTimeout(() => {
      api.sendMessage({
        message: 'Some example message'
      });
    }, 2000);
  };

  tinymce.init({
    selector: 'textarea.tiny-text',
    init_instance_callback: (editor) => {
      // Add in a button to open the dialog
      editor.$('<button>openDialog()</button>').appendTo('body').on('click', () => openDialog(editor));

      // Open the dialog initially
      openDialog(editor);
    }
  });
};
