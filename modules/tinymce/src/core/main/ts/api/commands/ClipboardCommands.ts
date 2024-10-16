/* eslint-disable no-console */
import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('copyToClipboard', text);
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

  const fallbackClipboardCommand = (editor: Editor, command: string) => {
    const doc = editor.getDoc();
    let failed = false;

    try {
      doc.execCommand(command);
    } catch (ex) {
      failed = true;
    }

    // Chrome reports the paste command as supported, however older IE:s will return false for cut/paste
    if (command === 'paste' && !doc.queryCommandEnabled(command)) {
      failed = true;
    }

    if (failed || !doc.queryCommandSupported(command)) {
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
      const clipboard = navigator.clipboard;
      console.log('command', navigator.clipboard);

      if (clipboard) {
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
        fallbackClipboardCommand(editor, command);
      }
    }
  });
};
