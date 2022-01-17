import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';

export interface ReplacingBehaviour extends Behaviour.AlloyBehaviour<ReplacingConfigSpec, ReplacingConfig> {
  config: (config: ReplacingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReplacingConfigSpec, ReplacingConfig>;
  append: (component: AlloyComponent, appendee: AlloySpec) => void;
  prepend: (component: AlloyComponent, prependee: AlloySpec) => void;
  remove: (component: AlloyComponent, removee: AlloyComponent) => void;
  replaceAt: (component: AlloyComponent, replaceeIndex: number, replacer: Optional<AlloySpec>) => Optional<AlloyComponent>;
  replaceBy: (component: AlloyComponent, replaceePred: (comp: AlloyComponent) => boolean, replacer: Optional<AlloySpec>) => Optional<AlloyComponent>;
  set: (component: AlloyComponent, data: AlloySpec[]) => void;
  contents: (component: AlloyComponent) => AlloyComponent[];
}

export interface ReplacingConfigSpec extends Behaviour.BehaviourConfigSpec {
  reuseDom?: boolean;
}

export interface ReplacingConfig extends Behaviour.BehaviourConfigDetail {
  reuseDom: boolean;
}
