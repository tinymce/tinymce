/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';
import * as EditorView from '../EditorView';
import { NotificationManagerImpl } from '../ui/NotificationManagerImpl';
import Editor from './Editor';
import * as Settings from './Settings';
import Delay from './util/Delay';

export interface NotificationManagerImpl {
  open: (spec: NotificationSpec, closeCallback?: () => void) => NotificationApi;
  close: <T extends NotificationApi>(notification: T) => void;
  reposition: <T extends NotificationApi>(notifications: T[]) => void;
  getArgs: <T extends NotificationApi>(notification: T) => NotificationSpec;
}

export interface NotificationSpec {
  type?: 'info' | 'warning' | 'error' | 'success';
  text: string;
  icon?: string;
  progressBar?: boolean;
  timeout?: number;
  closeButton?: boolean;
}

export interface NotificationApi {
  close: () => void;
  progressBar: {
    value: (percent: number) => void;
  };
  text: (text: string) => void;
  moveTo: (x: number, y: number) => void;
  moveRel: (element: Element, rel: 'tc-tc' | 'bc-bc' | 'bc-tc' | 'tc-bc' | 'banner') => void;
  getEl: () => HTMLElement;
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

const NotificationManager = (editor: Editor): NotificationManager => {
  const notifications: NotificationApi[] = [];

  const getImplementation = (): NotificationManagerImpl => {
    const theme = editor.theme;
    return theme && theme.getNotificationManagerImpl ? theme.getNotificationManagerImpl() : NotificationManagerImpl();
  };

  const getTopNotification = (): Optional<NotificationApi> => {
    return Optional.from(notifications[0]);
  };

  const isEqual = (a: NotificationSpec, b: NotificationSpec) => {
    return a.type === b.type && a.text === b.text && !a.progressBar && !a.timeout && !b.progressBar && !b.timeout;
  };

  const reposition = () => {
    if (notifications.length > 0) {
      getImplementation().reposition(notifications);
    }
  };

  const addNotification = (notification: NotificationApi) => {
    notifications.push(notification);
  };

  const closeNotification = (notification: NotificationApi) => {
    Arr.findIndex(notifications, (otherNotification) => {
      return otherNotification === notification;
    }).each((index) => {
      // Mutate here since third party might have stored away the window array
      // TODO: Consider breaking this api
      notifications.splice(index, 1);
    });
  };

  const open = (spec: NotificationSpec, fireEvent: boolean = true) => {
    // Never open notification if editor has been removed.
    if (editor.removed || !EditorView.isEditorAttachedToDom(editor)) {
      return;
    }

    // fire event to allow notification spec to be mutated before display
    if (fireEvent) {
      editor.fire('BeforeOpenNotification', { notification: spec });
    }

    return Arr.find(notifications, (notification) => {
      return isEqual(getImplementation().getArgs(notification), spec);
    }).getOrThunk(() => {
      editor.editorManager.setActive(editor);

      const notification = getImplementation().open(spec, () => {
        closeNotification(notification);
        reposition();
        // Move focus back to editor when the last notification is closed,
        // otherwise focus the top notification
        getTopNotification().fold(
          () => editor.focus(),
          (top) => Focus.focus(SugarElement.fromDom(top.getEl()))
        );
      });

      addNotification(notification);
      reposition();

      // Ensure notification is not passed by reference to prevent mutation
      editor.fire('OpenNotification', { ...notification });
      return notification;
    });
  };

  const close = () => {
    getTopNotification().each((notification) => {
      getImplementation().close(notification);
      closeNotification(notification);
      reposition();
    });
  };

  const getNotifications = (): NotificationApi[] => {
    return notifications;
  };

  const registerEvents = (editor: Editor) => {
    editor.on('SkinLoaded', () => {
      const serviceMessage = Settings.getServiceMessage(editor);

      if (serviceMessage) {
        // Ensure we pass false for fireEvent so that service message cannot be altered.
        open({
          text: serviceMessage,
          type: 'warning',
          timeout: 0
        }, false);
      }
    });

    // NodeChange is needed for inline mode and autoresize as the positioning is done
    // from the bottom up, which changes when the content in the editor changes.
    editor.on('ResizeEditor ResizeWindow NodeChange', () => {
      Delay.requestAnimationFrame(reposition);
    });

    editor.on('remove', () => {
      Arr.each(notifications.slice(), (notification) => {
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
     * @param {Object} args A <code>name: value</code> collection containing settings such as: <code>timeout</code>, <code>type</code>, and message (<code>text</code>).
     * <br /><br />
     * For information on the available settings, see: <a href="https://www.tiny.cloud/docs/advanced/creating-custom-notifications/">Create custom notifications</a>.
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
};

export default NotificationManager;
