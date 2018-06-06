import * as Behaviour from '../../api/behaviour/Behaviour';
import * as ComposeApis from './ComposeApis';
import { ComposeSchema } from './ComposeSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';

export interface ComposingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ComposingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  getCurrent: (sandbox: AlloyComponent) => Option<AlloyComponent>;
}

export interface ComposingConfigSpec {
  find: (comp: AlloyComponent) => Option<AlloyComponent>;
}

export interface ComposingConfig {
  find: () => (comp: AlloyComponent) => Option<AlloyComponent>;
}