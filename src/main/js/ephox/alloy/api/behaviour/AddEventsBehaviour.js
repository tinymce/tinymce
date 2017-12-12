import Behaviour from './Behaviour';
import AlloyEvents from '../events/AlloyEvents';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var events = function (name, eventHandlers) {
  var events = AlloyEvents.derive(eventHandlers);

  return Behaviour.create({
    fields: [
      FieldSchema.strict('enabled')
    ],
    name: name,
    active: {
      events: Fun.constant(events)
    }
  });
};

var config = function (name, eventHandlers) {
  var me = events(name, eventHandlers);

  return {
    key: name,
    value: {
      config: { },
      me: me,
      configAsRaw: Fun.constant({ }),
      initialConfig: { },
      state: Behaviour.noState()
    }
  };
};

export default <any> {
  events: events,
  config: config
};