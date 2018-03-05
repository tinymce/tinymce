import * as Behaviour from './Behaviour';
import * as ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import * as RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import * as RepresentState from '../../behaviour/representing/RepresentState';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { FieldProcessorAdt } from '@ephox/boulder';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface RepresentingBehaviour extends AlloyBehaviour {
  config: (RepresentingConfig) => any;
  setValueFrom?: (component: AlloyComponent, source: AlloyComponent) => void;
}

export interface RepresentingConfig extends AlloyBehaviourConfig {
  store: {
    mode: string,
    initialValue: string
  };
}

// The self-reference is clumsy.
const Representing: RepresentingBehaviour = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom (component, source) {
      const value = Representing.getValue(source);
      Representing.setValue(component, value);
    }
  },
  state: RepresentState
});

export {
  Representing
};