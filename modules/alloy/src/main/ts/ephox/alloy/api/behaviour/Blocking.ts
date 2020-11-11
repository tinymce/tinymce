import * as BlockingApis from '../../behaviour/blocking/BlockingApis';
import BlockingSchema from '../../behaviour/blocking/BlockingSchema';
import * as BlockingState from '../../behaviour/blocking/BlockingState';
import { BlockingBehaviour } from '../../behaviour/blocking/BlockingTypes';
import * as Behaviour from './Behaviour';

// Mark a component as able to be "Blocked" or able to enter a busy state. See
// BlockingSchema and BlockingApis for more details on how to configure this.
export const Blocking: BlockingBehaviour = Behaviour.create({
  fields: BlockingSchema,
  name: 'blocking',
  apis: BlockingApis,
  state: BlockingState
});
