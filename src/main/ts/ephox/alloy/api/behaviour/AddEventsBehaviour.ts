import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { NoState } from '../../behaviour/common/BehaviourState';
import { EventFormat } from '../../events/SimulatedEvent';
import { AlloyEventKeyAndHandler, AlloyEventRecord, derive } from '../events/AlloyEvents';
import { AlloyBehaviour, create as createBehaviour, NamedConfiguredBehaviour } from './Behaviour';

const events = (name: string, eventHandlers: Array<AlloyEventKeyAndHandler<EventFormat>>): AlloyBehaviour<any, any> => {
  const events: AlloyEventRecord = derive(eventHandlers);

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

const config = (name: string, eventHandlers: Array<AlloyEventKeyAndHandler<EventFormat>>): NamedConfiguredBehaviour<any, any> => {
  const me = events(name, eventHandlers);
  return {
    key: name,
    value: {
      config: { },
      me,
      configAsRaw: Fun.constant({ }),
      initialConfig: { },
      state: NoState
    }
  };
};

export {
  events,
  config
};