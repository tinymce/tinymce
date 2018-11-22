/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Receiving } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import TinyChannels from './TinyChannels';

const format = function (command, update) {
  return Receiving.config({
    channels: Objects.wrap(
      TinyChannels.formatChanged(),
      {
        onReceive (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      }
    )
  });
};

const orientation = function (onReceive) {
  return Receiving.config({
    channels: Objects.wrap(
      TinyChannels.orientationChanged(),
      {
        onReceive
      }
    )
  });
};

const receive = function (channel, onReceive) {
  return {
    key: channel,
    value: {
      onReceive
    }
  };
};

export default {
  format,
  orientation,
  receive
};