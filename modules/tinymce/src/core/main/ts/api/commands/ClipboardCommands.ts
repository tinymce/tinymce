/* eslint-disable no-console */
import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': async (command) => {
      let failed = false;

      const fallbackExecCommand = (cmd: string) => {
        try {
          return editor.getDoc().execCommand(cmd);
        } catch (ex) {
          return false;
        }
      };

      const showErrorNotification = (msg: string) => {
        if (Env.os.isMacOS() || Env.os.isiOS()) {
          msg = msg.replace(/Ctrl\+/g, '\u2318+');
        }
        editor.notificationManager.open({ text: msg, type: 'error' });
      };

      try {
        if (navigator.clipboard) {
          if (command === 'Cut' || command === 'Copy') {
            const selectedText = editor.selection.getContent({ format: 'text' });
            await navigator.clipboard.writeText(selectedText);
            if (command === 'Cut') {
              editor.selection.setContent('');
            }
          } else if (command === 'Paste') {
            const text = await navigator.clipboard.readText();
            editor.selection.setContent(text);
          }
        } else {
          // Fallback for browsers without Clipboard API support
          if (!fallbackExecCommand(command.toLowerCase())) {
            failed = true;
          }
        }
      } catch (ex) {
        failed = true;
        console.error('Clipboard operation failed:', ex);
      }

      if (failed) {
        const msg = editor.translate(
          `Clipboard access failed. ` +
          'Please ensure you have granted clipboard permissions to this site, ' +
          'or use the Ctrl+X/C/V keyboard shortcuts instead.'
        );
        showErrorNotification(msg);
      }
    }
  });
};
