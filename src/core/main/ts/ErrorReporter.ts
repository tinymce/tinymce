/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddOnManager } from './api/AddOnManager';
import { window } from '@ephox/dom-globals';
import I18n from './api/util/I18n';

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
    I18n.translate(['Failed to load plugin: {0} from url {1}', plugin, url]) :
    I18n.translate(['Failed to load plugin url: {0}', url]);
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
  displayError(editor, I18n.translate(['Failed to upload image: {0}', message]));
};

const pluginLoadError = function (editor, url) {
  displayError(editor, pluginUrlToMessage(editor, url));
};

const pluginInitError = function (editor, name, err) {
  const message = I18n.translate(['Failed to initialize plugin: {0}', name]);
  initError(message, err);
  displayError(editor, message);
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
  pluginInitError,
  uploadError,
  displayError,
  initError
};