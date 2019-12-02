/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import SelectionBookmark from '../selection/SelectionBookmark';
import WindowManagerImpl from '../ui/WindowManagerImpl';
import Editor from './Editor';

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

type InstanceApi<T> = Types.UrlDialog.UrlDialogInstanceApi | Types.Dialog.DialogInstanceApi<T>;

export interface WindowManagerImpl {
  open: <T>(config: Types.Dialog.DialogApi<T>, params, closeWindow: (dialog: Types.Dialog.DialogInstanceApi<T>) => void) => Types.Dialog.DialogInstanceApi<T>;
  openUrl: <T>(config: Types.UrlDialog.UrlDialogApi, closeWindow: (dialog: Types.UrlDialog.UrlDialogInstanceApi) => void) => Types.UrlDialog.UrlDialogInstanceApi;
  alert: (message: string, callback: () => void) => void;
  confirm: (message: string, callback: (state: boolean) => void) => void;
  close: (dialog: InstanceApi<any>) => void;
}

interface WindowManager {
  open: <T>(config: Types.Dialog.DialogApi<T>, params?) => Types.Dialog.DialogInstanceApi<T>;
  openUrl: <T>(config: Types.UrlDialog.UrlDialogApi) => Types.UrlDialog.UrlDialogInstanceApi;
  alert: (message: string, callback?: () => void, scope?) => void;
  confirm: (message: string, callback?: (state: boolean) => void, scope?) => void;
  close: () => void;
}

const WindowManager = function (editor: Editor): WindowManager {
  let dialogs: InstanceApi<any>[] = [];

  const getImplementation = function (): WindowManagerImpl {
    const theme = editor.theme;
    return theme && theme.getWindowManagerImpl ? theme.getWindowManagerImpl() : WindowManagerImpl();
  };

  const funcBind = function (scope, f) {
    return function () {
      return f ? f.apply(scope, arguments) : undefined;
    };
  };

  const fireOpenEvent = function <T>(dialog: InstanceApi<T>) {
    editor.fire('OpenWindow', {
      dialog
    });
  };

  const fireCloseEvent = function <T>(dialog: InstanceApi<T>) {
    editor.fire('CloseWindow', {
      dialog
    });
  };

  const addDialog = function <T>(dialog: InstanceApi<T>) {
    dialogs.push(dialog);
    fireOpenEvent(dialog);
  };

  const closeDialog = function <T>(dialog: InstanceApi<T>) {
    fireCloseEvent(dialog);
    dialogs = Arr.filter(dialogs, function (otherDialog) {
      return otherDialog !== dialog;
    });
    // Move focus back to editor when the last window is closed
    if (dialogs.length === 0) {
      editor.focus();
    }
  };

  const getTopDialog = function () {
    return Option.from(dialogs[dialogs.length - 1]);
  };

  const storeSelectionAndOpenDialog = <T extends InstanceApi<any>>(openDialog: () => T) => {
    editor.editorManager.setActive(editor);
    SelectionBookmark.store(editor);

    const dialog = openDialog();
    addDialog(dialog);
    return dialog;
  };

  const open = function <T>(args, params?): Types.Dialog.DialogInstanceApi<T> {
    return storeSelectionAndOpenDialog(() => getImplementation().open<T>(args, params, closeDialog));
  };

  const openUrl = function (args): Types.UrlDialog.UrlDialogInstanceApi {
    return storeSelectionAndOpenDialog(() => getImplementation().openUrl(args, closeDialog));
  };

  const alert = function (message, callback?: () => void, scope?) {
    getImplementation().alert(message, funcBind(scope ? scope : this, callback));
  };

  const confirm = function (message, callback?: (state: boolean) => void, scope?) {
    getImplementation().confirm(message, funcBind(scope ? scope : this, callback));
  };

  const close = function () {
    getTopDialog().each(function (dialog) {
      getImplementation().close(dialog);
      closeDialog(dialog);
    });
  };

  editor.on('remove', function () {
    Arr.each(dialogs, function (dialog) {
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