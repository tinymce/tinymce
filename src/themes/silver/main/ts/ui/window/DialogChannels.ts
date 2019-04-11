/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id } from '@ephox/katamari';

const dialogChannel = Id.generate('update-dialog');
const titleChannel = Id.generate('update-title');
const bodyChannel = Id.generate('update-body');
const footerChannel = Id.generate('update-footer');
const bodySendMessageChannel = Id.generate('body-send-message');

export {
  dialogChannel,
  titleChannel,
  bodyChannel,
  bodySendMessageChannel,
  footerChannel
};