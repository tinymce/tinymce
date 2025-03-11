import { Fun } from '@ephox/katamari';

import * as CutCopy from '../../paste/CutCopy';
import * as NativeClipboard from '../../paste/NativeClipboard';
import Editor from '../Editor';
import Env from '../Env';
import Delay from '../util/Delay';

const errorStatusToErrorMessage = (status: NativeClipboard.BaseClipboardErrorStatus): string => {
  switch (status) {
    case 'inactive':
      return 'This operation requires the webpage to be active.';
    case 'insecure':
      return 'This operation requires a secure context (HTTPS).';
    case 'no-permission':
      return 'Clipboard permission denied. Please allow clipboard access to use this feature.';
    case 'unknown':
      return 'An uknown clipboard error occured.';
  }
};

const handleErrorNotification = (editor: Editor, message: string): void => {
  editor.notificationManager.open({ text: editor.translate(message), type: 'error' });
};

const executeNativeClipboardApi = async (editor: Editor, command: string): Promise<void> => {
  switch (command) {
    case 'copy': {
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
      const writeResult = await NativeClipboard.write(data);
      return writeResult.fold(
        (errorStatus) => {
          const errorMessage = errorStatusToErrorMessage(errorStatus);
          handleErrorNotification(editor, errorMessage);
        },
        Fun.noop
      );
    }
    case 'cut': {
      // TODO: Can we just use cut event?
      // editor.dispatch('cut');

      const selectionData = CutCopy.getSelectionData(editor);
      const data = {
        'text/html': selectionData.html,
        'text/plain': selectionData.text,
      };
      const writeResult = await NativeClipboard.write(data);
      return writeResult.fold(
        (errorStatus) => {
          const errorMessage = errorStatusToErrorMessage(errorStatus);
          handleErrorNotification(editor, errorMessage);
        },
        () => {
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
        }
      );
    }
    case 'paste':
      // TODO: Can we just use paste event?
      // editor.dispatch('paste');

      const readResult = await NativeClipboard.read();
      return readResult.fold(
        async (errorStatus) => {
          const errorMessage = errorStatusToErrorMessage(errorStatus);
          handleErrorNotification(editor, errorMessage);
        },
        async (clipboardContents) => {
          const data = await NativeClipboard.clipboardItemsToTypes(clipboardContents);
          const usePlainText = editor.queryCommandState('mceTogglePlainTextPaste');
          editor.execCommand('mceInsertClipboardContent', false, {
            text: usePlainText ? data['text/plain'] : '',
            html: !usePlainText ? data['text/html'] : ''
          });
        }
      );
  }
};

const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      executeNativeClipboardApi(editor, command.toLowerCase()).catch(() => {
        handleErrorNotification(editor, 'Clipboard operation failed.');
      });
    }
  });
};

export {
  registerCommands
};
