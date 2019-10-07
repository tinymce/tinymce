/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import EditorView from '../EditorView';
import { NotificationManagerImpl } from '../ui/NotificationManagerImpl';
import Editor from './Editor';
import Delay from './util/Delay';

export interface NotificationManagerImpl {
  open (spec: NotificationSpec, closeCallback?: () => void): NotificationApi;
  close <T extends NotificationApi>(notification: T): void;
  reposition <T extends NotificationApi>(notifications: T[]): void;
  getArgs <T extends NotificationApi>(notification: T): NotificationSpec;
}

export interface NotificationSpec {
  type: 'info' | 'warning' | 'error' | 'success';
  text: string;
  icon?: string;
  progressBar?: boolean;
  timeout?: number;
}

export interface NotificationApi {
  close: () => void;
  progressBar: {
    value: (percent: number) => void;
  };
  text: (text: string) => void;
  moveTo: (x: number, y: number) => void;
  moveRel: (element: Element, rel: 'tc-tc' | 'bc-bc' | 'bc-tc' | 'tc-bc' | 'banner') => void;
  getEl: () => Element;
  settings: NotificationSpec;
}

interface NotificationManager {
  open: (spec: NotificationSpec) => NotificationApi;
  close: () => void;
  getNotifications: () => NotificationApi[];
}

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

function NotificationManager(editor: Editor): NotificationManager {
  const notifications: NotificationApi[] = [];

  const getImplementation = function (): NotificationManagerImpl {
    const theme = editor.theme;
    return theme && theme.getNotificationManagerImpl ? theme.getNotificationManagerImpl() : NotificationManagerImpl();
  };

  const getTopNotification = function (): Option<NotificationApi> {
    return Option.from(notifications[0]);
  };

  const isEqual = function (a: NotificationSpec, b: NotificationSpec) {
    return a.type === b.type && a.text === b.text && !a.progressBar && !a.timeout && !b.progressBar && !b.timeout;
  };

  const reposition = function () {
    if (notifications.length > 0) {
      getImplementation().reposition(notifications);
    }
  };

  const addNotification = function (notification: NotificationApi) {
    notifications.push(notification);
  };

  const closeNotification = function (notification: NotificationApi) {
    Arr.findIndex(notifications, function (otherNotification) {
      return otherNotification === notification;
    }).each(function (index) {
      // Mutate here since third party might have stored away the window array
      // TODO: Consider breaking this api
      notifications.splice(index, 1);
    });
  };

  const open = function (spec: NotificationSpec) {
    // Never open notification if editor has been removed.
    if (editor.removed || !EditorView.isEditorAttachedToDom(editor)) {
      return;
    }

    return Arr.find(notifications, function (notification) {
      return isEqual(getImplementation().getArgs(notification), spec);
    }).getOrThunk(function () {
      editor.editorManager.setActive(editor);

      const notification = getImplementation().open(spec, function () {
        closeNotification(notification);
        reposition();
      });

      addNotification(notification);
      reposition();
      return notification;
    });
  };

  const close = function () {
    getTopNotification().each(function (notification) {
      getImplementation().close(notification);
      closeNotification(notification);
      reposition();
    });
  };

  const getNotifications = function (): NotificationApi[] {
    return notifications;
  };

  const registerEvents = function (editor: Editor) {
    editor.on('SkinLoaded', function () {
      const serviceMessage = editor.settings.service_message;

      if (serviceMessage) {
        open({
          text: serviceMessage,
          type: 'warning',
          timeout: 0,
        });
      }
    });

    // NodeChange is needed for inline mode and autoresize as the positioning is done
    // from the bottom up, which changes when the content in the editor changes.
    editor.on('ResizeEditor ResizeWindow NodeChange', function () {
      Delay.requestAnimationFrame(reposition);
    });

    editor.on('remove', function () {
      Arr.each(notifications.slice(), function (notification) {
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
    open,

    /**
     * Closes the top most notification.
     *
     * @method close
     */
    close,

    /**
     * Returns the currently opened notification objects.
     *
     * @method getNotifications
     * @return {Array} Array of the currently opened notifications.
     */
    getNotifications
  };
}

export default NotificationManager;
