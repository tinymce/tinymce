import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { TransitionRoute } from '../../behaviour/transitioning/TransitionApis';

export interface TransitioningBehaviour extends Behaviour.AlloyBehaviour<TransitioningConfigSpec, TransitioningConfig> {
  config: (config: TransitioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<TransitioningConfigSpec, TransitioningConfig>;
  findRoute?: <T>(comp: AlloyComponent, route: TransitionRoute) => Option<T>;
  disableTransition?: (comp: AlloyComponent) => void;
  getCurrentRoute?: any;
  jumpTo?: (comp: AlloyComponent, destination: string) => void;
  progressTo?: (comp: AlloyComponent, destination: string) => void;
  getState?: any;
  createRoutes?: (route: TransitionRoute, transitions: TransitionPropertiesSpec) => TransitioningConfigSpec['routes'];
  createBistate?: (first: string, second: string, transitions: TransitionPropertiesSpec) => TransitioningConfigSpec['routes'];
  createTristate?: (first: string, second: string, third: string, transitions: TransitionPropertiesSpec) => TransitioningConfigSpec['routes']
}

export interface TransitioningConfig extends Behaviour.BehaviourConfigDetail {
  destinationAttr: string;
  stateAttr: string;
  initialState: string;
  routes: Record<string, Record<string, TransitionProperties>>;
  onTransition: (comp: AlloyComponent, route: TransitionRoute) => void;
  onFinish: (comp: AlloyComponent, destination: string) => void;
}

export interface TransitioningConfigSpec extends Behaviour.BehaviourConfigSpec {
  destinationAttr?: string;
  stateAttr?: string;
  initialState: string;
  routes: Record<string, Record<string, TransitionPropertiesSpec>>;
  onTransition?: (comp: AlloyComponent, route: TransitionRoute) => void;
  onFinish?: (comp: AlloyComponent, destination: string) => void;
}
export interface TransitionProperties {
  transition: Option<{
    property: string;
    transitionClass: string;
  }>;
}

export interface TransitionPropertiesSpec {
  transition?: {
    property: string;
    transitionClass: string;
  }
}

export type TransitioningInitialState = 'before' | 'current' | 'after';
