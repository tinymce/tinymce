import { Arr, Optional } from '@ephox/katamari';

import * as SelectionBookmark from '../selection/SelectionBookmark';
import WindowManagerImpl from '../ui/WindowManagerImpl';
import Editor from './Editor';
import { Dialog } from './ui/Ui';

/**
 * This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
 *
 * @class tinymce.WindowManager
 * @example
 * // Opens a new dialog with the file.htm file and the size 320x240
 * tinymce.activeEditor.windowManager.openUrl({
 *   title: 'Custom Dialog',
 *   url: 'file.htm',
 *   width: 320,
 *   height: 240
 * });
 *
 * // Displays an alert box using the active editor’s window manager instance
 * tinymce.activeEditor.windowManager.alert('Hello world!');
 *
 * // Displays a confirm box. An alert message will display depending on what is chosen in the confirm box.
 * tinymce.activeEditor.windowManager.confirm('Do you want to do something?', (state) => {
 *   const message = state ? 'Ok' : 'Cancel';
 *   tinymce.activeEditor.windowManager.alert(message);
 * });
 */

export interface WindowParams {
  readonly inline?: 'cursor' | 'toolbar' | 'bottom';
  readonly ariaAttrs?: boolean;
  readonly persistent?: boolean;
}

interface WindowManager {
  open: <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, params?: WindowParams) => Dialog.DialogInstanceApi<T>;
  openUrl: (config: Dialog.UrlDialogSpec) => Dialog.UrlDialogInstanceApi;
  alert: (message: string, callback?: () => void, scope?: any) => void;
  confirm: (message: string, callback?: (state: boolean) => void, scope?: any) => void;
  close: () => void;
}

export type InstanceApi<T extends Dialog.DialogData> = Dialog.UrlDialogInstanceApi | Dialog.DialogInstanceApi<T>;

export interface WindowManagerImpl {
  open: <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, params: WindowParams | undefined, closeWindow: (dialog: Dialog.DialogInstanceApi<T>) => void) => Dialog.DialogInstanceApi<T>;
  openUrl: (config: Dialog.UrlDialogSpec, closeWindow: (dialog: Dialog.UrlDialogInstanceApi) => void) => Dialog.UrlDialogInstanceApi;
  alert: (message: string, callback: () => void) => void;
  confirm: (message: string, callback: (state: boolean) => void) => void;
  close: (dialog: InstanceApi<any>) => void;
}

