/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment, Channels, Gui, SystemEvents } from '@ephox/alloy';
import { MouseEvent, Node as DomNode, ShadowRoot, UIEvent } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Compare, Document, DomEvent, Element, EventArgs, ShadowDom } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor, mothership: Gui.GuiSystem, uiMothership: Gui.GuiSystem): void => {

  const doc = Document.getDocument();

  const referenceElement = Element.fromDom(editor.getElement());

  /*
    If we're in an *open* shadow root, we can use composedPath to find the real target, so we can continue to use
    event delegation up to the document. This lets us capture events outside the shadow root that affect us.

    If we're in a *closed* shadow root, then composedPath isn't available to us. As such, our best bet is to attach
    these listeners to the shadow root itself, and add an extra listener to the document.
   */

  const root = ShadowDom.getRootNode(referenceElement);

  const eventRoot = ShadowDom.isShadowRoot(root) && ShadowDom.isClosed(root) ? root : doc;

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

  const fireDismissPopups = (evt: EventArgs) => {
    broadcastOn(Channels.dismissPopups(), { target: evt.target() });
  };

  // Document touch events
  const onTouchstart = DomEvent.bind(eventRoot, 'touchstart', fireDismissPopups);
  const onTouchmove = DomEvent.bind(eventRoot, 'touchmove', (evt) => broadcastEvent(SystemEvents.documentTouchmove(), evt));
  const onTouchend = DomEvent.bind(eventRoot, 'touchend', (evt) => broadcastEvent(SystemEvents.documentTouchend(), evt));

  // Document mouse events
  const onMousedown = DomEvent.bind(eventRoot, 'mousedown', fireDismissPopups);
  const onMouseup = DomEvent.bind(eventRoot, 'mouseup', (evt) => {
    if (evt.raw().button === 0) {
      broadcastOn(Channels.mouseReleased(), { target: evt.target() });
    }
  });

  const fireDismissPopupsOutsideShadowHost = (sr: Element<ShadowRoot>) => (evt: EventArgs) => {
    /*
    Dismiss popups if mousedown happens outside of the shadow host.
    This is used for closed shadow roots.
    There might be cases of nested shadow roots where this doesn't work.
    */
    if (!Compare.eq(evt.target(), ShadowDom.getShadowHost(sr))) {
      fireDismissPopups(evt);
    }
  };

  const extraUnbinders = ShadowDom.isShadowRoot(root) && ShadowDom.isClosed(root) ? [
    DomEvent.bind(doc, 'touchstart', fireDismissPopupsOutsideShadowHost(root)),
    DomEvent.bind(doc, 'mousedown', fireDismissPopupsOutsideShadowHost(root))
  ] : [];

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

    Arr.each(extraUnbinders, (ub) => {
      ub.unbind();
    });
  });

  editor.on('detach', () => {
    Attachment.detachSystem(mothership);
    Attachment.detachSystem(uiMothership);
    mothership.destroy();
    uiMothership.destroy();
  });
};

export { setup };
