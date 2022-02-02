import { StructureSchema } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { ReceivingEvent, ReceivingInternalEvent } from '../../events/SimulatedEvent';
import * as AlloyLogger from '../../log/AlloyLogger';
import { ReceivingConfig } from './ReceivingTypes';

const chooseChannels = (channels: string[], message: ReceivingInternalEvent): string[] =>
  message.universal ? channels : Arr.filter(channels, (ch) => Arr.contains(message.channels, ch));

const events = (receiveConfig: ReceivingConfig): AlloyEvents.AlloyEventRecord =>
  AlloyEvents.derive([
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component, message) => {
      const channelMap = receiveConfig.channels;
      const channels = Obj.keys(channelMap);

      // NOTE: Receiving event ignores the whole simulated event part.
      // TODO: Think about the types for this, or find a better way for this to rely on receiving.
      const receivingData = message as unknown as ReceivingInternalEvent;
      const targetChannels = chooseChannels(channels, receivingData);
      Arr.each(targetChannels, (ch) => {
        const channelInfo = channelMap[ch];
        const channelSchema = channelInfo.schema;
        const data = StructureSchema.asRawOrDie(
          'channel[' + ch + '] data\nReceiver: ' + AlloyLogger.element(component.element),
          channelSchema, receivingData.data
        );
        channelInfo.onReceive(component, data);
      });
    })
  ]);

export {
  events
};
