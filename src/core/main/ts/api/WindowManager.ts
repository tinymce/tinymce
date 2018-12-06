/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import SelectionBookmark from '../selection/SelectionBookmark';
import WindowManagerImpl from '../ui/WindowManagerImpl';
import { Editor } from './Editor';
import { Types } from '@ephox/bridge';

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

export interface WindowManager {
  open: <T>(config: Types.Dialog.DialogApi<T>, params?) => Types.Dialog.DialogInstanceApi<T>;
  alert: (message: string, callback?: () => void, scope?) => void;
  confirm: (message: string, callback?: (state: boolean) => void, scope?) => void;
  close: () => void;
}

export interface WindowManagerImpl {
  open: <T>(config: Types.Dialog.DialogApi<T>, params, closeWindow: (dialog: Types.Dialog.DialogInstanceApi<T>) => void) => Types.Dialog.DialogInstanceApi<T>;
  alert: (message: string, callback: () => void) => void;
  confirm: (message: string, callback: (state: boolean) => void) => void;
  close: (dialog: Types.Dialog.DialogInstanceApi<any>) => void;
}

export default function (editor: Editor): WindowManager {
  let dialogs: Types.Dialog.DialogInstanceApi<any>[] = [];

  const getImplementation = function (): WindowManagerImpl {
    const theme = editor.theme;
    return theme && theme.getWindowManagerImpl ? theme.getWindowManagerImpl() : WindowManagerImpl();
  };

  const funcBind = function (scope, f) {
    return function () {
      return f ? f.apply(scope, arguments) : undefined;
    };
  };

  const fireOpenEvent = function <T>(dialog: Types.Dialog.DialogInstanceApi<T>) {
    editor.fire('OpenWindow', {
      dialog
    });
  };

  const fireCloseEvent = function <T>(dialog: Types.Dialog.DialogInstanceApi<T>) {
    editor.fire('CloseWindow', {
      dialog
    });
  };

  const addDialog = function <T>(dialog: Types.Dialog.DialogInstanceApi<T>) {
    dialogs.push(dialog);
    fireOpenEvent(dialog);
  };

  const closeDialog = function <T>(dialog: Types.Dialog.DialogInstanceApi<T>) {
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

  const open = function <T>(args, params?): Types.Dialog.DialogInstanceApi<T> {
    editor.editorManager.setActive(editor);
    SelectionBookmark.store(editor);

    const dialog = getImplementation().open<T>(args, params, closeDialog);
    addDialog(dialog);
    return dialog;
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
     * @param {Object} args Optional name/value settings collection contains things like width/height/url etc.
     * @param {Object} params Options like title, file, width, height etc.
     * @option {String} title Window title.
     * @option {String} file URL of the file to open in the window.
     * @option {Number} width Width in pixels.
     * @option {Number} height Height in pixels.
     * @option {Boolean} autoScroll Specifies whether the popup window can have scrollbars if required (i.e. content
     * larger than the popup size specified).
     */
    open,

    /**
     * Creates a alert dialog. Please don't use the blocking behavior of this
     * native version use the callback method instead then it can be extended.
     *
     * @method alert
     * @param {String} message Text to display in the new alert dialog.
     * @param {function} callback Callback function to be executed after the user has selected ok.
     * @param {Object} scope Optional scope to execute the callback in.
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
     * @param {function} callback Callback function to be executed after the user has selected ok or cancel.
     * @param {Object} scope Optional scope to execute the callback in.
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
}