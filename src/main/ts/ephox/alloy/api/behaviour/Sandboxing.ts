import * as Behaviour from './Behaviour';
import ActiveSandbox from '../../behaviour/sandboxing/ActiveSandbox';
import * as SandboxApis from '../../behaviour/sandboxing/SandboxApis';
import SandboxSchema from '../../behaviour/sandboxing/SandboxSchema';
import * as SandboxState from '../../behaviour/sandboxing/SandboxState';
import { SugarElement } from '../../alien/TypeDefinitions';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { SandboxingBehaviour } from '../../behaviour/sandboxing/SandboxingTypes';


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