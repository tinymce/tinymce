/**
 * NotificationManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the creation of TinyMCE's notifications.
 *
 * @class tinymce.NotificationManager
 * @example
 * // Opens a new notification of type "error" with text "An error occurred."
 * tinymce.activeEditor.notificationManager.open({
 *    text: 'An error occurred.',
 *    type: 'error'
 * });
 */
define(
  'tinymce.core.api.NotificationManager',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'tinymce.core.EditorView',
    'tinymce.core.ui.NotificationManagerImpl',
    'tinymce.core.util.Delay'
  ],
  function (Arr, Option, EditorView, NotificationManagerImpl, Delay) {
    return function (editor) {
      var notifications = [];

      var getImplementation = function () {
        var theme = editor.theme;
        return theme && theme.getNotificationManagerImpl ? theme.getNotificationManagerImpl() : NotificationManagerImpl();
      };

      var getTopNotification = function () {
        return Option.from(notifications[0]);
      };

      var isEqual = function (a, b) {
        return a.type === b.type && a.text === b.text && !a.progressBar && !a.timeout && !b.progressBar && !b.timeout;
      };

      var reposition = function () {
        if (notifications.length > 0) {
          getImplementation().reposition(notifications);
        }
      };

      var addNotification = function (notification) {
        notifications.push(notification);
      };

      var closeNotification = function (notification) {
        Arr.findIndex(notifications, function (otherNotification) {
          return otherNotification === notification;
        }).each(function (index) {
          // Mutate here since third party might have stored away the window array
          // TODO: Consider breaking this api
          notifications.splice(index, 1);
        });
      };

      var open = function (args) {
        // Never open notification if editor has been removed.
        if (editor.removed || !EditorView.isEditorAttachedToDom(editor)) {
          return;
        }

        return Arr.find(notifications, function (notification) {
          return isEqual(getImplementation().getArgs(notification), args);
        }).getOrThunk(function () {
          editor.editorManager.setActive(editor);

          var notification = getImplementation().open(args, function () {
            closeNotification(notification);
            reposition();
          });

          addNotification(notification);
          reposition();
          return notification;
        });
      };

      var close = function () {
        getTopNotification().each(function (notification) {
          getImplementation().close(notification);
          closeNotification(notification);
          reposition();
        });
      };

      var getNotifications = function () {
        return notifications;
      };

      var registerEvents = function (editor) {
        editor.on('SkinLoaded', function () {
          var serviceMessage = editor.settings.service_message;

          if (serviceMessage) {
            open({
              text: serviceMessage,
              type: 'warning',
              timeout: 0,
              icon: ''
            });
          }
        });

        editor.on('ResizeEditor ResizeWindow', function () {
          Delay.requestAnimationFrame(reposition);
        });

        editor.on('remove', function () {
          Arr.each(notifications, function (notification) {
            getImplementation().close(notification);
          });
        });
      };

      registerEvents(editor);

      return {
        /**
         * Opens a new notification.
         *
         * @method open
         * @param {Object} args Optional name/value settings collection contains things like timeout/color/message etc.
         */
        open: open,

        /**
         * Closes the top most notification.
         *
         * @method close
         */
        close: close,

        /**
         * Returns the currently opened notification objects.
         *
         * @method getNotifications
         * @return {Array} Array of the currently opened notifications.
         */
        getNotifications: getNotifications
      };
    };
  }
);
