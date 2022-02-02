/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Boxes, Gui, GuiFactory, InlineView, Layout, LayoutInset, MaxHeight, NodeAnchorSpec } from '@ephox/alloy';
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

type Location = 'tc-tc' | 'bc-bc' | 'bc-tc' | 'tc-bc';

export default (editor: Editor, extras: Extras, uiMothership: Gui.GuiSystem): NotificationManagerImpl => {
  const sharedBackstage = extras.backstage.shared;

  const getLayoutDirection = (rel: Location) => {
    switch (rel) {
      case 'bc-bc':
        return LayoutInset.south;
      case 'tc-tc':
        return LayoutInset.north;
      case 'tc-bc':
        return Layout.north;
      case 'bc-tc':
      default:
        return Layout.south;
    }
  };

  const reposition = (notifications: NotificationApi[]) => {
    if (notifications.length > 0) {
      Arr.each(notifications, (notification, index) => {
        if (index === 0) {
          notification.moveRel(null, 'banner');
        } else {
          notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
        }
      });
    }
  };

  const open = (settings: NotificationSpec, closeCallback: () => void): NotificationApi => {
    const hideCloseButton = !settings.closeButton && settings.timeout && (settings.timeout > 0 || settings.timeout < 0);

    const close = () => {
      closeCallback();
      InlineView.hide(notificationWrapper);
    };

    const notification = GuiFactory.build(
      Notification.sketch({
        text: settings.text,
        level: Arr.contains([ 'success', 'error', 'warning', 'warn', 'info' ], settings.type) ? settings.type : undefined,
        progress: settings.progressBar === true,
        icon: Optional.from(settings.icon),
        closeButton: !hideCloseButton,
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
        fireDismissalEventInstead: { },
        ...sharedBackstage.header.isPositionedAtTop() ? { } : { fireRepositionEventInstead: { }}
      })
    );

    uiMothership.add(notificationWrapper);

    if (settings.timeout > 0) {
      Delay.setTimeout(() => {
        close();
      }, settings.timeout);
    }

    const getBounds = () => {
      /* Attempt to ensure that the notifications render below the top of the header and between
       * whichever is the larger between the bottom of the content area and the bottom of the viewport
       *
       * Note: This isn't perfect, but without being able to use docking and associate the notifications
       * together due to the `moveTo` and `moveRel` APIs then we're a bit stuck and a proper solution
       * will have to be done in TinyMCE 6.
       */
      const contentArea = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
      const win = Boxes.win();
      const x = Num.clamp(win.x, contentArea.x, contentArea.right);
      const y = Num.clamp(win.y, contentArea.y, contentArea.bottom);
      const right = Math.max(contentArea.right, win.right);
      const bottom = Math.max(contentArea.bottom, win.bottom);
      return Optional.some(Boxes.bounds(x, y, right - x, bottom - y));
    };

    return {
      close,
      moveTo: (x: number, y: number) => {
        InlineView.showAt(notificationWrapper, GuiFactory.premade(notification), {
          anchor: {
            type: 'makeshift',
            x,
            y
          }
        });
      },
      moveRel: (element: HTMLElement | null, rel: Location | 'banner') => {
        const notificationSpec = GuiFactory.premade(notification);
        const anchorOverrides = {
          maxHeightFunction: MaxHeight.expandable()
        };
        if (rel !== 'banner' && Type.isNonNullable(element)) {
          const layoutDirection = getLayoutDirection(rel);
          const nodeAnchor: NodeAnchorSpec = {
            type: 'node',
            root: SugarBody.body(),
            node: Optional.some(SugarElement.fromDom(element)),
            overrides: anchorOverrides,
            layouts: {
              onRtl: () => [ layoutDirection ],
              onLtr: () => [ layoutDirection ]
            }
          };
          InlineView.showWithinBounds(notificationWrapper, notificationSpec, { anchor: nodeAnchor }, getBounds);
        } else {
          const anchor = {
            ...sharedBackstage.anchors.banner(),
            overrides: anchorOverrides
          };
          InlineView.showWithinBounds(notificationWrapper, notificationSpec, { anchor }, getBounds);
        }
      },
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
    reposition,
    getArgs
  };
};
