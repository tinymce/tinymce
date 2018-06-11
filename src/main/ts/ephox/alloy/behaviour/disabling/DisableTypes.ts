import  * as Behaviour from "../../api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from "../../api/component/ComponentApi";
import { Stateless } from "../../behaviour/common/NoState";

export interface DisableBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: DisableConfigSpec) =>  Behaviour.NamedConfiguredBehaviour;
  enable: (component: AlloyComponent, disableConfig?: DisableConfig, disableState?: Stateless) => void;
  disable: (component: AlloyComponent, disableConfig?: DisableConfig, disableState?: Stateless) => void;
  isDisabled: (component: AlloyComponent) => boolean;
  onLoad: (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless) => void;
}

export interface DisableConfig {
  disabled: () => boolean;
  disableClass: () => Option<string>;
}

export interface DisableConfigSpec {
  disabled?: boolean;
  disableClass?: string;
}