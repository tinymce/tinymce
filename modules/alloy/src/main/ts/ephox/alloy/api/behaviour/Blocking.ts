import * as BlockingApis from '../../behaviour/blocking/BlockingApis';
import * as BlockingState from '../../behaviour/blocking/BlockingState';
import { WrappedApiFunc } from '../../behaviour/common/Behaviour';
import { AlloyBehaviour } from '../../behaviour/common/BehaviourTypes';
import BlockingSchema, { BlockingConfig, BlockingConfigSpec } from '../../behaviour/blocking/BlockingSchema';
import * as Behaviour from './Behaviour';

export interface BlockingBehaviour extends AlloyBehaviour<BlockingConfigSpec, BlockingConfig, BlockingState.BlockingState> {
  block: WrappedApiFunc<BlockingApis.BlockFn>;
  unblock: WrappedApiFunc<BlockingApis.UnblockFn>;
}

// Mark a component as able to be "Blocked" or able to enter a busy state. See
// BlockingSchema and BlockingApis for more details on how to configure this.
export const Blocking: BlockingBehaviour = Behaviour.create({
  fields: BlockingSchema,
  name: 'blocking',
  apis: BlockingApis,
  state: BlockingState
});
