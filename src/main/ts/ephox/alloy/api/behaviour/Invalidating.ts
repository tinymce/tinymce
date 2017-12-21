import Behaviour from './Behaviour';
import Representing from './Representing';
import ActiveInvalidate from '../../behaviour/invalidating/ActiveInvalidate';
import InvalidateApis from '../../behaviour/invalidating/InvalidateApis';
import InvalidateSchema from '../../behaviour/invalidating/InvalidateSchema';
import { Future } from '@ephox/katamari';



export default <any> Behaviour.create({
  fields: InvalidateSchema,
  name: 'invalidating',
  active: ActiveInvalidate,
  apis: InvalidateApis,

  extra: {
    // Note, this requires representing to be on the validatee
    validation: function (validator) {
      return function (component) {
        var v = Representing.getValue(component);
        return Future.pure(validator(v));
      };
    }
  }
});