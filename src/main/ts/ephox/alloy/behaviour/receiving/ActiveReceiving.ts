import { ValueSchema } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import * as AlloyLogger from '../../log/AlloyLogger';

const chooseChannels = function (channels, message) {
  return message.universal() ? channels : Arr.filter(channels, function (ch) {
    return Arr.contains(message.channels(), ch);
  });
};

const events = function (receiveConfig/*, receiveState */) {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.receive(), function (component, message) {
      const channelMap = receiveConfig.channels();
      const channels = Obj.keys(channelMap);

      const targetChannels = chooseChannels(channels, message);
      Arr.each(targetChannels, function (ch) {
        const channelInfo = channelMap[ch]();
        const channelSchema = channelInfo.schema();
        const data = ValueSchema.asStructOrDie(
          'channel[' + ch + '] data\nReceiver: ' + AlloyLogger.element(component.element()),
          channelSchema, message.data()
        );
        channelInfo.onReceive()(component, data);
      });
    })
  ]);
};

export {
  events
};