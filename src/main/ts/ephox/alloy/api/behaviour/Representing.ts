import * as Behaviour from './Behaviour';
import * as ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import * as RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import * as RepresentState from '../../behaviour/representing/RepresentState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Result } from '@ephox/katamari';



// The self-reference is clumsy.
const Representing = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom (component: AlloyComponent, source: AlloyComponent) {
      const value = Representing.getValue(source);
      Representing.setValue(component, value);
    }
  },
  state: RepresentState
}) as RepresentingBehaviour;

export {
  Representing
};