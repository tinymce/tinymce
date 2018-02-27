import Behaviour from './Behaviour';
import * as AlloyEvents from '../events/AlloyEvents';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const events = function (name, eventHandlers) {
  const events = AlloyEvents.derive(eventHandlers);

  return Behaviour.create({
    fields: [
      FieldSchema.strict('enabled')
    ],
    name,
    active: {
      events: Fun.constant(events)
    }
  });
};

const config = function (name, eventHandlers) {
  const me = events(name, eventHandlers);

  return {
    key: name,
    value: {
      config: { },
      me,
      configAsRaw: Fun.constant({ }),
      initialConfig: { },
      state: Behaviour.noState()
    }
  };
};

export {
  events,
  config
};