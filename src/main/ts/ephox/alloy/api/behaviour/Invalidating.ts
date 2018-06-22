import * as Behaviour from './Behaviour';
import { Representing } from './Representing';
import * as ActiveInvalidate from '../../behaviour/invalidating/ActiveInvalidate';
import * as InvalidateApis from '../../behaviour/invalidating/InvalidateApis';
import InvalidateSchema from '../../behaviour/invalidating/InvalidateSchema';
import { Future } from '@ephox/katamari';
import { InvalidatingBehaviour } from '../../behaviour/invalidating/InvalidateTypes';

const Invalidating = Behaviour.create({
  fields: InvalidateSchema,
  name: 'invalidating',
  active: ActiveInvalidate,
  apis: InvalidateApis,

  extra: {
    // Note, this requires representing to be on the validatee
    validation (validator) {
      return (component) => {
        const v = Representing.getValue(component);
        return Future.pure(validator(v));
      };
    }
  }
}) as InvalidatingBehaviour;

export {
  Invalidating
};