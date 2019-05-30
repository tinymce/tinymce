import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { NoState } from '../../behaviour/common/BehaviourState';
import { AlloyEventKeyAndHandler, AlloyEventRecord, derive } from '../events/AlloyEvents';
import { AlloyBehaviour, create as createBehaviour, NamedConfiguredBehaviour } from './Behaviour';

// AlloyEventKeyAndHandler type argument needs to be any here to satisfy an array of handlers
// where each item can be any subtype of EventFormat we can't use <T extends EventFormat> since
// then each item would have to be the same type
const events = (name: string, eventHandlers: Array<AlloyEventKeyAndHandler<any>>): AlloyBehaviour<any, any> => {
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

const config = (name: string, eventHandlers: Array<AlloyEventKeyAndHandler<any>>): NamedConfiguredBehaviour<any, any> => {
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