/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment, Channels, Gui, SystemEvents } from '@ephox/alloy';
import { document, MouseEvent, Node as DomNode, UIEvent } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { DomEvent, Element, EventArgs } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor, mothership: Gui.GuiSystem, uiMothership: Gui.GuiSystem) => {
  const broadcastEvent = (name: string, evt: EventArgs) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastEvent(name, evt);
    });
  };

  const broadcastOn = (channel: string, message: Record<string, any>) => {
    Arr.each([ mothership, uiMothership ], (ship) => {
      ship.broadcastOn([ channel ], message);
    });
  };

  const fireDismissPopups = (evt: EventArgs) => broadcastOn(Channels.dismissPopups(), { target: evt.target() });

  // Document touch events
  const onTouchstart = DomEvent.bind(Element.fromDom(document), 'touchstart', fireDismissPopups);
  const onTouchmove = DomEvent.bind(Element.fromDom(document), 'touchmove', (evt) => broadcastEvent(SystemEvents.documentTouchmove(), evt));
  const onTouchend = DomEvent.bind(Element.fromDom(document), 'touchend', (evt) => broadcastEvent(SystemEvents.documentTouchend(), evt));

  // Document mouse events
  const onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', fireDismissPopups);
  const onMouseup = DomEvent.bind(Element.fromDom(document), 'mouseup', (evt) => {
    if (evt.raw().button === 0) {
      broadcastOn(Channels.mouseReleased(), { target: evt.target() });
    }
  });

  // Editor content events
  const onContentClick = (raw: UIEvent) => broadcastOn(Channels.dismissPopups(), { target: Element.fromDom(raw.target as DomNode) });
  const onContentMouseup = (raw: MouseEvent) => {
    if (raw.button === 0) {
      broadcastOn(Channels.mouseReleased(), { target: Element.fromDom(raw.target as DomNode) });
    }
  };

  // Window events
  const onWindowScroll = (evt: UIEvent) => broadcastEvent(SystemEvents.windowScroll(), DomEvent.fromRawEvent(evt));
  const onWindowResize = (evt: UIEvent) => {
    broadcastOn(Channels.repositionPopups(), { });
    broadcastEvent(SystemEvents.windowResize(), DomEvent.fromRawEvent(evt));
  };

  const onEditorResize = () => broadcastOn(Channels.repositionPopups(), { });

  // Don't start listening to events until the UI has rendered
  editor.on('PostRender', () => {
    editor.on('click', onContentClick);
    editor.on('tap', onContentClick);
    editor.on('mouseup', onContentMouseup);
    editor.on('ScrollWindow', onWindowScroll);
    editor.on('ResizeWindow', onWindowResize);
    editor.on('ResizeEditor', onEditorResize);
  });

  editor.on('remove', () => {
    // We probably don't need these unbinds, but it helps to have them if we move this code out.
    editor.off('click', onContentClick);
    editor.off('tap', onContentClick);
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
