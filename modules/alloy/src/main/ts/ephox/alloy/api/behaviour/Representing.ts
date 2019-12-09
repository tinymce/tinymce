import { AlloyComponent } from '../../api/component/ComponentApi';
import * as ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import * as RepresentApis from '../../behaviour/representing/RepresentApis';
import { RepresentingBehaviour } from '../../behaviour/representing/RepresentingTypes';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import * as RepresentState from '../../behaviour/representing/RepresentState';
import * as Behaviour from './Behaviour';

// The self-reference is clumsy.
const Representing: RepresentingBehaviour = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom: (component: AlloyComponent, source: AlloyComponent): void => {
      const value = Representing.getValue(source);
      Representing.setValue(component, value);
    }
  },
  state: RepresentState
});

export {
  Representing
};
