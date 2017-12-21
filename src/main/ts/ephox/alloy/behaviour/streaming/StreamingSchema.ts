import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Throttler } from '@ephox/katamari';

var setup = function (streamInfo) {
  var sInfo = streamInfo.stream();
  var throttler = Throttler.last(streamInfo.onStream(), sInfo.delay());

  return function (component, simulatedEvent) {
    throttler.throttle(component, simulatedEvent);
    if (sInfo.stopEvent()) simulatedEvent.stop();
  };
};

export default <any> [
  FieldSchema.strictOf('stream', ValueSchema.choose(
    'mode',
    {
      'throttle': [
        FieldSchema.strict('delay'),
        FieldSchema.defaulted('stopEvent', true),
        Fields.output('streams', {
          setup: setup
        })
      ]
    }
  )),
  FieldSchema.defaulted('event', 'input'),
  Fields.onStrictHandler('onStream')
];