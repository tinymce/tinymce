import type { Optional } from '@ephox/katamari';

import type * as Behaviour from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { AlloySpec } from '../../api/component/SpecTypes';
import type { WrappedApiFunc } from '../common/Behaviour';
import type { BehaviourState } from '../common/BehaviourState';

export type BlockFn = (
  component: AlloyComponent,
  config: BlockingConfig,
  state: BlockingState,
  getBusySpec: (root: AlloyComponent, behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec
) => void;

export type UnblockFn = (component: AlloyComponent, config: BlockingConfig, state: BlockingState) => void;

export interface BlockingConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly getRoot?: (component: AlloyComponent) => Optional<AlloyComponent>;
  readonly focus?: boolean;
  readonly onBlock?: (component: AlloyComponent) => void;
  readonly onUnblock?: (component: AlloyComponent) => void;
}

export interface BlockingConfig extends Behaviour.BehaviourConfigDetail {
  readonly getRoot: (component: AlloyComponent) => Optional<AlloyComponent>;
  readonly focus: boolean;
  readonly onBlock: (component: AlloyComponent) => void;
  readonly onUnblock: (component: AlloyComponent) => void;
}

export interface BlockingState extends BehaviourState {
  // We don't actually store the blocker, just a callback to delete it
  readonly blockWith: (destroy: () => void) => void;
  readonly clear: () => void;
  readonly isBlocked: () => boolean;
}

export interface BlockingBehaviour extends Behaviour.AlloyBehaviour<BlockingConfigSpec, BlockingConfig, BlockingState> {
  readonly block: WrappedApiFunc<BlockFn>;
  readonly unblock: WrappedApiFunc<UnblockFn>;
  readonly isBlocked: (component: AlloyComponent) => boolean;
}
