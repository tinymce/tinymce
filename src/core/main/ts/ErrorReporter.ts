/**
 * ErrorReporter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { AddOnManager } from './api/AddOnManager';
import { window } from '@ephox/dom-globals';

/**
 * Various error reporting helper functions.
 *
 * @class tinymce.ErrorReporter
 * @private
 */

const PluginManager = AddOnManager.PluginManager;

const resolvePluginName = function (targetUrl, suffix) {
  for (const name in PluginManager.urls) {
    const matchUrl = PluginManager.urls[name] + '/plugin' + suffix + '.js';
    if (matchUrl === targetUrl) {
      return name;
    }
  }

  return null;
};

const pluginUrlToMessage = function (editor, url) {
  const plugin = resolvePluginName(url, editor.suffix);
  return plugin ?
    'Failed to load plugin: ' + plugin + ' from url ' + url :
    'Failed to load plugin url: ' + url;
};

const displayNotification = function (editor, message) {
  editor.notificationManager.open({
    type: 'error',
    text: message
  });
};

const displayError = function (editor, message) {
  if (editor._skinLoaded) {
    displayNotification(editor, message);
  } else {
    editor.on('SkinLoaded', function () {
      displayNotification(editor, message);
    });
  }
};

const uploadError = function (editor, message) {
  displayError(editor, 'Failed to upload image: ' + message);
};

const pluginLoadError = function (editor, url) {
  displayError(editor, pluginUrlToMessage(editor, url));
};

const initError = function (message, ...x: any[]) {
  const console = window.console;
  if (console) { // Skip test env
    if (console.error) { // tslint:disable-line:no-console
      console.error.apply(console, arguments); // tslint:disable-line:no-console
    } else {
      console.log.apply(console, arguments); // tslint:disable-line:no-console
    }
  }
};

export default {
  pluginLoadError,
  uploadError,
  displayError,
  initError
};