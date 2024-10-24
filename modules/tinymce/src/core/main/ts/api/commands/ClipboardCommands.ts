import { PlatformDetection } from '@ephox/sand';

import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  const browser = PlatformDetection.detect().browser;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const pasteFromClipboard = async (): Promise<void> => {
    let text = '';
    text = await navigator.clipboard.readText();
    editor.selection.setContent(text);
  };

  const cutToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    editor.selection.setContent('');
  };

  const handleSecureContentError = () => {

    let msg = editor.translate(
      'Error: This operation requires a secure context (HTTPS)' +
        'Direct access to the clipboard is not allowed in insecure contexts.'
    );

    if (Env.os.isMacOS() || Env.os.isiOS()) {
      msg = msg.replace(/Ctrl\+/g, '\u2318+');
    }

    editor.notificationManager.open({ text: msg, type: 'error' });

    return false;
  };

  const checkPermission = async () => {
    const permission = browser.isChromium() ? await navigator.permissions.query({ name: 'clipboard-read' as PermissionName }) : { state: 'granted' };
    if (permission.state === 'granted') {
      return true;
    } else if (permission.state === 'denied') {
      handlePermissionError();
      return false;
    } else {
      // state is 'prompt'
      try {
        await navigator.clipboard.readText();
      } catch (e) {
        handlePermissionError();
      }

      return;
    }
  };

  const handlePermissionError = () => {

    let msg = editor.translate(
      'Clipboard permission denied. Please allow clipboard access to use this feature.'
    );

    if (Env.os.isMacOS() || Env.os.isiOS()) {
      msg = msg.replace(/Ctrl\+/g, '\u2318+');
    }

    editor.notificationManager.open({ text: msg, type: 'error' });

    return false;
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      const executeCommand = async () => {
        const secureContextCheck = window.isSecureContext ? true : handleSecureContentError();
        const isPermitted = browser.isChromium() ? await navigator.permissions.query({ name: 'clipboard-read' as PermissionName }) : { state: 'granted' };

        if (secureContextCheck && isPermitted.state === 'granted') {
          switch (command) {
            case 'copy':
              await copyToClipboard(editor.selection.getContent());
              break;
            case 'paste':
              await pasteFromClipboard();
              break;
            case 'cut':
              await cutToClipboard(editor.selection.getContent());
              break;
          }
        } else if (isPermitted.state === 'prompt') {
          checkPermission();
        } else {
          handleSecureContentError();
        }
      };

      executeCommand();
    }
  });
};
