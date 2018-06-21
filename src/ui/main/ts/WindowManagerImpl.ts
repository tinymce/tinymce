/**
 * WindowManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Window from './Window';
import MessageBox from './MessageBox';
import { document } from '@ephox/dom-globals';

export default function (editor) {
  const open = function (args, params, closeCallback) {
    let win;

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
          text: 'Ok', subtype: 'primary', onclick () {
            win.find('form')[0].submit();
          }
        },

        {
          text: 'Cancel', onclick () {
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
          const name = ctrl.name();

          if (name in args.data) {
            ctrl.value(args.data[name]);
          }
        });
      });
    }

    // store args and parameters
    win.features = args || {};
    win.params = params || {};

    // Always render dialogs into the body since webkit would scroll ui containers
    // if you open a fixed container and move focus to an input within that container
    win = win.renderTo(document.body).reflow();

    return win;
  };

  const alert = function (message, choiceCallback, closeCallback) {
    let win;

    win = MessageBox.alert(message, function () {
      choiceCallback();
    });

    win.on('close', function () {
      closeCallback(win);
    });

    return win;
  };

  const confirm = function (message, choiceCallback, closeCallback) {
    let win;

    win = MessageBox.confirm(message, function (state) {
      choiceCallback(state);
    });

    win.on('close', function () {
      closeCallback(win);
    });

    return win;
  };

  const close = function (window) {
    window.close();
  };

  const getParams = function (window) {
    return window.params;
  };

  const setParams = function (window, params) {
    window.params = params;
  };

  return {
    open,
    alert,
    confirm,
    close,
    getParams,
    setParams
  };
}