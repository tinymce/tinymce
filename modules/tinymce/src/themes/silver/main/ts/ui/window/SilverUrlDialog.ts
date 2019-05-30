/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Receiving, AddEventsBehaviour, AlloyEvents } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { window } from '@ephox/dom-globals';
import { Cell, Obj, Option, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import URI from 'tinymce/core/api/util/URI';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderIframeBody } from './SilverDialogBody';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { getUrlDialogApi } from './SilverUrlDialogInstanceApi';
import { getEventExtras, getHeader, renderModalDialog, WindowExtra } from './SilverDialogCommon';
import {  bodySendMessageChannel } from './DialogChannels';
import { DomEvent, Element, SelectorFind } from '@ephox/sugar';

// A list of supported message actions
const SUPPORTED_MESSAGE_ACTIONS = ['insertContent', 'setContent', 'execCommand', 'close', 'block', 'unblock'];

const isSupportedMessage = (data: any): boolean => {
  return Type.isObject(data) && SUPPORTED_MESSAGE_ACTIONS.indexOf(data.mceAction) !== -1;
};

const isCustomMessage = (data: any): boolean => {
  return !isSupportedMessage(data) && Type.isObject(data) && Obj.has(data, 'mceAction');
};

const handleMessage = (editor: Editor, api: Types.UrlDialog.UrlDialogInstanceApi, data: any) => {
  switch (data.mceAction) {
    case 'insertContent':
      editor.insertContent(data.content);
      break;
    case 'setContent':
      editor.setContent(data.content);
      break;
    case 'execCommand':
      const ui = Type.isBoolean(data.ui) ? data.ui : false;
      editor.execCommand(data.cmd, ui, data.value);
      break;
    case 'close':
      api.close();
      break;
    case 'block':
      api.block(data.message);
      break;
    case 'unblock':
      api.unblock();
      break;
  }
};

const renderUrlDialog = (internalDialog: Types.UrlDialog.UrlDialog, extra: WindowExtra<any>, editor: Editor, backstage: UiFactoryBackstage) => {
  const header = getHeader(internalDialog.title, backstage);
  const body = renderIframeBody(internalDialog);
  const footer = internalDialog.buttons.bind((buttons) => {
    // Don't render a footer if no buttons are specified
    if (buttons.length === 0) {
      return Option.none();
    } else {
      return Option.some(renderModalFooter({ buttons }, backstage.shared.providers));
    }
  });

  const dialogEvents = SilverDialogEvents.initUrlDialog(() => instanceApi, getEventExtras(() => dialog, extra));

  // Add the styles for the modal width/height
  const styles = {
    ...internalDialog.height.fold(() => ({}), (height) => ({ 'height': height + 'px', 'max-height': height + 'px' })),
    ...internalDialog.width.fold(() => ({}), (width) => ({ 'width': width + 'px', 'max-width': width + 'px' })),
  };

  // Default back to using a large sized dialog, if no dimensions are specified
  const classes = internalDialog.width.isNone() && internalDialog.height.isNone() ? [ 'tox-dialog--width-lg' ] : [];

  // Determine the iframe urls domain, so we can target that specifically when sending messages
  const iframeUri = new URI(internalDialog.url, { base_uri: new URI(window.location.href) });
  const iframeDomain = `${iframeUri.protocol}://${iframeUri.host}${iframeUri.port ? ':' + iframeUri.port : ''}`;
  const messageHandlerUnbinder = Cell(Option.none());

  // Setup the behaviours for dealing with messages between the iframe and current window
  const extraBehaviours = [
    AddEventsBehaviour.config('messages', [
      // When the dialog is opened, bind a window message listener for the spec url
      AlloyEvents.runOnAttached(() => {
        const unbind = DomEvent.bind(Element.fromDom(window), 'message', (e) => {
          // Validate that the request came from the correct domain
          if (iframeUri.isSameOrigin(new URI(e.raw().origin))) {
            const data = e.raw().data;

            // Handle the message if it has the 'mceAction' key, otherwise just ignore it
            if (isSupportedMessage(data)) {
              handleMessage(editor, instanceApi, data);
            } else if (isCustomMessage(data)) {
              internalDialog.onMessage(instanceApi, data);
            }
          }
        });
        messageHandlerUnbinder.set(Option.some(unbind));
      }),

      // When the dialog is closed, unbind the window message listener
      AlloyEvents.runOnDetached(() => {
        messageHandlerUnbinder.get().each((unbinder) => unbinder.unbind());
      })
    ]),
    Receiving.config({
      channels: {
        [bodySendMessageChannel]: {
          onReceive: (comp, data) => {
            // Send the message to the iframe via postMessage
            SelectorFind.descendant(comp.element(), 'iframe').each((iframeEle) => {
              const iframeWin = iframeEle.dom().contentWindow;
              iframeWin.postMessage(data, iframeDomain);
            });
          }
        }
      }
    })
  ];

  const spec = {
    header,
    body,
    footer,
    extraClasses: classes,
    extraBehaviours,
    extraStyles: styles
  };

  const dialog = renderModalDialog(spec, internalDialog, dialogEvents, backstage);

  const instanceApi = getUrlDialogApi(dialog);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderUrlDialog
};