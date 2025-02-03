import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  const browser = Env.browser;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const pasteFromClipboard = async (): Promise<void> => {
    const text = await navigator.clipboard.readText();
    editor.selection.setContent(text);
  };

  const cutToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    editor.selection.setContent('');
  };

  const handleError = (message: string): false => {
    editor.notificationManager.open({ text: editor.translate(message), type: 'error' });
    return false;
  };

  const checkSecureContext = (): boolean =>
    window.isSecureContext ? true : handleError(
      'Error: This operation requires a secure context (HTTPS).' +
      'Direct access to the clipboard is not allowed in insecure contexts.'
    );

  const checkClipboardPermission = async (): Promise<boolean> => {
    if (!browser.isChromium()) {
      return true;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });

      switch (permission.state) {
        case 'granted':
          return true;
        case 'denied':
          return handleError('Clipboard permission denied. Please allow clipboard access to use this feature.');
        case 'prompt':
          try {
            await navigator.clipboard.readText();
            return true;
          } catch {
            return handleError('Clipboard permission denied. Please allow clipboard access to use this feature.');
          }
      }
    } catch (e) {
      return handleError('Failed to check clipboard permission.');
    }
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      const executeCommand = async () => {
        if (!checkSecureContext()) {
          return;
        }

        if (!await checkClipboardPermission()) {
          return;
        }

        try {
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
        } catch (e) {
          handleError('Failed to execute clipboard operation.');
        }
      };

      executeCommand();
    }
  });
};
