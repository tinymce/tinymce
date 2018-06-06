import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface ReplacingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ReplacingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  append: (compontent: AlloyComponent, replaceConfig: {}) => void;
  prepend: (compontent: AlloyComponent, replaceConfig: {}) => void;
  remove: (compontent: AlloyComponent, replaceConfig: {}) => void;
  set: (compontent: AlloyComponent, replaceConfig: {}) => void;
  contents: (compontent: AlloyComponent, replaceConfig?: {}) => AlloyComponent[];
}

export interface ReplacingConfigSpec { };

export interface ReplacingConfig {
  // Intentionally Blank
}