/**
 * WindowManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.WindowManagerImpl',
  [
    "tinymce.ui.Window",
    "tinymce.ui.MessageBox"
  ],
  function (Window, MessageBox) {
    return function (editor) {
      var open = function (args, params, closeCallback) {
        var win;

        args.title = args.title || ' ';

        // Handle URL
        args.url = args.url || args.file; // Legacy
        if (args.url) {
          args.width = parseInt(args.width || 320, 10);
          args.height = parseInt(args.height || 240, 10);
        }

        // Handle body
        if (args.body) {
          args.items = {
            defaults: args.defaults,
            type: args.bodyType || 'form',
            items: args.body,
            data: args.data,
            callbacks: args.commands
          };
        }

        if (!args.url && !args.buttons) {
          args.buttons = [
            {
              text: 'Ok', subtype: 'primary', onclick: function () {
                win.find('form')[0].submit();
              }
            },

            {
              text: 'Cancel', onclick: function () {
                win.close();
              }
            }
          ];
        }

        win = new Window(args);

        win.on('close', function () {
          closeCallback(win);
        });

        // Handle data
        if (args.data) {
          win.on('postRender', function () {
            this.find('*').each(function (ctrl) {
              var name = ctrl.name();

              if (name in args.data) {
                ctrl.value(args.data[name]);
              }
            });
          });
        }

        // store args and parameters
        win.features = args || {};
        win.params = params || {};

        win = win.renderTo().reflow();

        return win;
      };

      var alert = function (message, choiceCallback, closeCallback) {
        var win;

        win = MessageBox.alert(message, function () {
          choiceCallback();
        });

        win.on('close', function () {
          closeCallback(win);
        });

        return win;
      };

      var confirm = function (message, choiceCallback, closeCallback) {
        var win;

        win = MessageBox.confirm(message, function (state) {
          choiceCallback(state);
        });

        win.on('close', function () {
          closeCallback(win);
        });

        return win;
      };

      var close = function (window) {
        window.close();
      };

      var getParams = function (window) {
        return window.params;
      };

      var setParams = function (window, params) {
        window.params = params;
      };

      return {
        open: open,
        alert: alert,
        confirm: confirm,
        close: close,
        getParams: getParams,
        setParams: setParams
      };
    };
  }
);
