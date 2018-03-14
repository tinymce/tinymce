import * as Behaviour from './Behaviour';
import ActiveSandbox from '../../behaviour/sandboxing/ActiveSandbox';
import * as SandboxApis from '../../behaviour/sandboxing/SandboxApis';
import SandboxSchema from '../../behaviour/sandboxing/SandboxSchema';
import * as SandboxState from '../../behaviour/sandboxing/SandboxState';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SketchSpec } from 'ephox/alloy/api/ui/Sketcher';

export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour {
  config: (SandboxingConfig) => { key: string, value: any };
  cloak?: (sandbox: AlloyComponent) => void;
  decloak?: (sandbox: AlloyComponent) => void;
  open?: (sandbox: AlloyComponent, thing: SketchSpec) => AlloyComponent;
  close?: (sandbox: AlloyComponent) => void;
  isOpen?: (sandbox: AlloyComponent) => boolean;
  isPartOf?: (sandbox: AlloyComponent, candidate: () => SugarElement) => boolean;
  getState?: (sandbox: AlloyComponent) => Option<AlloyComponent>;
  closeSandbox?: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfig extends Behaviour.AlloyBehaviourConfig {
  getAttachPoint: () => AlloyComponent;
  onOpen: () => any;
  onClose: () => any;
  isPartOf: () => boolean;
}

const Sandboxing: SandboxingBehaviour = Behaviour.create({
  fields: SandboxSchema,
  name: 'sandboxing',
  active: ActiveSandbox,
  apis: SandboxApis,
  state: SandboxState
});

export {
  Sandboxing
};