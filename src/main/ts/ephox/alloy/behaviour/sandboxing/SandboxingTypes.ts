import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SandboxingConfig) => Behaviour.NamedConfiguredBehaviour;
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: AlloySpec) => AlloyComponent;
  close: (sandbox: AlloyComponent) => void;
  isOpen: (sandbox: AlloyComponent) => boolean;
  isPartOf: (sandbox: AlloyComponent, candidate: () => SugarElement) => boolean;
  getState: (sandbox: AlloyComponent) => Option<AlloyComponent>;
  closeSandbox: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfig {
  getAttachPoint: () => AlloyComponent;
  isPartOf: (container: AlloyComponent, data: AlloyComponent, queryElem: SugarElement) => boolean;
  onOpen?: (component: AlloyComponent, menu: AlloyComponent) => void;
  onClose?: (component: AlloyComponent, menu: AlloyComponent) => void;
  cloakVisibilityAttr?: string;
}