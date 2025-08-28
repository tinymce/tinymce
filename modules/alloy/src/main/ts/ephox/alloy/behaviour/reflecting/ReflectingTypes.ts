import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../common/BehaviourState';

export interface ReflectingBehaviour<I, S> extends Behaviour.AlloyBehaviour<ReflectingConfigSpec<I, S>, ReflectingConfig<I, S>> {
  config: (config: ReflectingConfigSpec<I, S>) => Behaviour.NamedConfiguredBehaviour<ReflectingConfigSpec<I, S>, ReflectingConfig<I, S>>;
  getState: (comp: AlloyComponent) => ReflectingState<S>;
}

export interface ReflectingConfigSpec<I, S> extends Behaviour.BehaviourConfigSpec {
  channel: string;
  renderComponents?: (data: I, state: Optional<S>) => AlloySpec[ ];
  updateState?: (comp: AlloyComponent, data: I) => Optional<S>;
  initialData?: I;
  reuseDom?: boolean;
}

export interface ReflectingState<S> extends BehaviourState {
  get: () => Optional<S>;
  set: (optS: Optional<S>) => void;
  clear: () => void;
}

export interface ReflectingConfig<I, S> extends Behaviour.BehaviourConfigDetail {
  channel: string;
  renderComponents: Optional<(data: I, state: Optional<S>) => AlloySpec[ ]>;
  updateState: Optional<(comp: AlloyComponent, data: I) => Optional<S>>;
  initialData: Optional<any>;
  reuseDom: boolean;
}
