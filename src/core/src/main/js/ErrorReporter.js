/**
 * ErrorReporter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Various error reporting helper functions.
 *
 * @class tinymce.ErrorReporter
 * @private
 */
define(
  'tinymce.core.ErrorReporter',
  [
    'global!window',
    'tinymce.core.AddOnManager'
  ],
  function (window, AddOnManager) {
    var PluginManager = AddOnManager.PluginManager;

    var resolvePluginName = function (targetUrl, suffix) {
      for (var name in PluginManager.urls) {
        var matchUrl = PluginManager.urls[name] + '/plugin' + suffix + '.js';
        if (matchUrl === targetUrl) {
          return name;
        }
      }

      return null;
    };

    var pluginUrlToMessage = function (editor, url) {
      var plugin = resolvePluginName(url, editor.suffix);
      return plugin ?
        'Failed to load plugin: ' + plugin + ' from url ' + url :
        'Failed to load plugin url: ' + url;
    };

    var displayNotification = function (editor, message) {
      editor.notificationManager.open({
        type: 'error',
        text: message
      });
    };

    var displayError = function (editor, message) {
      if (editor._skinLoaded) {
        displayNotification(editor, message);
      } else {
        editor.on('SkinLoaded', function () {
          displayNotification(editor, message);
        });
      }
    };

    var uploadError = function (editor, message) {
      displayError(editor, 'Failed to upload image: ' + message);
    };

    var pluginLoadError = function (editor, url) {
      displayError(editor, pluginUrlToMessage(editor, url));
    };

    var initError = function (message) {
      var console = window.console;
      if (console && !window.test) { // Skip test env
        if (console.error) {
          console.error.apply(console, arguments);
        } else {
          console.log.apply(console, arguments);
        }
      }
    };

    return {
      pluginLoadError: pluginLoadError,
      uploadError: uploadError,
      displayError: displayError,
      initError: initError
    };
  }
);