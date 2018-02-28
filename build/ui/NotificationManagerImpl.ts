/**
 * NotificationManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import DomUtils from './DomUtils';
import Notification from './Notification';

export default function (editor) {
  const getEditorContainer = function (editor) {
    return editor.inline ? editor.getElement() : editor.getContentAreaContainer();
  };

  const getContainerWidth = function () {
    const container = getEditorContainer(editor);
    return DomUtils.getSize(container).width;
  };

  // Since the viewport will change based on the present notifications, we need to move them all to the
  // top left of the viewport to give an accurate size measurement so we can position them later.
  const prePositionNotifications = function (notifications) {
    Arr.each(notifications, function (notification) {
      notification.moveTo(0, 0);
    });
  };

  const positionNotifications = function (notifications) {
    if (notifications.length > 0) {
      const firstItem = notifications.slice(0, 1)[0];
      const container = getEditorContainer(editor);
      firstItem.moveRel(container, 'tc-tc');
      Arr.each(notifications, function (notification, index) {
        if (index > 0) {
          notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
        }
      });
    }
  };

  const reposition = function (notifications) {
    prePositionNotifications(notifications);
    positionNotifications(notifications);
  };

  const open = function (args, closeCallback) {
    const extendedArgs = Tools.extend(args, { maxWidth: getContainerWidth() });
    const notif = new Notification(extendedArgs);
    notif.args = extendedArgs;

    // If we have a timeout value
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

  const close = function (notification) {
    notification.close();
  };

  const getArgs = function (notification) {
    return notification.args;
  };

  return {
    open,
    close,
    reposition,
    getArgs
  };
}