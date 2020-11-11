import { AlloySpec, BehaviourState } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import * as Behaviour from 'src/main/ts/ephox/alloy/api/behaviour/Behaviour';
import { AlloyComponent } from 'src/main/ts/ephox/alloy/api/component/ComponentApi';
import { WrappedApiFunc } from 'src/main/ts/ephox/alloy/behaviour/common/Behaviour';
import { AlloyBehaviour } from 'src/main/ts/ephox/alloy/behaviour/common/BehaviourTypes';

export type BlockFn = (component: AlloyComponent, config: BlockingConfig, state: BlockingState, getBusySpec?: (behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec) => void;
export type UnblockFn = (component: AlloyComponent, config: BlockingConfig, state: BlockingState) => void;

export interface BlockingConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly getRoot?: (component: AlloyComponent) => Optional<AlloyComponent>;
  readonly onBlock?: (component: AlloyComponent) => void;
  readonly onUnblock?: (component: AlloyComponent) => void;
}

export interface BlockingConfig extends Behaviour.BehaviourConfigDetail {
  readonly getRoot: (component: AlloyComponent) => Optional<AlloyComponent>;
  readonly onBlock: (component: AlloyComponent) => void;
  readonly onUnblock: (component: AlloyComponent) => void;
}

export interface BlockingState extends BehaviourState {
  // We don't actually store the blocker, just a callback to delete it
  readonly setBlocker: (destroy: () => void) => void;
  readonly clearBlocker: () => void;
  readonly getBlocked: () => boolean;
  readonly setBlocked: (blocked: boolean) => void;
}

export interface BlockingBehaviour extends AlloyBehaviour<BlockingConfigSpec, BlockingConfig, BlockingState> {
  readonly block: WrappedApiFunc<BlockFn>;
  readonly unblock: WrappedApiFunc<UnblockFn>;
}
