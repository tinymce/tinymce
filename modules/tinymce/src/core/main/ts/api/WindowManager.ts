/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
 * tinymce.activeEditor.windowManager.open({
 *    url: 'file.htm',
 *    width: 320,
 *    height: 240
 * }, {
 *    custom_param: 1
 * });
 *
 * // Displays an alert box using the active editors window manager instance
 * tinymce.activeEditor.windowManager.alert('Hello world!');
 *
 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
 * });
 */

export interface WindowParams {
  readonly inline?: 'cursor' | 'toolbar';
  readonly ariaAttrs?: boolean;
}

interface WindowManager {
  open: <T>(config: Dialog.DialogSpec<T>, params?: WindowParams) => Dialog.DialogInstanceApi<T>;
  openUrl: (config: Dialog.UrlDialogSpec) => Dialog.UrlDialogInstanceApi;
  alert: (message: string, callback?: () => void, scope?) => void;
  confirm: (message: string, callback?: (state: boolean) => void, scope?) => void;
  close: () => void;
}

export type InstanceApi<T> = Dialog.UrlDialogInstanceApi | Dialog.DialogInstanceApi<T>;

export interface WindowManagerImpl {
  open: <T>(config: Dialog.DialogSpec<T>, params: WindowParams, closeWindow: (dialog: Dialog.DialogInstanceApi<T>) => void) => Dialog.DialogInstanceApi<T>;
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

  const funcBind = (scope, f) => {
    return (...args: any[]) => {
      return f ? f.apply(scope, args) : undefined;
    };
  };

  const fireOpenEvent = <T>(dialog: InstanceApi<T>) => {
    editor.fire('OpenWindow', {
      dialog
    });
  };

  const fireCloseEvent = <T>(dialog: InstanceApi<T>) => {
    editor.fire('CloseWindow', {
      dialog
    });
  };

  const addDialog = <T>(dialog: InstanceApi<T>) => {
    dialogs.push(dialog);
    fireOpenEvent(dialog);
  };

  const closeDialog = <T>(dialog: InstanceApi<T>) => {
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

    const dialog = openDialog();
    addDialog(dialog);
    return dialog;
  };

  const open = <T>(args, params?: WindowParams): Dialog.DialogInstanceApi<T> => {
    return storeSelectionAndOpenDialog(() => getImplementation().open<T>(args, params, closeDialog));
  };

  const openUrl = (args): Dialog.UrlDialogInstanceApi => {
    return storeSelectionAndOpenDialog(() => getImplementation().openUrl(args, closeDialog));
  };

  const alert = (message, callback?: () => void, scope?) => {
    const windowManagerImpl = getImplementation();
    windowManagerImpl.alert(message, funcBind(scope ? scope : windowManagerImpl, callback));
  };

  const confirm = (message, callback?: (state: boolean) => void, scope?) => {
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
     * @param {Object} args For a list of options, see: <a href="https://www.tiny.cloud/docs/ui-components/dialog/#configurationoptions">Dialog - Configuration options</a>.
     */
    open,

    /**
     * Opens a new window for the specified url.
     *
     * @method openUrl
     * @param {Object} args For a list of options, see: <a href="https://www.tiny.cloud/docs/ui-components/urldialog/#urldialogconfiguration">URL dialog configuration</a>.
     */
    openUrl,

    /**
     * Creates an alert dialog. Please don't use the blocking behavior of this
     * native version use the callback method instead then it can be extended.
     *
     * @method alert
     * @param {String} message Text to display in the new alert dialog.
     * @param {function} callback (Optional) Callback function to be executed after the user has selected ok.
     * @param {Object} scope (Optional) Scope to execute the callback in.
     * @example
     * // Displays an alert box using the active editors window manager instance
     * tinymce.activeEditor.windowManager.alert('Hello world!');
     */
    alert,

    /**
     * Creates a confirm dialog. Please don't use the blocking behavior of this
     * native version use the callback method instead then it can be extended.
     *
     * @method confirm
     * @param {String} message Text to display in the new confirm dialog.
     * @param {function} callback (Optional) Callback function to be executed after the user has selected ok or cancel.
     * @param {Object} scope (Optional) Scope to execute the callback in.
     * @example
     * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
     * tinymce.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
     *    if (s)
     *       tinymce.activeEditor.windowManager.alert("Ok");
     *    else
     *       tinymce.activeEditor.windowManager.alert("Cancel");
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
