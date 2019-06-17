import { FieldSchema, ValueSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Throttler } from '@ephox/katamari';
import * as StreamingState from './StreamingState';

import * as Fields from '../../data/Fields';
import { StreamingConfig, StreamingState as StreamingStateType, ThrottleStreamingConfig } from './StreamingTypes';

const setup = (streamInfo: StreamingConfig, streamState: StreamingStateType) => {
  const sInfo = streamInfo.stream as ThrottleStreamingConfig;
  const throttler = Throttler.last(streamInfo.onStream, sInfo.delay);
  streamState.setTimer(throttler);

  return (component, simulatedEvent) => {
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