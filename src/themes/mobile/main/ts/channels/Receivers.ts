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