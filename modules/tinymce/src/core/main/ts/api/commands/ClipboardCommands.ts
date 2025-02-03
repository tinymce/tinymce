import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  const handleError = (message: string): false => {
    editor.notificationManager.open({ text: editor.translate(message), type: 'error' });
    return false;
  };

  const executeClipboardCommand = async (command: string): Promise<boolean> => {
    if (!window.isSecureContext) {
      return handleError('Error: This operation requires a secure context (HTTPS).');
    }

    try {
      if (Env.browser.isChromium()) {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'denied') {
          return handleError('Clipboard permission denied. Please allow clipboard access to use this feature.');
        }
      }

      const content = editor.selection.getContent();
      switch (command) {
        case 'copy':
          await navigator.clipboard.writeText(content);
          break;
        case 'paste':
          const text = await navigator.clipboard.readText();
          editor.insertContent(text);
          break;
        case 'cut':
          await navigator.clipboard.writeText(content);
          editor.insertContent('');
          break;
      }
      return true;
    } catch {
      return handleError('Clipboard operation failed.');
    }
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      executeClipboardCommand(command.toLowerCase()).catch(() => {
        handleError('Clipboard operation failed.');
      });
    }
  });
};
