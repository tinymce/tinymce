import * as Behaviour from "../../api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from "../../api/component/ComponentApi";
import { SugarElement } from "../../alien/TypeDefinitions";
import { Bounds } from "ephox/alloy/alien/Boxes";

export interface DockingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: DockingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}


export interface DockingContext {
  fadeInClass: () => string;
  fadeOutClass: () => string;
  transitionClass: () => string;
  lazyContext: () => (component: AlloyComponent) => Option<SugarElement>;
}

export interface DockingConfig {
  contextual: () => Option<DockingContext>;
  lazyViewport: () => (component?: AlloyComponent) => Bounds;
  leftAttr: () => string;
  topAttr: () => string;
}

export interface DockingConfigSpec {
  contextual?: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Option<SugarElement>;
  };
  lazyViewport?: (component?: AlloyComponent) => Bounds;
  leftAttr: string;
  topAttr: string;
}
