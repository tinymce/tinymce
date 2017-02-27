/**
 * NotificationDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.themes.modern.demo.NotificationDemo',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.EditorManager',
    'tinymce.themes.modern.Theme'
  ],
  function (Arr, EditorManager, ModernTheme) {
    ModernTheme();

    var notifyShort = function (type) {
      var notification = EditorManager.activeEditor.notificationManager.open({
        type: type,
        text: 'Short text message'
      });
      console.log(notification);
    };

    var notifyLong = function (len) {
      var longTextMessage = [];

      for (var i = 0; i < len; i++) {
        longTextMessage.push('bla');
      }

      var notification = EditorManager.activeEditor.notificationManager.open({
        text: longTextMessage.join(' ')
      });
      console.log(notification);
    };

    var notifyProgress = function (percent) {
      var notification = EditorManager.activeEditor.notificationManager.open({
        text: 'Progress text',
        progressBar: true
      });

      notification.progressBar.value(percent);
      console.log(notification);
    };

    var notifyTimeout = function (time) {
      var notification = EditorManager.activeEditor.notificationManager.open({
        text: 'Timeout: ' + time,
        timeout: time
      });
      console.log(notification);
    };

    var notifyIcon = function () {
      var notification = EditorManager.activeEditor.notificationManager.open({
        text: 'Text',
        icon: 'bold'
      });
      console.log(notification);
    };

    Arr.each([
      { title: 'notifyShort', action: notifyShort },
      { title: 'notifyLong', action: notifyLong, value: 100 },
      { title: 'notifyProgress', action: notifyProgress, value: 50 },
      { title: 'notifyTimeout', action: notifyTimeout, value: 3000 },
      { title: 'notifyIcon', action: notifyIcon }
    ], function (notification) {
      var btn = document.createElement('button');
      btn.innerHTML = notification.title;
      btn.onclick = function () {
        notification.action(notification.value);
      };
      document.querySelector('#ephox-ui').appendChild(btn);
    });

    EditorManager.init({
      selector: 'textarea.tinymce',
      skin_url: '../../../../../skins/lightgray/dist/lightgray',
      codesample_content_css: '../../../../../plugins/codesample/dist/codesample/css/prism.css'
    });

    return function () {
    };
  }
);
