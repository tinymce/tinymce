import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  const handleError = (message: string): void => {
    editor.notificationManager.open({ text: editor.translate(message), type: 'error' });
  };

  // const executeClipboardCommand = (command: string) => {
  //   const doc = editor.getDoc();
  //   let failed;

  //   // Try executing the native command
  //   try {
  //     doc.execCommand(command);
  //   } catch {
  //     // Command failed
  //     failed = true;
  //   }

  //   // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
  //   if (command === 'paste' && !doc.queryCommandEnabled(command)) {
  //     failed = true;
  //   }

  //   // Present alert message about clipboard access not being available
  //   if (failed || !doc.queryCommandSupported(command)) {
  //     let msg = editor.translate(
  //       `Your browser doesn't support direct access to the clipboard. ` +
  //       'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
  //     );

  //     if (Env.os.isMacOS() || Env.os.isiOS()) {
  //       msg = msg.replace(/Ctrl\+/g, '\u2318+');
  //     }

  //     editor.notificationManager.open({ text: msg, type: 'error' });
  //   }
  // };

  const executeNativeClipboardApi = async (command: string): Promise<void> => {
    if (!window.isSecureContext) {
      handleError('Error: This operation requires a secure context (HTTPS).');
      return;
    }

    if (!navigator.userActivation.isActive) {
      handleError('Error: This operation requires recent interaction with the page.');
      return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
    // This method must be called within user gesture event handlers.
    // TODO: Consider transient activation: https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation

    // readText
    // All browsers require secure context
    // Safari: No other conditions
    // Firefox: Requires method to be called within user gesture event handlers.
    // Chromium Based Browsers: The user must grant the clipboard-read permission.

    // writeText
    // All browsers require secure context
    // Safari: This method must be called within user gesture event handlers.
    // Firefox: This method must be called within user gesture event handlers.
    // Chrome: From version 107, this method must be called within user gesture event handlers, or the user must grant the clipboard-write permission.

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
          // TODO: Make this work with actual HTML
          const text = await navigator.clipboard.readText();
          editor.insertContent(text);
          break;
        case 'cut':
          await navigator.clipboard.writeText(content);
          editor.insertContent('');
          break;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return handleError('Clipboard operation failed.');
    }
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      executeNativeClipboardApi(command.toLowerCase()).catch(() => {
        handleError('Clipboard operation failed.');
      });
    }
  });
};
