import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloySpec } from '../../api/component/SpecTypes';
import { Option } from '@ephox/katamari';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface ReflectingBehaviour<I,S> extends Behaviour.AlloyBehaviour<ReflectingConfigSpec<I,S>, ReflectingConfig<I,S>> {
  config: (config: ReflectingConfigSpec<I,S>) => Behaviour.NamedConfiguredBehaviour<ReflectingConfigSpec<I,S>, ReflectingConfig<I,S>>;
  getState: (comp: AlloyComponent) => ReflectingState<S>;
}

export interface ReflectingConfigSpec<I,S> extends Behaviour.BehaviourConfigSpec {
  channel: string;
  renderComponents?: (data: I, state: Option<S>) => AlloySpec[ ];
  updateState?: (comp: AlloyComponent, data: I) => Option<S>;
  initialData?: I;
}

export interface ReflectingState<S> extends BehaviourState {
  get: () => Option<S>;
  set: (optS: Option<S>) => void;
  clear: () => void;
}

export interface ReflectingConfig<I, S> extends Behaviour.BehaviourConfigDetail {
  channel: string;
  renderComponents: Option<(data: I, state: Option<S>) => AlloySpec[ ]>;
  updateState: Option<(comp: AlloyComponent, data: I) => Option<S>>;
  initialData: Option<any>;
}