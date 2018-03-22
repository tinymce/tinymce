import * as Behaviour from './Behaviour';
import ActiveSandbox from '../../behaviour/sandboxing/ActiveSandbox';
import * as SandboxApis from '../../behaviour/sandboxing/SandboxApis';
import SandboxSchema from '../../behaviour/sandboxing/SandboxSchema';
import * as SandboxState from '../../behaviour/sandboxing/SandboxState';
import { SugarElement } from '../../alien/TypeDefinitions';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchSpec } from '../../api/ui/Sketcher';

export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SandboxingConfig) => { [key: string]: (any) => any };
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: SketchSpec) => AlloyComponent;
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

const Sandboxing = Behaviour.create({
  fields: SandboxSchema,
  name: 'sandboxing',
  active: ActiveSandbox,
  apis: SandboxApis,
  state: SandboxState
}) as SandboxingBehaviour;

export {
  Sandboxing
};