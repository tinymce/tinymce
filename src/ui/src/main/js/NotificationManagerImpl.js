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
  'tinymce.ui.NotificationManagerImpl',
  [
    'ephox.katamari.api.Arr',
    'global!setTimeout',
    'tinymce.core.util.Tools',
    'tinymce.ui.DomUtils',
    'tinymce.ui.Notification'
  ],
  function (Arr, setTimeout, Tools, DomUtils, Notification) {
    return function (editor) {
      var getEditorContainer = function (editor) {
        return editor.inline ? editor.getElement() : editor.getContentAreaContainer();
      };

      var getContainerWidth = function () {
        var container = getEditorContainer(editor);
        return DomUtils.getSize(container).width;
      };

      // Since the viewport will change based on the present notifications, we need to move them all to the
      // top left of the viewport to give an accurate size measurement so we can position them later.
      var prePositionNotifications = function (notifications) {
        Arr.each(notifications, function (notification) {
          notification.moveTo(0, 0);
        });
      };

      var positionNotifications = function (notifications) {
        if (notifications.length > 0) {
          var firstItem = notifications.slice(0, 1)[0];
          var container = getEditorContainer(editor);
          firstItem.moveRel(container, 'tc-tc');
          Arr.each(notifications, function (notification, index) {
            if (index > 0) {
              notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
            }
          });
        }
      };

      var reposition = function (notifications) {
        prePositionNotifications(notifications);
        positionNotifications(notifications);
      };

      var open = function (args, closeCallback) {
        var extendedArgs = Tools.extend(args, { maxWidth: getContainerWidth() });
        var notif = new Notification(extendedArgs);
        notif.args = extendedArgs;

        //If we have a timeout value
        if (extendedArgs.timeout > 0) {
          notif.timer = setTimeout(function () {
            notif.close();
            closeCallback();
          }, extendedArgs.timeout);
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
