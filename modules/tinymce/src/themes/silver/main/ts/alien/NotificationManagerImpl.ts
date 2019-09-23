/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Gui, GuiFactory, InlineView, Layout, LayoutInside, NodeAnchorSpec } from '@ephox/alloy';
import { Element as DomElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Body, Element } from '@ephox/sugar';

import { Notification } from '../ui/general/Notification';
import { UiFactoryBackstage } from '../backstage/Backstage';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { NotificationManagerImpl, NotificationSpec, NotificationApi } from 'tinymce/core/api/NotificationManager';

export default function (editor: Editor, extras, uiMothership: Gui.GuiSystem): NotificationManagerImpl {
  const backstage: UiFactoryBackstage = extras.backstage;

  const getLayoutDirection = (rel: 'tc-tc' | 'bc-bc' | 'bc-tc' | 'tc-bc') => {
    switch (rel) {
      case 'bc-bc':
        return LayoutInside.south;
      case 'tc-tc':
        return LayoutInside.north;
      case 'tc-bc':
        return Layout.north;
      case 'bc-tc':
      default:
        return Layout.south;
    }
  };

  // Since the viewport will change based on the present notifications, we need to move them all to the
  // top left of the viewport to give an accurate size measurement so we can position them later.
  const prePositionNotifications = (notifications: NotificationApi[]) => {
    Arr.each(notifications, (notification) => notification.moveTo(0, 0));
  };

  const positionNotifications = (notifications: NotificationApi[]) => {
    if (notifications.length > 0) {
      Arr.head(notifications).each((firstItem) => firstItem.moveRel(null, 'banner'));
      Arr.each(notifications, (notification, index) => {
        if (index > 0) {
          notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
        }
      });
    }
  };

  const reposition = (notifications: NotificationApi[]) => {
    prePositionNotifications(notifications);
    positionNotifications(notifications);
  };

  const open = function (settings: NotificationSpec, closeCallback: () => void): NotificationApi {
    const close = () => {
      closeCallback();
      InlineView.hide(notificationWrapper);
    };

    const notification = GuiFactory.build(
      Notification.sketch({
        text: settings.text,
        level: Arr.contains(['success', 'error', 'warning', 'warn', 'info'], settings.type) ? settings.type : undefined,
        progress: settings.progressBar === true,
        icon: Option.from(settings.icon),
        onAction: close,
        iconProvider: backstage.shared.providers.icons,
        translationProvider: backstage.shared.providers.translate
      })
    );

    const notificationWrapper = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-notifications-container' ]
        },
        lazySink: extras.backstage.shared.getSink,
        fireDismissalEventInstead: { }
      })
    );

    uiMothership.add(notificationWrapper);

    if (settings.timeout > 0) {
      Delay.setTimeout(() => {
        close();
      }, settings.timeout);
    }

    return {
      close,
      moveTo: (x: number, y: number) => {
        InlineView.showAt(notificationWrapper, {
          anchor: 'makeshift',
          x,
          y
        }, GuiFactory.premade(notification));
      },
      moveRel: (element: DomElement, rel: 'tc-tc' | 'bc-bc' | 'bc-tc' | 'tc-bc' | 'banner') => {
        if (rel !== 'banner') {
          const layoutDirection = getLayoutDirection(rel);
          const nodeAnchor: NodeAnchorSpec = {
            anchor: 'node',
            root: Body.body(),
            node: Option.some(Element.fromDom(element)),
            layouts: {
              onRtl: () => [ layoutDirection ],
              onLtr: () => [ layoutDirection ]
            }
          };
          InlineView.showAt(notificationWrapper, nodeAnchor, GuiFactory.premade(notification));
        } else {
          InlineView.showAt(notificationWrapper, extras.backstage.shared.anchors.banner(), GuiFactory.premade(notification));
        }
      },
      text: (nuText: string) => {
        // check if component is still mounted
        Notification.updateText(notification, nuText);
      },
      settings,
      getEl: () => notification.element().dom(),
      progressBar: {
        value: (percent: number) => {
          Notification.updateProgress(notification, percent);
        }
      }
    };
  };

  const close = function (notification: NotificationApi) {
    notification.close();
  };

  const getArgs = function (notification: NotificationApi) {
    return notification.settings;
  };

  return {
    open,
    close,
    reposition,
    getArgs
  };
}
