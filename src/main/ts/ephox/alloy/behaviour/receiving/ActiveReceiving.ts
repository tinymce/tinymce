import { ValueSchema } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as AlloyLogger from '../../log/AlloyLogger';
import { ReceivingConfig } from '../../behaviour/receiving/ReceivingTypes';
import { EventFormat, ReceivingEvent } from '../../events/SimulatedEvent';
import { AlloyComponent } from '../../api/component/ComponentApi';

const chooseChannels = function (channels, message) {
  return message.universal() ? channels : Arr.filter(channels, function (ch) {
    return Arr.contains(message.channels(), ch);
  });
};

const events = function (receiveConfig: ReceivingConfig/*, receiveState */) {
  return AlloyEvents.derive([
    // FIX: Recieving data.
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), function (component: AlloyComponent, message: any) {
      const channelMap = receiveConfig.channels();
      const channels = Obj.keys(channelMap);

      const targetChannels = chooseChannels(channels, message);
      Arr.each(targetChannels, function (ch) {
        const channelInfo = channelMap[ch]();
        const channelSchema = channelInfo.schema();
        const data = ValueSchema.asStructOrDie(
          'channel[' + ch + '] data\nReceiver: ' + AlloyLogger.element(component.element()),
          // FIX: Recieving event ignores the whole simulated event part.
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