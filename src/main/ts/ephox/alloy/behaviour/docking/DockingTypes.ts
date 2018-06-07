import * as Behaviour from "../../api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from "../../api/component/ComponentApi";
import { SugarElement } from "../../alien/TypeDefinitions";

export interface DockingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: DockingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}

export interface ViewportBox {
  x: () => number;
  y: () => number;
  bottom?: () => number;
  top?: () => number;
  width?: () => number;
  height?: () => number;
}

export interface DockingContext {
  fadeInClass: () => string;
  fadeOutClass: () => string;
  transitionClass: () => string;
  lazyContext: () => (component: AlloyComponent) => Option<SugarElement>;
}

export interface DockingConfig {
  contextual: () => Option<DockingContext>;
  lazyViewport: () => (component?: AlloyComponent) => ViewportBox;
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
  lazyViewport?: (component?: AlloyComponent) => ViewportBox;
  leftAttr: string;
  topAttr: string;
}
