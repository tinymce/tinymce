import { Receiving } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import TinyChannels from './TinyChannels';

var format = function (command, update) {
  return Receiving.config({
    channels: Objects.wrap(
      TinyChannels.formatChanged(),
      {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      }
    )
  });
};

var orientation = function (onReceive) {
  return Receiving.config({
    channels: Objects.wrap(
      TinyChannels.orientationChanged(),
      {
        onReceive: onReceive
      }
    )
  });
};

var receive = function (channel, onReceive) {
  return {
    key: channel,
    value: {
      onReceive: onReceive
    }
  };
};

export default <any> {
  format: format,
  orientation: orientation,
  receive: receive
};