const WindowManager = (editor: Editor): WindowManager => {
  let dialogs: InstanceApi<any>[] = [];

  const getImplementation = (): WindowManagerImpl => {
    const theme = editor.theme;
    return theme && theme.getWindowManagerImpl ? theme.getWindowManagerImpl() : WindowManagerImpl();
  };

  const funcBind = <T extends (...args: any) => any>(scope: any, f: T | undefined) => {
    return (...args: Parameters<T>) => {
      return f ? f.apply(scope, args) : undefined;
    };
  };

  const fireOpenEvent = <T extends Dialog.DialogData>(dialog: InstanceApi<T>) => {
    editor.dispatch('OpenWindow', {
      dialog
    });
  };

  const fireCloseEvent = <T extends Dialog.DialogData>(dialog: InstanceApi<T>) => {
    editor.dispatch('CloseWindow', {
      dialog
    });
  };

  const addDialog = <T extends Dialog.DialogData>(dialog: InstanceApi<T>) => {
    dialogs.push(dialog);
    fireOpenEvent(dialog);
  };

  const closeDialog = <T extends Dialog.DialogData>(dialog: InstanceApi<T>) => {
    fireCloseEvent(dialog);
    dialogs = Arr.filter(dialogs, (otherDialog) => {
      return otherDialog !== dialog;
    });
    // Move focus back to editor when the last window is closed
    if (dialogs.length === 0) {
      editor.focus();
    }
  };

  const getTopDialog = () => {
    return Optional.from(dialogs[dialogs.length - 1]);
  };

  const storeSelectionAndOpenDialog = <T extends InstanceApi<any>>(openDialog: () => T) => {
    editor.editorManager.setActive(editor);
    SelectionBookmark.store(editor);

    editor.ui.show();
    const dialog = openDialog();
    addDialog(dialog);
    return dialog;
  };

  const open = <T extends Dialog.DialogData>(args: Dialog.DialogSpec<T>, params?: WindowParams): Dialog.DialogInstanceApi<T> => {
    return storeSelectionAndOpenDialog(() => getImplementation().open<T>(args, params, closeDialog));
  };

  const openUrl = (args: Dialog.UrlDialogSpec): Dialog.UrlDialogInstanceApi => {
    return storeSelectionAndOpenDialog(() => getImplementation().openUrl(args, closeDialog));
  };

  const alert = (message: string, callback?: () => void, scope?: any) => {
    const windowManagerImpl = getImplementation();
    windowManagerImpl.alert(message, funcBind(scope ? scope : windowManagerImpl, callback));
  };

  const confirm = (message: string, callback?: (state: boolean) => void, scope?: any) => {
    const windowManagerImpl = getImplementation();
    windowManagerImpl.confirm(message, funcBind(scope ? scope : windowManagerImpl, callback));
  };

  const close = () => {
    getTopDialog().each((dialog) => {
      getImplementation().close(dialog);
      closeDialog(dialog);
    });
  };

  editor.on('remove', () => {
    Arr.each(dialogs, (dialog) => {
      getImplementation().close(dialog);
    });
  });

  return {
    /**
     * Opens a new window.
     *
     * @method open
     * @param {Object} config For information on the available options, see: <a href="https://www.tiny.cloud/docs/tinymce/6/dialog-configuration/#options">Dialog - Configuration options</a>.
     * @param {Object} params (Optional) For information on the available options, see: <a href="https://www.tiny.cloud/docs/tinymce/6/dialog-configuration/#configuration-parameters">Dialog - Configuration parameters</a>.
     * @returns {WindowManager.DialogInstanceApi} A new dialog instance.
     */
    open,

    /**
     * Opens a new window for the specified url.
     *
     * @method openUrl
     * @param {Object} config For information on the available options, see: <a href="https://www.tiny.cloud/docs/tinymce/6/urldialog/#configuration">URL dialog - Configuration</a>.
     * @returns {WindowManager.UrlDialogInstanceApi} A new URL dialog instance.
     */
    openUrl,

    /**
     * Creates an alert dialog. Do not use the blocking behavior of this
     * native version. Use the callback method instead; then it can be extended.
     *
     * @method alert
     * @param {String} message Text to display in the new alert dialog.
     * @param {Function} callback (Optional) Callback function to be executed after the user has selected ok.
     * @param {Object} scope (Optional) Scope to execute the callback in.
     * @example
     * // Displays an alert box using the active editors window manager instance
     * tinymce.activeEditor.windowManager.alert('Hello world!');
     */
    alert,

    /**
     * Creates an alert dialog. Do not use the blocking behavior of this
     * native version. Use the callback method instead; then it can be extended.
     *
     * @method confirm
     * @param {String} message Text to display in the new confirm dialog.
     * @param {Function} callback (Optional) Callback function to be executed after the user has selected ok or cancel.
     * @param {Object} scope (Optional) Scope to execute the callback in.
     * @example
     * // Displays a confirm box and an alert message will be displayed depending on what you choose in the confirm
     * tinymce.activeEditor.windowManager.confirm('Do you want to do something?', (state) => {
     *   const message = state ? 'Ok' : 'Cancel';
     *   tinymce.activeEditor.windowManager.alert(message);
     * });
     */
    confirm,

    /**
     * Closes the top most window.
     *
     * @method close
     */
    close
  };
};

export default WindowManager;
