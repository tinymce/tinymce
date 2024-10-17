import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      handleClipboardError();
    }
  };

  const pasteFromClipboard = async () => {
    let text = '';

    try {
      text = await navigator.clipboard.readText();
      console.log('pasteFromClipboard', text);
      editor.selection.setContent(text);
    } catch (err) {
      handleClipboardError();
    }
    return text;
  };

  const cutToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('cutToClipboard', text);
      editor.selection.setContent('');
    } catch (err) {
      handleClipboardError();
    }
  };

  const handleClipboardError = () => {

    let msg = editor.translate(
      `Your browser doesn't support direct access to the clipboard. ` +
        'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
    );

    if (Env.os.isMacOS() || Env.os.isiOS()) {
      msg = msg.replace(/Ctrl\+/g, '\u2318+');
    }

    editor.notificationManager.open({ text: msg, type: 'error' });
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      if (isSecureContext && navigator.clipboard) {
        switch (command) {
          case 'copy':
            copyToClipboard(editor.selection.getContent());
            break;
          case 'paste':
            pasteFromClipboard();
            break;
          case 'cut':
            cutToClipboard(editor.selection.getContent());
            break;
        }
      } else {
        handleClipboardError();
      }
    }
  });
};
