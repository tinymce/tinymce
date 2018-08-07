import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloySpec } from '../../api/component/SpecTypes';
import { Option } from '@ephox/katamari';
import { BehaviourState } from '../../behaviour/common/BehaviourState';


export interface ReflectingBehaviour extends Behaviour.AlloyBehaviour<ReflectingConfigSpec, ReflectingConfig> {
  config: (config: ReflectingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReflectingConfigSpec, ReflectingConfig>;
}

export interface ReflectingConfigSpec extends Behaviour.BehaviourConfigSpec {
  channel: string;
  renderComponents: (data) => AlloySpec[ ];
  prepare?: (initial) => any;
}

export interface ReflectingState<S> extends BehaviourState {
  get: () => Option<S>;
  set: (s: S) => void;
  clear: () => void;
}

export interface ReflectingConfig extends Behaviour.BehaviourConfigDetail {
  // Intentionally Blank
  channel: () => string;
  renderComponents: () => (data) => AlloySpec[];
  prepare: () => (initial) => any;
}