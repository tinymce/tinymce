import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Throttler } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import { EventFormat, SimulatedEvent } from '../../events/SimulatedEvent';
import * as StreamingState from './StreamingState';
import { StreamingConfig, StreamingState as StreamingStateType, ThrottleStreamingConfig } from './StreamingTypes';

const setup = (streamInfo: StreamingConfig, streamState: StreamingStateType) => {
  const sInfo = streamInfo.stream as ThrottleStreamingConfig;
  const throttler = Throttler.last(streamInfo.onStream, sInfo.delay);
  streamState.setTimer(throttler);

  return (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => {
    throttler.throttle(component, simulatedEvent);
    if (sInfo.stopEvent) { simulatedEvent.stop(); }
  };
};

export default [
  FieldSchema.strictOf('stream', ValueSchema.choose(
    'mode',
    {
      throttle: [
        FieldSchema.strict('delay'),
        FieldSchema.defaulted('stopEvent', true),
        Fields.output('streams', {
          setup,
          state: StreamingState.throttle
        })
      ]
    }
  )),
  FieldSchema.defaulted('event', 'input'),
  FieldSchema.option('cancelEvent'),
  Fields.onStrictHandler('onStream')
];
