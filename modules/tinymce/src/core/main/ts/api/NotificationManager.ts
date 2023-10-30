import { Arr, Fun, Optional } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

import * as EditorView from '../EditorView';
import * as EditorFocus from '../focus/EditorFocus';
import NotificationManagerImpl from '../ui/NotificationManagerImpl';
import Editor from './Editor';
import * as Options from './Options';

export interface NotificationManagerImpl {
  open: (spec: NotificationSpec, closeCallback: () => void) => NotificationApi;
  close: <T extends NotificationApi>(notification: T) => void;
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
  reposition: () => void;
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
 *   text: 'An error occurred.',
 *   type: 'error'
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
    Arr.each(notifications, (notification) => {
      notification.reposition();
    });
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

  const open = (spec: NotificationSpec, fireEvent: boolean = true): NotificationApi => {
    // Never open notification if editor has been removed.
    if (editor.removed || !EditorView.isEditorAttachedToDom(editor)) {
      return {} as NotificationApi;
    }

    // fire event to allow notification spec to be mutated before display
    if (fireEvent) {
      editor.dispatch('BeforeOpenNotification', { notification: spec });
    }

    return Arr.find(notifications, (notification) => {
      return isEqual(getImplementation().getArgs(notification), spec);
    }).getOrThunk(() => {
      editor.editorManager.setActive(editor);

      const notification = getImplementation().open(spec, () => {
        closeNotification(notification);
        reposition();
        if (EditorFocus.hasEditorOrUiFocus(editor)) {
          // If the editor has focus move focus to the the next notification or the content if there are no more
          getTopNotification().fold(
            () => editor.focus(),
            (top) => Focus.focus(SugarElement.fromDom(top.getEl()))
          );
        }
      });

      addNotification(notification);
      reposition();

      // Ensure notification is not passed by reference to prevent mutation
      editor.dispatch('OpenNotification', { notification: { ...notification }});
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

  const getNotifications = Fun.constant(notifications);

  const registerEvents = (editor: Editor) => {
    editor.on('SkinLoaded', () => {
      const serviceMessage = Options.getServiceMessage(editor);

      if (serviceMessage) {
        // Ensure we pass false for fireEvent so that service message cannot be altered.
        open({
          text: serviceMessage,
          type: 'warning',
          timeout: 0
        }, false);
      }

      // Ensure the notifications are repositioned once the skin has loaded, as otherwise
      // any notifications rendered before then may have wrapped and been in the wrong place
      reposition();
    });

    // NodeChange is needed for inline mode and autoresize as the positioning is done
    // from the bottom up, which changes when the content in the editor changes.
    editor.on('show ResizeEditor ResizeWindow NodeChange', () => {
      requestAnimationFrame(reposition);
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
     * For information on the available settings, see: <a href="https://www.tiny.cloud/docs/tinymce/6/creating-custom-notifications/">Create custom notifications</a>.
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
