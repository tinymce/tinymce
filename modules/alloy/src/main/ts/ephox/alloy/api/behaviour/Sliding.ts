import * as ActiveSliding from '../../behaviour/sliding/ActiveSliding';
import * as SlidingApis from '../../behaviour/sliding/SlidingApis';
import SlidingSchema from '../../behaviour/sliding/SlidingSchema';
import * as SlidingState from '../../behaviour/sliding/SlidingState';
import { SlidingBehaviour } from '../../behaviour/sliding/SlidingTypes';
import * as Behaviour from './Behaviour';

const Sliding: SlidingBehaviour = Behaviour.create({
  fields: SlidingSchema,
  name: 'sliding',
  active: ActiveSliding,
  apis: SlidingApis,
  state: SlidingState
});

export {
  Sliding
};
