import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloySpec } from '../../api/component/SpecTypes';
import { Option } from '@ephox/katamari';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { AlloyComponent } from '../../api/component/ComponentApi';


export interface ReflectingBehaviour extends Behaviour.AlloyBehaviour<ReflectingConfigSpec, ReflectingConfig> {
  config: (config: ReflectingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReflectingConfigSpec, ReflectingConfig>;
  getState: <S>(comp: AlloyComponent) => ReflectingState<S>;
}

export interface ReflectingConfigSpec extends Behaviour.BehaviourConfigSpec {
  channel: string;
  renderComponents: (data) => AlloySpec[ ];
  initialData?: any;
  prepare?: (comp: AlloyComponent, initial) => any;
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
  prepare: () => (comp: AlloyComponent, initial) => any;
  initialData: () => Option<any>;
}