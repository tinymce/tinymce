import { ValueSchema } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { ReceivingEvent } from '../../events/SimulatedEvent';
import * as AlloyLogger from '../../log/AlloyLogger';
import { ReceivingConfig } from './ReceivingTypes';

const chooseChannels = (channels, message) => {
  return message.universal() ? channels : Arr.filter(channels, (ch) => {
    return Arr.contains(message.channels(), ch);
  });
};

const events = (receiveConfig: ReceivingConfig/*, receiveState */) => {
  return AlloyEvents.derive([
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component: AlloyComponent, message: any) => {
      const channelMap = receiveConfig.channels;
      const channels = Obj.keys(channelMap);

      const targetChannels = chooseChannels(channels, message);
      Arr.each(targetChannels, (ch) => {
        const channelInfo = channelMap[ch];
        const channelSchema = channelInfo.schema;
        const data = ValueSchema.asRawOrDie(
          'channel[' + ch + '] data\nReceiver: ' + AlloyLogger.element(component.element()),
          // NOTE: Recieving event ignores the whole simulated event part.
          channelSchema, message.data()
        );
        channelInfo.onReceive(component, data);
      });
    })
  ]);
};

export {
  events
};
