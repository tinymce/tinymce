import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../common/BehaviourState';

export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour<SandboxingConfigSpec, SandboxingConfig> {
  config: (config: SandboxingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SandboxingConfigSpec, SandboxingConfig>;
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: AlloySpec) => AlloyComponent;
  openWhileCloaked: (sandbox: AlloyComponent, thing: AlloySpec, transaction: () => void) => AlloyComponent;
  close: (sandbox: AlloyComponent) => void;
  isOpen: (sandbox: AlloyComponent) => boolean;
  isPartOf: (sandbox: AlloyComponent, candidate: () => Element) => boolean;
  getState: (sandbox: AlloyComponent) => Option<AlloyComponent>;
  setContent: (sandbox: AlloyComponent, thing: AlloySpec) => Option<AlloyComponent>;
  closeSandbox: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfigSpec extends Behaviour.BehaviourConfigSpec {
  getAttachPoint: (sandbox: AlloyComponent) => AlloyComponent;
  isPartOf: (sandbox: AlloyComponent, data: AlloyComponent, queryElem: Element) => boolean;
  onOpen?: (sandbox: AlloyComponent, menu: AlloyComponent) => void;
  onClose?: (sandbox: AlloyComponent, menu: AlloyComponent) => void;
  cloakVisibilityAttr?: string;
}

export interface SandboxingConfig extends Behaviour.BehaviourConfigDetail {
  cloakVisibilityAttr: string;
  getAttachPoint: (sandbox: AlloyComponent) => AlloyComponent;
  onOpen: (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  onClose: (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  isPartOf: (sandbox: AlloyComponent, data: AlloyComponent, queryElem: Element) => boolean;
}

export interface SandboxingState extends BehaviourState {
  get: () => Option<AlloyComponent>;
  set: (comp: AlloyComponent) => void;
  isOpen: () => boolean;
  clear: () => void;
}
