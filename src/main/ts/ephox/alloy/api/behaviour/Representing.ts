import Behaviour from './Behaviour';
import ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import RepresentState from '../../behaviour/representing/RepresentState';

// The self-reference is clumsy.
var me = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom: function (component, source) {
      var value = me.getValue(source);
      me.setValue(component, value);
    }
  },
  state: RepresentState
});

export default <any> me;