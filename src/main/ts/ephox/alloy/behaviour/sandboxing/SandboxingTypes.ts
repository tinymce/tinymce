import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloySpec } from '../../api/component/SpecTypes';


export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SandboxingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: AlloySpec) => AlloyComponent;
  close: (sandbox: AlloyComponent) => void;
  isOpen: (sandbox: AlloyComponent) => boolean;
  isPartOf: (sandbox: AlloyComponent, candidate: () => SugarElement) => boolean;
  getState: (sandbox: AlloyComponent) => Option<AlloyComponent>;
  closeSandbox: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfigSpec {
  getAttachPoint: () => AlloyComponent;
  isPartOf: (container: AlloyComponent, data: AlloyComponent, queryElem: SugarElement) => boolean;
  onOpen?: (component: AlloyComponent, menu: AlloyComponent) => void;
  onClose?: (component: AlloyComponent, menu: AlloyComponent) => void;
  cloakVisibilityAttr?: string;
}

export interface SandboxingConfig {
  cloakVisibilityAttr: () => string;
  getAttachPoint: () => () => AlloyComponent;
  onOpen: () => (AlloyComponent, SandboxingState) => void;
  onClose: () => (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  isPartOf: () => (container: AlloyComponent, data: AlloyComponent, queryElem: SugarElement) => boolean;
};

export interface SandboxingState {
  get: () => Option<AlloyComponent>;
  set: (AlloyComponent) => void;
  isOpen: () => boolean;
  clear: () => boolean;
};