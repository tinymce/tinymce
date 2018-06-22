import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface ComposingBehaviour extends Behaviour.AlloyBehaviour<ComposingConfigSpec, ComposingConfig> {
  config: (config: ComposingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ComposingConfigSpec, ComposingConfig>;
  getCurrent: (sandbox: AlloyComponent) => Option<AlloyComponent>;
}

export interface ComposingConfigSpec extends BehaviourConfigSpec {
  find: (comp: AlloyComponent) => Option<AlloyComponent>;
}

export interface ComposingConfig extends BehaviourConfigDetail {
  find: () => (comp: AlloyComponent) => Option<AlloyComponent>;
}