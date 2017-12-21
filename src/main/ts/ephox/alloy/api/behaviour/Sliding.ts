import Behaviour from './Behaviour';
import ActiveSliding from '../../behaviour/sliding/ActiveSliding';
import SlidingApis from '../../behaviour/sliding/SlidingApis';
import SlidingSchema from '../../behaviour/sliding/SlidingSchema';
import SlidingState from '../../behaviour/sliding/SlidingState';



export default <any> Behaviour.create({
  fields: SlidingSchema,
  name: 'sliding',
  active: ActiveSliding,
  apis: SlidingApis,
  state: SlidingState
});