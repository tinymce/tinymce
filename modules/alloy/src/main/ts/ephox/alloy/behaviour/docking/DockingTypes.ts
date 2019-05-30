import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Element } from '@ephox/sugar';
import { Bounds } from '../../alien/Boxes';

export interface DockingBehaviour extends Behaviour.AlloyBehaviour<DockingConfigSpec, DockingConfig> {
  config: (config: DockingConfigSpec) => Behaviour.NamedConfiguredBehaviour<DockingConfigSpec, DockingConfig>;
  refresh: (component: AlloyComponent) => void;
}

export interface DockingContext {
  fadeInClass: string;
  fadeOutClass: string;
  transitionClass: string;
  lazyContext: (component: AlloyComponent) => Option<Element>;
}

export interface DockingConfig extends Behaviour.BehaviourConfigDetail {
  contextual: Option<DockingContext>;
  lazyViewport: (component?: AlloyComponent) => Bounds;
  leftAttr: string;
  topAttr: string;
}

export interface DockingConfigSpec extends Behaviour.BehaviourConfigSpec {
  contextual?: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Option<Element>;
  };
  lazyViewport?: (component?: AlloyComponent) => Bounds;
  leftAttr: string;
  topAttr: string;
}
