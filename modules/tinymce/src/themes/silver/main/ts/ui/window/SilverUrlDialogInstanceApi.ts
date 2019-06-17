/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Type } from '@ephox/katamari';

import { formBlockEvent, formCloseEvent, formUnblockEvent } from '../general/FormEvents';
import { bodySendMessageChannel } from '../window/DialogChannels';

const getUrlDialogApi = (root: AlloyComponent): Types.UrlDialog.UrlDialogInstanceApi => {
  const withRoot = <T>(f: (r: AlloyComponent) => void): void => {
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

  const sendMessage = (data) => {
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