/* eslint-disable no-console */
import { Fun } from '@ephox/katamari';

import * as CutCopy from '../../paste/CutCopy';
import * as NativeClipboard from '../../paste/NativeClipboard';
import Editor from '../Editor';
import Env from '../Env';
import Delay from '../util/Delay';

const ClipboardUtils = {
  getShortcutText: (): string => `${Env.os.isMacOS() ? 'Cmd' : 'Ctrl'}+V`,

  getBrowserRestrictionsMessage: (): string =>
    `Your browser restricts clipboard access. Please use keyboard shortcut (${ClipboardUtils.getShortcutText()}) instead.`,

  hasPasteRestrictions: (): boolean => NativeClipboard.BrowserConfig.requiresUserActivation(),

  getClipboardData: (editor: Editor) => {
    const selectionData = CutCopy.getSelectionData(editor);
    return {
      [NativeClipboard.CLIPBOARD_CONTENT_TYPES.HTML]: selectionData.html,
      [NativeClipboard.CLIPBOARD_CONTENT_TYPES.TEXT]: selectionData.text,
    };
  }
};

const errorStatusToErrorMessage = (status: NativeClipboard.BaseClipboardErrorStatus): string => {
  if (ClipboardUtils.hasPasteRestrictions() && (status === 'no-permission' || status === 'unknown')) {
    return ClipboardUtils.getBrowserRestrictionsMessage();
  }

  const errorMessages: Record<NativeClipboard.BaseClipboardErrorStatus, string> = {
    'inactive': 'This operation requires the webpage to be active.',
    'insecure': 'This operation requires a secure context (HTTPS).',
    'no-permission': 'Clipboard permission denied. Please allow clipboard access to use this feature.',
    'api-unavailable': 'Browser clipboard functionality is not available in your browser.',
    'unknown': 'An unknown clipboard error occurred.'
  };

  return errorMessages[status] || errorMessages.unknown;
};

const handleErrorNotification = (editor: Editor, message: string): void => {
  const type = ClipboardUtils.hasPasteRestrictions() ? 'info' : 'error';
  editor.notificationManager.open({ text: editor.translate(message), type });
};

const handleClipboardWrite = async (editor: Editor, data: Record<string, string>): Promise<void> => {
  const writeResult = await NativeClipboard.write(data);
  writeResult.fold(
    (errorStatus) => {
      const errorMessage = errorStatusToErrorMessage(errorStatus);
      handleErrorNotification(editor, errorMessage);
    },
    Fun.noop
  );
};

const deleteSelectedContent = (editor: Editor): void => {
  if (Env.browser.isChromium() || Env.browser.isFirefox()) {
    const rng = editor.selection.getRng();
    Delay.setEditorTimeout(editor, () => {
      editor.selection.setRng(rng);
      editor.execCommand('Delete');
    }, 0);
  } else {
    editor.execCommand('Delete');
  }
};

const processClipboardContents = (editor: Editor, clipboardContents: ClipboardItems): void => {
  NativeClipboard.clipboardItemsToTypes(clipboardContents)
    .then((data) => {
      const usePlainText = editor.queryCommandState('mceTogglePlainTextPaste');
      editor.execCommand('mceInsertClipboardContent', false, {
        text: usePlainText ? data[NativeClipboard.CLIPBOARD_CONTENT_TYPES.TEXT] : '',
        html: !usePlainText ? data[NativeClipboard.CLIPBOARD_CONTENT_TYPES.HTML] : ''
      });
    })
    .catch((error) => {
      console.error('Error processing clipboard data:', error);
      handleErrorNotification(editor, 'Failed to process clipboard content.');
    });
};

const handleClipboardReadError = (editor: Editor, errorStatus: NativeClipboard.BaseClipboardErrorStatus): void => {
  if (ClipboardUtils.hasPasteRestrictions() && (errorStatus === 'unknown' || errorStatus === 'no-permission')) {
    handleErrorNotification(editor, ClipboardUtils.getBrowserRestrictionsMessage());
  } else {
    handleErrorNotification(editor, errorStatusToErrorMessage(errorStatus));
  }
};

const executeCopy = async (editor: Editor): Promise<void> => {
  const data = ClipboardUtils.getClipboardData(editor);
  await handleClipboardWrite(editor, data);
};

const executeCut = async (editor: Editor): Promise<void> => {
  const data = ClipboardUtils.getClipboardData(editor);
  const writeResult = await NativeClipboard.write(data);
  writeResult.fold(
    (errorStatus) => {
      const errorMessage = errorStatusToErrorMessage(errorStatus);
      handleErrorNotification(editor, errorMessage);
    },
    () => deleteSelectedContent(editor)
  );
};

const executePaste = async (editor: Editor): Promise<void> => {
  if (ClipboardUtils.hasPasteRestrictions()) {
    handleErrorNotification(editor, ClipboardUtils.getBrowserRestrictionsMessage());
    return;
  }

  const readStatus = await NativeClipboard.canRead();

  if (readStatus === 'inactive') {
    handleErrorNotification(editor, 'This operation requires the webpage to be active. Please click on the page and try again.');
    return;
  }

  if (readStatus === 'no-permission') {
    handleErrorNotification(editor, 'Clipboard access is blocked. Please click "Allow" on the permission prompt that appears.');
    const readResult = await NativeClipboard.read();
    readResult.fold(
      (errorStatus) => {
        if (errorStatus !== 'no-permission') {
          handleClipboardReadError(editor, errorStatus);
        }
      },
      (clipboardContents) => processClipboardContents(editor, clipboardContents)
    );
  } else if (readStatus !== 'valid') {
    handleErrorNotification(editor, errorStatusToErrorMessage(readStatus));
  } else {
    try {
      const readResult = await NativeClipboard.read();
      readResult.fold(
        (errorStatus) => handleClipboardReadError(editor, errorStatus),
        (clipboardContents) => processClipboardContents(editor, clipboardContents)
      );
    } catch (error) {
      console.error('Error reading clipboard:', error);
      handleErrorNotification(editor, 'Failed to read from clipboard.');
    }
  }
};

const executeNativeClipboardCommand = async (editor: Editor, command: string): Promise<void> => {
  try {
    switch (command) {
      case 'copy':
        await executeCopy(editor);
        break;
      case 'cut':
        await executeCut(editor);
        break;
      case 'paste':
        await executePaste(editor);
        break;
    }
  } catch (error) {
    console.error('Clipboard operation failed:', error);
    handleErrorNotification(editor, 'Clipboard operation failed.');
  }
};

const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      executeNativeClipboardCommand(editor, command.toLowerCase()).catch((error) => {
        console.error('Clipboard command failed:', error);
        handleErrorNotification(editor, 'Clipboard operation failed.');
      });
    }
  });
};

export { registerCommands };
