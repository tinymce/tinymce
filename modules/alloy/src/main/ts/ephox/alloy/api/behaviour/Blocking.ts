import { BlockingApis } from '../../behaviour/blocking/BlockingApis';
import { BlockingState } from '../../behaviour/blocking/BlockingState';
import BlockingSchema, { BlockingConfig, BlockingConfigSpec } from '../../behaviour/blocking/BlockingSchema';
import * as Behaviour from './Behaviour';

// Mark a component as able to be "Blocked" or able to enter a busy state. See
// BlockingSchema and BlockingApis for more details on how to configure this.
export const Blocking = Behaviour.create<BlockingConfigSpec, BlockingConfig, BlockingState, BlockingApis>({
  fields: BlockingSchema,
  name: 'blocking',
  apis: BlockingApis,
  state: BlockingState
});
