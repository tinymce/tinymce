
import { EventHandlerConfig, derive, EventHandlerConfigRecord } from '../events/AlloyEvents';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { create as createBehaviour, noState, ConfiguredBehaviour, AlloyBehaviour, NamedConfiguredBehaviour } from './Behaviour';

const events = function (name, eventHandlers): AlloyBehaviour {
  const events: EventHandlerConfigRecord = derive(eventHandlers);

  return createBehaviour({
    fields: [
      FieldSchema.strict('enabled')
    ],
    name,
    active: {
      events: Fun.constant(events)
    }
  });
};

const config = function (name: string, eventHandlers: EventHandlerConfig[]): NamedConfiguredBehaviour {
  const me = events(name, eventHandlers);
  return {
    key: name,
    value: {
      config: { },
      me,
      configAsRaw: Fun.constant({ }),
      initialConfig: { },
      state: noState()
    }
  };
};

export {
  events,
  config
};