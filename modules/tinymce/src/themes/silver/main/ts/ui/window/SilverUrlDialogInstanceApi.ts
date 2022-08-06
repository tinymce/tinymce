import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Type } from '@ephox/katamari';

import { formBlockEvent, formCloseEvent, formUnblockEvent } from '../general/FormEvents';
import { bodySendMessageChannel } from './DialogChannels';

const getUrlDialogApi = (root: AlloyComponent): Dialog.UrlDialogInstanceApi => {
  const withRoot = (f: (r: AlloyComponent) => void): void => {
    if (root.getSystem().isConnected()) {
      f(root);
    }
  };

  const block = (message: string) => {
    if (!Type.isString(message)) {
      throw new Error('The urlDialogInstanceAPI.block function should be passed a blocking message of type string as an argument');
    }
    withRoot((root) => {
      AlloyTriggers.emitWith(root, formBlockEvent, { message });
    });
  };

  const unblock = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formUnblockEvent);
    });
  };

  const close = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formCloseEvent);
    });
  };

  const sendMessage = (data: any) => {
    withRoot((root) => {
      root.getSystem().broadcastOn([ bodySendMessageChannel ], data);
    });
  };

  return {
    block,
    unblock,
    close,
    sendMessage
  };
};

export {
  getUrlDialogApi
};
