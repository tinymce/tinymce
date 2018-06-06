import  * as Behaviour from "ephox/alloy/api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from "ephox/alloy/api/component/ComponentApi";
import { Stateless } from "ephox/alloy/behaviour/common/NoState";

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