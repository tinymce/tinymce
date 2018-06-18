import { FieldSchema, ValueSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Throttler } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

const setup = (streamInfo) => {
  const sInfo = streamInfo.stream();
  const throttler = Throttler.last(streamInfo.onStream(), sInfo.delay());

  return (component, simulatedEvent) => {
    throttler.throttle(component, simulatedEvent);
    if (sInfo.stopEvent()) { simulatedEvent.stop(); }
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
          setup
        })
      ]
    }
  )),
  FieldSchema.defaulted('event', 'input'),
  Fields.onStrictHandler('onStream')
];