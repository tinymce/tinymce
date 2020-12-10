import { Future, Result } from '@ephox/katamari';

import * as ActiveInvalidate from '../../behaviour/invalidating/ActiveInvalidate';
import * as InvalidateApis from '../../behaviour/invalidating/InvalidateApis';
import InvalidateSchema from '../../behaviour/invalidating/InvalidateSchema';
import { InvalidatingBehaviour } from '../../behaviour/invalidating/InvalidateTypes';
import { AlloyComponent } from '../component/ComponentApi';
import * as Behaviour from './Behaviour';
import { Representing } from './Representing';

const Invalidating: InvalidatingBehaviour = Behaviour.create({
  fields: InvalidateSchema,
  name: 'invalidating',
  active: ActiveInvalidate,
  apis: InvalidateApis,

  extra: {
    // Note, this requires representing to be on the validatee
    validation: <T>(validator: (v: string) => Result<T, string>) => {
      return (component: AlloyComponent) => {
        const v = Representing.getValue(component);
        return Future.pure(validator(v));
      };
    }
  }
});

export {
  Invalidating
};
