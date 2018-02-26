import Behaviour from './Behaviour';
import ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import RepresentState from '../../behaviour/representing/RepresentState';

// The self-reference is clumsy.
const me = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom (component, source) {
      const value = me.getValue(source);
      me.setValue(component, value);
    }
  },
  state: RepresentState
});

export default <any> me;