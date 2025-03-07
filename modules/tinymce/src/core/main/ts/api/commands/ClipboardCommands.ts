/* eslint-disable no-console */
import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {

  const showClipboardError = () => {
    let msg = editor.translate(
      `Clipboard access is only available in secure contexts (HTTPS) or with appropriate permissions. ` +
      'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
    );

    if (Env.os.isMacOS() || Env.os.isiOS()) {
      msg = msg.replace(/Ctrl\+/g, '\u2318+');
    }

    editor.notificationManager.open({ text: msg, type: 'error' });
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;

      // Check if Clipboard API is available
      if (isSecureContext && navigator.clipboard) {
        if (command === 'copy' || command === 'cut') {
          // Get selected content
          const selection = editor.selection.getContent({ format: 'html' });
          const plainText = editor.selection.getContent({ format: 'text' });

          // Create a clipboard data object with both formats
          const clipboardData = new window.ClipboardItem({
            'text/html': new Blob([ selection ], { type: 'text/html' }),
            'text/plain': new Blob([ plainText ], { type: 'text/plain' })
          });

          // Write to clipboard
          navigator.clipboard.write([ clipboardData ])
            .then(() => {
              // If cut, remove the selected content
              if (command === 'cut') {
                editor.selection.setContent('');
              }
            })
            .catch((error) => {
              console.error('Clipboard operation failed:', error);
              showClipboardError();
            });

          return;
        } else if (command === 'paste') {
          // Read from clipboard
          navigator.clipboard.read()
            .then((clipboardItems) => {
              for (const item of clipboardItems) {
                // Try to get HTML content first
                if (item.types.includes('text/html')) {
                  item.getType('text/html')
                    .then((htmlBlob) => htmlBlob.text())
                    .then((html) => {
                      editor.insertContent(html);
                    })
                    .catch((error) => {
                      console.error('HTML paste failed:', error);
                      showClipboardError();
                    });
                  return;
                }
                // Fall back to plain text
                else if (item.types.includes('text/plain')) {
                  item.getType('text/plain')
                    .then((textBlob) => textBlob.text())
                    .then((text) => {
                      editor.insertContent(text);
                    })
                    .catch((error) => {
                      console.error('Text paste failed:', error);
                      showClipboardError();
                    });
                  return;
                }
              }
            })
            .catch((error) => {
              console.error('Clipboard operation failed:', error);
              showClipboardError();
            });

          return;
        }
      } else {
        showClipboardError();
      }
    }
  });
};
