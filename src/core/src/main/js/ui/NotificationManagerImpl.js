/**
 * NotificationManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.ui.NotificationManagerImpl',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.ui.DomUtils',
    'tinymce.core.ui.Notification',
    'tinymce.core.util.Tools'
  ],
  function (Arr, DomUtils, Notification, Tools) {
    return function (editor) {
      var getContainerWidth = function () {
        var container = editor.inline ? editor.getElement() : editor.getContentAreaContainer();
        return DomUtils.getSize(container).width;
      };

      var getEditorContainer = function (editor) {
        return editor.inline ? editor.getElement() : editor.getContentAreaContainer();
      };

      // Since the viewport will change based on the present notifications, we need to move them all to the
      // top left of the viewport to give an accurate size measurement so we can position them later.
      var prePositionNotifications = function (notifications) {
        for (var i = 0; i < notifications.length; i++) {
          notifications[i].moveTo(0, 0);
        }
      };

      var positionNotifications = function (notifications) {
        if (notifications.length > 0) {
          var firstItem = notifications.slice(0, 1)[0];
          var container = getEditorContainer(editor);
          firstItem.moveRel(container, 'tc-tc');
          if (notifications.length > 1) {
            for (var i = 1; i < notifications.length; i++) {
              notifications[i].moveRel(notifications[i - 1].getEl(), 'bc-tc');
            }
          }
        }
      };

      var reposition = function (notifications) {
        prePositionNotifications(notifications);
        positionNotifications(notifications);
      };

      var open = function (args, closeCallback) {
        var notif;

        editor.editorManager.setActive(editor);

        args = Tools.extend(args, { maxWidth: getContainerWidth() });

        notif = new Notification(args);
        notif.args = args;

        //If we have a timeout value
        if (args.timeout > 0) {
          notif.timer = setTimeout(function () {
            notif.close();
            closeCallback();
          }, args.timeout);
        }

        notif.on('close', function () {
          closeCallback();
        });

        notif.renderTo();

        return notif;
      };

      var close = function (notification) {
        notification.close();
      };

      var getArgs = function (notification) {
        return notification.args;
      };

      return {
        open: open,
        close: close,
        reposition: reposition,
        getArgs: getArgs
      };
    };
  }
);
