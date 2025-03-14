/* eslint-disable no-console */
import { Fun } from '@ephox/katamari';

import * as CutCopy from '../../paste/CutCopy';
import * as NativeClipboard from '../../paste/NativeClipboard';
import Editor from '../Editor';
import Env from '../Env';
import Delay from '../util/Delay';

const ClipboardUtils = {

  getShortcutText: (): string => {
    return `${Env.os.isMacOS() ? 'Cmd' : 'Ctrl'}+V`;
  },

  getBrowserRestrictionsMessage: (): string => {
    return `Your browser restricts clipboard access. Please use keyboard shortcut (${ClipboardUtils.getShortcutText()}) instead.`;
  },

  hasClipboardRestrictions: (): boolean => {
    return NativeClipboard.BrowserConfig.requiresUserActivation();
  }
};

const errorStatusToErrorMessage = (status: NativeClipboard.BaseClipboardErrorStatus): string => {
  if (ClipboardUtils.hasClipboardRestrictions() && (status === 'no-permission' || status === 'unknown')) {
    return ClipboardUtils.getBrowserRestrictionsMessage();
  }

  switch (status) {
    case 'inactive':
      return 'This operation requires the webpage to be active.';
    case 'insecure':
      return 'This operation requires a secure context (HTTPS).';
    case 'no-permission':
      return 'Clipboard permission denied. Please allow clipboard access to use this feature.';
    case 'api-unavailable':
      return 'Browser clipboard functionality is not available in your browser.';
    case 'unknown':
    default:
      return 'An unknown clipboard error occurred.';
  }
};

const handleErrorNotification = (editor: Editor, message: string): void => {
  editor.notificationManager.open({ text: editor.translate(message), type: 'error' });
};

const executeCopy = async (editor: Editor): Promise<void> => {
  const selectionData = CutCopy.getSelectionData(editor);
  const data = {
    [NativeClipboard.CLIPBOARD_CONTENT_TYPES.HTML]: selectionData.html,
    [NativeClipboard.CLIPBOARD_CONTENT_TYPES.TEXT]: selectionData.text,
  };

  const writeResult = await NativeClipboard.write(data);

  writeResult.fold(
    (errorStatus) => {
      const errorMessage = errorStatusToErrorMessage(errorStatus);
      handleErrorNotification(editor, errorMessage);
    },
    Fun.noop
  );
};

const executeCut = async (editor: Editor): Promise<void> => {
  const selectionData = CutCopy.getSelectionData(editor);
  const data = {
    [NativeClipboard.CLIPBOARD_CONTENT_TYPES.HTML]: selectionData.html,
    [NativeClipboard.CLIPBOARD_CONTENT_TYPES.TEXT]: selectionData.text,
  };

  const writeResult = await NativeClipboard.write(data);

  writeResult.fold(
    (errorStatus) => {
      const errorMessage = errorStatusToErrorMessage(errorStatus);
      handleErrorNotification(editor, errorMessage);
    },
    () => deleteSelectedContent(editor)
  );
};

const deleteSelectedContent = (editor: Editor): void => {
  if (Env.browser.isChromium() || Env.browser.isFirefox()) {
    const rng = editor.selection.getRng();
    // Chrome and Firefox don't allow executing commands recursively
    // so we need to use a timeout to detach from the current execution context
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
  if (ClipboardUtils.hasClipboardRestrictions() &&
      (errorStatus === 'unknown' || errorStatus === 'no-permission')) {
    handleErrorNotification(
      editor,
      ClipboardUtils.getBrowserRestrictionsMessage()
    );
  } else {
    const errorMessage = errorStatusToErrorMessage(errorStatus);
    handleErrorNotification(editor, errorMessage);
  }
};

const executePaste = async (editor: Editor): Promise<void> => {
  const readStatus = await NativeClipboard.canRead();

  if (readStatus === 'inactive') {
    if (ClipboardUtils.hasClipboardRestrictions()) {
      handleErrorNotification(
        editor,
        `Your browser requires clipboard access to be triggered by a direct user action. Please use keyboard shortcut (${ClipboardUtils.getShortcutText()}) instead.`
      );
      return;
    }

    handleErrorNotification(
      editor,
      'This operation requires the webpage to be active. Please click on the page and try again.'
    );
    return;
  }

  if (readStatus === 'no-permission') {
    handleErrorNotification(
      editor,
      'Clipboard access is blocked. Please click "Allow" on the permission prompt that appears.'
    );

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
    const errorMessage = errorStatusToErrorMessage(readStatus);
    handleErrorNotification(editor, errorMessage);
  } else {
    try {
      const readResult = await NativeClipboard.read();

      readResult.fold(
        (errorStatus) => handleClipboardReadError(editor, errorStatus),
        (clipboardContents) => processClipboardContents(editor, clipboardContents)
      );
    } catch (error) {
      if (ClipboardUtils.hasClipboardRestrictions()) {
        handleErrorNotification(
          editor,
          ClipboardUtils.getBrowserRestrictionsMessage()
        );
      } else {
        console.error('Error reading clipboard:', error);
        handleErrorNotification(editor, 'Failed to read from clipboard.');
      }
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

export {
  registerCommands
};
