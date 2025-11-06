import type { Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type * as Behaviour from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { AlloySpec } from '../../api/component/SpecTypes';
import type { BehaviourState } from '../common/BehaviourState';

export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour<SandboxingConfigSpec, SandboxingConfig> {
  config: (config: SandboxingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SandboxingConfigSpec, SandboxingConfig>;
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: AlloySpec) => AlloyComponent;
  openWhileCloaked: (sandbox: AlloyComponent, thing: AlloySpec, transaction: () => void) => AlloyComponent;
  close: (sandbox: AlloyComponent) => void;
  isOpen: (sandbox: AlloyComponent) => boolean;
  isPartOf: (sandbox: AlloyComponent, candidate: SugarElement<Node>) => boolean;
  getState: (sandbox: AlloyComponent) => Optional<AlloyComponent>;
  setContent: (sandbox: AlloyComponent, thing: AlloySpec) => Optional<AlloyComponent>;
  closeSandbox: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfigSpec extends Behaviour.BehaviourConfigSpec {
  getAttachPoint: (sandbox: AlloyComponent) => AlloyComponent;
  isPartOf: (sandbox: AlloyComponent, data: AlloyComponent, queryElem: SugarElement<Node>) => boolean;
  onOpen?: (sandbox: AlloyComponent, menu: AlloyComponent) => void;
  onClose?: (sandbox: AlloyComponent, menu: AlloyComponent) => void;
  cloakVisibilityAttr?: string;
}

export interface SandboxingConfig extends Behaviour.BehaviourConfigDetail {
  cloakVisibilityAttr: string;
  getAttachPoint: (sandbox: AlloyComponent) => AlloyComponent;
  onOpen: (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  onClose: (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  isPartOf: (sandbox: AlloyComponent, data: AlloyComponent, queryElem: SugarElement<Node>) => boolean;
}

export interface SandboxingState extends BehaviourState {
  get: () => Optional<AlloyComponent>;
  set: (comp: AlloyComponent) => void;
  isOpen: () => boolean;
  clear: () => void;
}
