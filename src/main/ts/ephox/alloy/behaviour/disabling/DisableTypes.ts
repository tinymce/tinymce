import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../../behaviour/common/BehaviourState';

export interface DisableBehaviour extends Behaviour.AlloyBehaviour<DisableConfigSpec, DisableConfig> {
  config: (config: DisableConfigSpec) =>  Behaviour.NamedConfiguredBehaviour<DisableConfigSpec, DisableConfig>;
  enable: (component: AlloyComponent, disableConfig?: DisableConfig, disableState?: Stateless) => void;
  disable: (component: AlloyComponent, disableConfig?: DisableConfig, disableState?: Stateless) => void;
  isDisabled: (component: AlloyComponent) => boolean;
  onLoad: (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless) => void;
}

export interface DisableConfig extends Behaviour.BehaviourConfigDetail {
  disabled: () => boolean;
  disableClass: () => Option<string>;
}

export interface DisableConfigSpec extends BehaviourConfigSpec {
  disabled?: boolean;
  disableClass?: string;
}