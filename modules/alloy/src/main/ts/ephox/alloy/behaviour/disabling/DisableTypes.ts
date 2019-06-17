import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface DisableBehaviour extends Behaviour.AlloyBehaviour<DisableConfigSpec, DisableConfig> {
  config: (config: DisableConfigSpec) => Behaviour.NamedConfiguredBehaviour<DisableConfigSpec, DisableConfig>;
  enable: (component: AlloyComponent) => void;
  disable: (component: AlloyComponent) => void;
  isDisabled: (component: AlloyComponent) => boolean;
  onLoad: (component: AlloyComponent) => void;
  set: (component: AlloyComponent, disabled: boolean) => void;
}

export interface DisableConfig extends Behaviour.BehaviourConfigDetail {
  disabled: boolean;
  disableClass: Option<string>;
}

export interface DisableConfigSpec extends Behaviour.BehaviourConfigSpec {
  disabled?: boolean;
  disableClass?: string;
}