import * as Clipboard from '../../paste/Clipboard';
import * as CutCopy from '../../paste/CutCopy';
import Editor from '../Editor';
import Env from '../Env';
import Delay from '../util/Delay';

const handleError = (editor: Editor, message: string): void => {
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

const executeNativeClipboardApi = async (editor: Editor, command: string): Promise<void> => {
  if (!window.isSecureContext) {
    handleError(editor, 'Error: This operation requires a secure context (HTTPS).');
    return;
  }

  if (!navigator.userActivation.isActive) {
    handleError(editor, 'Error: This operation requires recent interaction with the page.');
    return;
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard`
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
        return handleError(editor, 'Clipboard permission denied. Please allow clipboard access to use this feature.');
      }
    }

    // const content = editor.selection.getContent();
    switch (command) {
      case 'copy': {
        // TODO: Check 'copy' event is not triggered with old code
        // TODO: Can we just use copy event?
        // const event = new window.ClipboardEvent('copy');
        // const args = editor.dispatch('copy', event);
        // const data = Clipboard.getDataTransferItems(args.clipboardData);
        // console.log(data);

        const selectionData = CutCopy.getSelectionData(editor);
        const data = {
          'text/html': selectionData.html,
          'text/plain': selectionData.text,
        };
        const clipboardItem = new window.ClipboardItem(data);
        await navigator.clipboard.write([ clipboardItem ]);
        break;
      }
      case 'cut': {
        // TODO: Can we just use cut event?
        // editor.dispatch('cut');

        const selectionData = CutCopy.getSelectionData(editor);
        const data = {
          'text/html': selectionData.html,
          'text/plain': selectionData.text,
        };
        const clipboardItem = new window.ClipboardItem(data);
        await navigator.clipboard.write([ clipboardItem ]);

        if (Env.browser.isChromium() || Env.browser.isFirefox()) {
          const rng = editor.selection.getRng();
          // Chrome fails to execCommand from another execCommand with this message:
          // "We don't execute document.execCommand() this time, because it is called recursively.""
          // Firefox 82 now also won't run recursive commands, but it doesn't log an error
          Delay.setEditorTimeout(editor, () => { // detach
            // Restore the range before deleting, as Chrome on Android will
            // collapse the selection after a cut event has fired.
            editor.selection.setRng(rng);
            editor.execCommand('Delete');
          }, 0);
        } else {
          editor.execCommand('Delete');
        }
        break;
      }
      case 'paste':
        // TODO: Can we just use paste event?
        // editor.dispatch('paste');

        const usePlainText = editor.queryCommandState('mceTogglePlainTextPaste');
        const data = await Clipboard.getDataFromNativeClipboard();
        editor.execCommand('mceInsertClipboardContent', false, {
          text: usePlainText ? data['text/plain'] : '',
          html: !usePlainText ? data['text/html'] : ''
        });
        break;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return handleError(editor, 'Clipboard operation failed.');
  }
};

const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      executeNativeClipboardApi(editor, command.toLowerCase()).catch(() => {
        handleError(editor, 'Clipboard operation failed.');
      });
    }
  });
};

export {
  registerCommands
};
