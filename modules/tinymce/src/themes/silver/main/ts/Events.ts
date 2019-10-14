/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment, Channels, Gui, SystemEvents } from '@ephox/alloy';
import { document, MouseEvent, Node as DomNode, UIEvent } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { DomEvent, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor, mothership: Gui.GuiSystem, uiMothership: Gui.GuiSystem) => {
  const onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: evt.target()
      });
    });
  });

  const onTouchstart = DomEvent.bind(Element.fromDom(document), 'touchstart', (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: evt.target()
      });
    });
  });

  const onTouchmove = DomEvent.bind(Element.fromDom(document), 'touchmove', (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(SystemEvents.documentTouchmove(), evt);
    });
  });

  const onTouchend = DomEvent.bind(Element.fromDom(document), 'touchend', (evt) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(SystemEvents.documentTouchend(), evt);
    });
  });

  const onMouseup = DomEvent.bind(Element.fromDom(document), 'mouseup', (evt) => {
    if (evt.raw().button === 0) {
      Arr.each([ mothership, uiMothership ], (ship) => {
        ship.broadcastOn([ Channels.mouseReleased() ], {
          target: evt.target()
        });
      });
    }
  });

  const onContentMousedown = (raw: MouseEvent) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn([ Channels.dismissPopups() ], {
        target: Element.fromDom(raw.target as DomNode)
      });
    });
  };

  const onContentMouseup = (raw: MouseEvent) => {
    if (raw.button === 0) {
      Arr.each([ mothership, uiMothership ], (ship) => {
        ship.broadcastOn([ Channels.mouseReleased() ], {
          target: Element.fromDom(raw.target as DomNode)
        });
      });
    }
  };

  const onWindowScroll = (evt: UIEvent) => {
    const sugarEvent = DomEvent.fromRawEvent(evt);
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(SystemEvents.windowScroll(), sugarEvent);
    });
  };

  const onWindowResize = (evt: UIEvent) => {
    const sugarEvent = DomEvent.fromRawEvent(evt);
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn( [ Channels.repositionPopups() ], { });
      ship.broadcastEvent(SystemEvents.windowResize(), sugarEvent);
    });
  };

  const onEditorResize = () => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn( [ Channels.repositionPopups() ], { });
    });
  };

  // Don't start listening to events until the UI has rendered
  editor.on('PostRender', () => {
    editor.on('mousedown', onContentMousedown);
    editor.on('touchstart', onContentMousedown);
    editor.on('mouseup', onContentMouseup);
    editor.on('ScrollWindow', onWindowScroll);
    editor.on('ResizeWindow', onWindowResize);
    editor.on('ResizeEditor', onEditorResize);
  });

  editor.on('remove', () => {
    // We probably don't need these unbinds, but it helps to have them if we move this code out.
    editor.off('mousedown', onContentMousedown);
    editor.off('touchstart', onContentMousedown);
    editor.off('mouseup', onContentMouseup);
    editor.off('ScrollWindow', onWindowScroll);
    editor.off('ResizeWindow', onWindowResize);
    editor.off('ResizeEditor', onEditorResize);

    onMousedown.unbind();
    onTouchstart.unbind();
    onTouchmove.unbind();
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
