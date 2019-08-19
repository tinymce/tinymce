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
  const onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
    Arr.each([ mothership, uiMothership ], function (ship) {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: evt.target()
      });
    });
  });

  const onTouchstart = DomEvent.bind(Element.fromDom(document), 'touchstart', function (evt) {
    Arr.each([ mothership, uiMothership ], function (ship) {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: evt.target()
      });
    });
  });

  const onMouseup = DomEvent.bind(Element.fromDom(document), 'mouseup', function (evt) {
    if (evt.raw().button === 0) {
      Arr.each([ mothership, uiMothership ], function (ship) {
        ship.broadcastOn([ Channels.mouseReleased() ], {
          target: evt.target()
        });
      });
    }
  });

  const onContentMousedown = function (raw) {
    Arr.each([ mothership, uiMothership ], function (ship) {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: Element.fromDom(raw.target)
      });
    });
  };
  editor.on('mousedown', onContentMousedown);
  editor.on('touchstart', onContentMousedown);

  const onContentMouseup = function (raw) {
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
    editor.off('mousedown', onContentMousedown);
    editor.off('touchstart', onContentMousedown);
    editor.off('mouseup', onContentMouseup);
    editor.off('ResizeWindow', onWindowResize);
    editor.off('ScrollWindow', onWindowScroll);

    onMousedown.unbind();
    onTouchstart.unbind();
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
