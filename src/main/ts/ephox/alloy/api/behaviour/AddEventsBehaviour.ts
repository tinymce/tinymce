import * as Behaviour from './Behaviour';
import * as AlloyEvents from '../events/AlloyEvents';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { AlloyBehaviour } from 'ephox/alloy/alien/TypeDefinitions';

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

const config = function (name: string, eventHandlers: [{key: string, value: number}]) {
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