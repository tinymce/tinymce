import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyParts, Receiving, Reflecting } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Id, Obj, Optional, Singleton, Type } from '@ephox/katamari';
import { DomEvent, EventUnbinder, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import URI from 'tinymce/core/api/util/URI';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { bodySendMessageChannel, dialogChannel } from './DialogChannels';
import { renderIframeBody } from './SilverDialogBody';
import * as SilverDialogCommon from './SilverDialogCommon';
import * as SilverDialogEvents from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { getUrlDialogApi } from './SilverUrlDialogInstanceApi';

interface RenderedUrlDialog {
  readonly dialog: AlloyComponent;
  readonly instanceApi: Dialog.UrlDialogInstanceApi;
}

// A list of supported message actions
const SUPPORTED_MESSAGE_ACTIONS = [ 'insertContent', 'setContent', 'execCommand', 'close', 'block', 'unblock' ];

const isSupportedMessage = (data: any): boolean => Type.isObject(data) && SUPPORTED_MESSAGE_ACTIONS.indexOf(data.mceAction) !== -1;

const isCustomMessage = (data: any): boolean => !isSupportedMessage(data) && Type.isObject(data) && Obj.has(data, 'mceAction');

const handleMessage = (editor: Editor, api: Dialog.UrlDialogInstanceApi, data: any) => {
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

const renderUrlDialog = (internalDialog: Dialog.UrlDialog, extra: SilverDialogCommon.SharedWindowExtra, editor: Editor, backstage: UiFactoryBackstage): RenderedUrlDialog => {
  const dialogId = Id.generate('dialog');
  const header = SilverDialogCommon.getHeader(internalDialog.title, dialogId, backstage);
  const body = renderIframeBody(internalDialog);
  const footer = internalDialog.buttons.bind((buttons) => {
    // Don't render a footer if no buttons are specified
    if (buttons.length === 0) {
      return Optional.none<AlloyParts.ConfiguredPart>();
    } else {
      return Optional.some(renderModalFooter({ buttons }, dialogId, backstage));
    }
  });

  const dialogEvents = SilverDialogEvents.initUrlDialog(
    () => instanceApi,
    SilverDialogCommon.getEventExtras(() => dialog, backstage.shared.providers, extra)
  );

  // Add the styles for the modal width/height
  const styles = {
    ...internalDialog.height.fold(() => ({}), (height) => ({ 'height': height + 'px', 'max-height': height + 'px' })),
    ...internalDialog.width.fold(() => ({}), (width) => ({ 'width': width + 'px', 'max-width': width + 'px' }))
  };

  // Default back to using a large sized dialog, if no dimensions are specified
  const classes = internalDialog.width.isNone() && internalDialog.height.isNone() ? [ 'tox-dialog--width-lg' ] : [];

  // Determine the iframe urls domain, so we can target that specifically when sending messages
  const iframeUri = new URI(internalDialog.url, { base_uri: new URI(window.location.href) });
  const iframeDomain = `${iframeUri.protocol}://${iframeUri.host}${iframeUri.port ? ':' + iframeUri.port : ''}`;
  const messageHandlerUnbinder = Singleton.unbindable<EventUnbinder>();

  const updateState = (_comp: AlloyComponent, incoming: Dialog.UrlDialog) => Optional.some(incoming);

  // Setup the behaviours for dealing with messages between the iframe and current window
  const extraBehaviours = [
    // Because this doesn't define `renderComponents`, all this does is update the state.
    // We use the state for the initialData. The other parts (body etc.) render the
    // components based on what reflecting receives.
    Reflecting.config({
      channel: `${dialogChannel}-${dialogId}`,
      updateState,
      initialData: internalDialog
    }),
    AddEventsBehaviour.config('messages', [
      // When the dialog is opened, bind a window message listener for the spec url
      AlloyEvents.runOnAttached(() => {
        const unbind = DomEvent.bind<MessageEvent>(SugarElement.fromDom(window), 'message', (e) => {
          // Validate that the request came from the correct domain
          if (iframeUri.isSameOrigin(new URI(e.raw.origin))) {
            const data = e.raw.data;

            // Handle the message if it has the 'mceAction' key, otherwise just ignore it
            if (isSupportedMessage(data)) {
              handleMessage(editor, instanceApi, data);
            } else if (isCustomMessage(data)) {
              internalDialog.onMessage(instanceApi, data);
            }
          }
        });
        messageHandlerUnbinder.set(unbind);
      }),

      // When the dialog is closed, unbind the window message listener
      AlloyEvents.runOnDetached(messageHandlerUnbinder.clear)
    ]),
    Receiving.config({
      channels: {
        [bodySendMessageChannel]: {
          onReceive: (comp, data) => {
            // Send the message to the iframe via postMessage
            SelectorFind.descendant<HTMLIFrameElement>(comp.element, 'iframe').each((iframeEle) => {
              const iframeWin = iframeEle.dom.contentWindow;
              if (Type.isNonNullable(iframeWin)) {
                iframeWin.postMessage(data, iframeDomain);
              }
            });
          }
        }
      }
    })
  ];

  const spec: SilverDialogCommon.DialogSpec = {
    id: dialogId,
    header,
    body,
    footer,
    extraClasses: classes,
    extraBehaviours,
    extraStyles: styles
  };

  const dialog = SilverDialogCommon.renderModalDialog(spec, dialogEvents, backstage);

  const instanceApi = getUrlDialogApi(dialog);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderUrlDialog
};
