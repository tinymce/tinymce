/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Channels, Attachment, SystemEvents } from '@ephox/alloy';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { DomEvent, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor, mothership, uiMothership) => {

  const dismissPopup = (target: Element) => {
    Arr.each([ mothership, uiMothership ], function (ship) {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target
      });
    });
  };

  const onTouchend = DomEvent.bind(Element.fromDom(document), 'touchend', function (evt) {
    dismissPopup(evt.target());
  });

  const onMouseup = DomEvent.bind(Element.fromDom(document), 'mouseup', function (evt) {
    dismissPopup(evt.target());

    if (evt.raw().button === 0) {
      Arr.each([ mothership, uiMothership ], function (ship) {
        ship.broadcastOn([ Channels.mouseReleased() ], {
          target: evt.target()
        });
      });
    }
  });

  const onContentTouchend = function (raw) {
    dismissPopup(Element.fromDom(raw.target));
  };
  editor.on('touchend', onContentTouchend);

  const onContentMouseup = function (raw) {
    dismissPopup(Element.fromDom(raw.target));

    if (raw.button === 0) {
      Arr.each([ mothership, uiMothership ], function (ship) {
        ship.broadcastOn([ Channels.mouseReleased() ], {
          target: Element.fromDom(raw.target)
        });
      });
    }
  };
  editor.on('mouseup', onContentMouseup);

  const onWindowScroll = (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(SystemEvents.windowScroll(), evt);
    });
  };
  editor.on('ScrollWindow', onWindowScroll);

  const onWindowResize = (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(SystemEvents.windowResize(), evt);
    });
  };
  editor.on('ResizeWindow', onWindowResize);

  editor.on('remove', () => {
    // We probably don't need these unbinds, but it helps to have them if we move this code out.
    editor.off('touchend', onContentTouchend);
    editor.off('mouseup', onContentMouseup);
    editor.off('ResizeWindow', onWindowResize);
    editor.off('ScrollWindow', onWindowScroll);

    onTouchend.unbind();
    onMouseup.unbind();
  });

  editor.on('detach', () => {
    Attachment.detachSystem(mothership);
    Attachment.detachSystem(uiMothership);
    mothership.destroy();
    uiMothership.destroy();
  });
};

export default { setup };