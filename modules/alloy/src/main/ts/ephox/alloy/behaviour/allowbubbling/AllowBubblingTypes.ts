import * as Behaviour from '../../api/behaviour/Behaviour';
import { BehaviourCellState } from '../common/BehaviourCellState';

export interface AllowBubblingBehavior extends Behaviour.AlloyBehaviour<AllowBubblingConfigSpec, AllowBubblingConfig> {
  config: (config: AllowBubblingConfigSpec) => Behaviour.NamedConfiguredBehaviour<AllowBubblingConfigSpec, AllowBubblingConfig>;
}

interface EventPair {
  native: string;
  simulated: string;
}

export interface AllowBubblingConfigSpec {
  events: EventPair[];
}

export interface AllowBubblingConfig {
  events: EventPair[];
}

export interface EventUnbinder {
  unbind: () => void;
}

export type AllowBubblingState = BehaviourCellState<EventUnbinder[]>;