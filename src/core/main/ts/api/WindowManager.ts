/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import SelectionBookmark from '../selection/SelectionBookmark';
import WindowManagerImpl from '../ui/WindowManagerImpl';

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

export default function (editor) {
  const windows = [];

  const getImplementation = function () {
    const theme = editor.theme;
    return theme && theme.getWindowManagerImpl ? theme.getWindowManagerImpl() : WindowManagerImpl();
  };

  const funcBind = function (scope, f) {
    return function () {
      return f ? f.apply(scope, arguments) : undefined;
    };
  };

  const fireOpenEvent = function (win) {
    editor.fire('OpenWindow', {
      win
    });
  };

  const fireCloseEvent = function (win) {
    editor.fire('CloseWindow', {
      win
    });
  };

  const addWindow = function (win) {
    windows.push(win);
    fireOpenEvent(win);
  };

  const closeWindow = function (win) {
    Arr.findIndex(windows, function (otherWindow) {
      return otherWindow === win;
    }).each(function (index) {
      // Mutate here since third party might have stored away the window array, consider breaking this api
      windows.splice(index, 1);

      fireCloseEvent(win);

      // Move focus back to editor when the last window is closed
      if (windows.length === 0) {
        editor.focus();
      }
    });
  };

  const getTopWindow = function () {
    return Option.from(windows[windows.length - 1]);
  };

  const open = function (args, params) {
    editor.editorManager.setActive(editor);
    SelectionBookmark.store(editor);

    const win = getImplementation().open(args, params, closeWindow);
    addWindow(win);
    return win;
  };

  const alert = function (message, callback, scope) {
    const win = getImplementation().alert(message, funcBind(scope ? scope : this, callback), closeWindow);
    addWindow(win);
  };

  const confirm = function (message, callback, scope) {
    const win = getImplementation().confirm(message, funcBind(scope ? scope : this, callback), closeWindow);
    addWindow(win);
  };

  const close = function () {
    getTopWindow().each(function (win) {
      getImplementation().close(win);
      closeWindow(win);
    });
  };

  const getParams = function () {
    return getTopWindow().map(getImplementation().getParams).getOr(null);
  };

  const setParams = function (params) {
    getTopWindow().each(function (win) {
      getImplementation().setParams(win, params);
    });
  };

  const getWindows = function () {
    return windows;
  };

  editor.on('remove', function () {
    Arr.each(windows.slice(0), function (win) {
      getImplementation().close(win);
    });
  });

  return {
    // Used by the legacy3x compat layer and possible third party
    // TODO: Deprecate this, and possible switch to a immutable window array for getWindows
    windows,

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
    close,

    /**
     * Returns the params of the last window open call. This can be used in iframe based
     * dialog to get params passed from the tinymce plugin.
     *
     * @example
     * var dialogArguments = top.tinymce.activeEditor.windowManager.getParams();
     *
     * @method getParams
     * @return {Object} Name/value object with parameters passed from windowManager.open call.
     */
    getParams,

    /**
     * Sets the params of the last opened window.
     *
     * @method setParams
     * @param {Object} params Params object to set for the last opened window.
     */
    setParams,

    /**
     * Returns the currently opened window objects.
     *
     * @method getWindows
     * @return {Array} Array of the currently opened windows.
     */
    getWindows
  };
}