import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { AlloySpec } from '../../api/component/SpecTypes';


export interface ReplacingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ReplacingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  append: (component: AlloyComponent, appendee: AlloySpec) => void;
  prepend: (component: AlloyComponent, prependee: AlloySpec) => void;
  remove: (component: AlloyComponent, removee: AlloyComponent) => void;
  set: (component: AlloyComponent, data: AlloySpec[]) => void;
  contents: (component: AlloyComponent) => AlloyComponent[];
}

export interface ReplacingConfigSpec { };

export interface ReplacingConfig {
  // Intentionally Blank
}