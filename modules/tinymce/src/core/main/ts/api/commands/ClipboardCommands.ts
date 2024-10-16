/* eslint-disable no-console */
import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {

  const handleClipboardError = (command: string, failed: boolean, message: string, err: string) => {

    let msg = message;

    if (failed) {
      msg = editor.translate(
        `Your browser doesn't support direct access to the clipboard. ` +
        'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
      );
    }

    if (err) {
      msg += ' ' + err;
    }

    if (Env.os.isMacOS() || Env.os.isiOS()) {
      msg = msg.replace(/Ctrl\+/g, '\u2318+');
    }

    editor.notificationManager.open({ text: msg, type: 'error' });
  };

  const copyToClipboard = async (text: string, command: string, failed: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      handleClipboardError(command, failed, 'Failed to copy to clipboard', String(err));
    }
  };

  const pasteFromClipboard = async (command: string, failed: boolean) => {
    let text = '';

    try {
      text = await navigator.clipboard.readText();
      editor.selection.setContent(text);
    } catch (err) {
      handleClipboardError(command, failed, 'Failed to paste from clipboard', String(err));
    }
    return text;
  };

  const cutToClipboard = async (text: string, command: string, failed: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      editor.selection.setContent('');
    } catch (err) {
      handleClipboardError(command, failed, 'Failed to cut to clipboard', String(err));
    }
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      let failed = false;

      try {
        switch (command) {
          case 'copy':
            copyToClipboard(editor.selection.getContent(), command, failed);
            break;
          case 'paste':
            pasteFromClipboard(command, failed);
            break;
          case 'cut':
            cutToClipboard(editor.selection.getContent(), command, failed);
            break;
        }
      } catch (ex) {
        // Command failed
        failed = true;
      }

      // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
      // if (command === 'paste' && !doc.queryCommandEnabled(command)) {
      //   failed = true;
      // }
    }
  });
};
