import { Boxes, Gui, GuiFactory, InlineView, Layout, MaxHeight, NodeAnchorSpec } from '@ephox/alloy';
import { Arr, Num, Optional, Type } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi, NotificationManagerImpl, NotificationSpec } from 'tinymce/core/api/NotificationManager';
import Delay from 'tinymce/core/api/util/Delay';

import { UiFactoryBackstage } from '../backstage/Backstage';
import { Notification } from '../ui/general/Notification';

interface Extras {
  readonly backstage: UiFactoryBackstage;
}

export default (editor: Editor, extras: Extras, uiMothership: Gui.GuiSystem): NotificationManagerImpl => {
  const sharedBackstage = extras.backstage.shared;

  const getBounds = () => {
    /* Attempt to ensure that the notifications render below the top of the header and between
     * whichever is the larger between the bottom of the content area and the bottom of the viewport
     *
     * Note: This isn't perfect, but we have a plan to fix it now that TinyMCE 6 removed public methods restricting
     * our ability to change anything (TINY-6679).
     *
     * TODO TINY-8128: use docking and associate the notifications together so they update position automatically
     * during UI refresh updates.
     */
    const contentArea = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
    const win = Boxes.win();
    const x = Num.clamp(win.x, contentArea.x, contentArea.right);
    const y = Num.clamp(win.y, contentArea.y, contentArea.bottom);
    const right = Math.max(contentArea.right, win.right);
    const bottom = Math.max(contentArea.bottom, win.bottom);
    return Optional.some(Boxes.bounds(x, y, right - x, bottom - y));
  };

  const open = (settings: NotificationSpec, closeCallback: () => void): NotificationApi => {
    const close = () => {
      closeCallback();
      InlineView.hide(notificationWrapper);
    };

    const notification = GuiFactory.build(
      Notification.sketch({
        text: settings.text,
        level: Arr.contains([ 'success', 'error', 'warning', 'warn', 'info' ], settings.type) ? settings.type : undefined,
        progress: settings.progressBar === true,
        icon: settings.icon,
        closeButton: settings.closeButton,
        onAction: close,
        iconProvider: sharedBackstage.providers.icons,
        translationProvider: sharedBackstage.providers.translate
      })
    );

    const notificationWrapper = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-notifications-container' ]
        },
        lazySink: sharedBackstage.getSink,
        fireDismissalEventInstead: {},
        ...sharedBackstage.header.isPositionedAtTop() ? {} : { fireRepositionEventInstead: {}}
      })
    );

    uiMothership.add(notificationWrapper);

    if (Type.isNumber(settings.timeout) && settings.timeout > 0) {
      Delay.setEditorTimeout(editor, () => {
        close();
      }, settings.timeout);
    }

    const reposition = () => {
      const notificationSpec = GuiFactory.premade(notification);
      const anchorOverrides = {
        maxHeightFunction: MaxHeight.expandable()
      };

      // TODO TINY-8128: This is a hack. This logic only works if called on every notification in order (as NotificationManager.reposition() does).
      const allNotifications = editor.notificationManager.getNotifications();

      if (allNotifications[0] === thisNotification) {
        // first notification goes below the banner element
        const anchor = {
          ...sharedBackstage.anchors.banner(),
          overrides: anchorOverrides
        };
        InlineView.showWithinBounds(notificationWrapper, notificationSpec, { anchor }, getBounds);
      } else {
        // all other notifications go directly below the previous one
        Arr.indexOf(allNotifications, thisNotification).each((idx) => {
          const previousNotification = allNotifications[idx - 1].getEl();

          const nodeAnchor: NodeAnchorSpec = {
            type: 'node',
            root: SugarBody.body(),
            node: Optional.some(SugarElement.fromDom(previousNotification)),
            overrides: anchorOverrides,
            layouts: {
              onRtl: () => [ Layout.south ],
              onLtr: () => [ Layout.south ]
            }
          };
          InlineView.showWithinBounds(notificationWrapper, notificationSpec, { anchor: nodeAnchor }, getBounds);
        });
      }
    };

    const thisNotification = {
      close,
      reposition,
      text: (nuText: string) => {
        // check if component is still mounted
        Notification.updateText(notification, nuText);
      },
      settings,
      getEl: () => notification.element.dom,
      progressBar: {
        value: (percent: number) => {
          Notification.updateProgress(notification, percent);
        }
      }
    };
    return thisNotification;
  };

  const close = (notification: NotificationApi) => {
    notification.close();
  };

  const getArgs = (notification: NotificationApi) => {
    return notification.settings;
  };

  return {
    open,
    close,
    getArgs
  };
};
