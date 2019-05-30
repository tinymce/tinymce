import * as Behaviour from './Behaviour';
import * as ActiveSandbox from '../../behaviour/sandboxing/ActiveSandbox';
import * as SandboxApis from '../../behaviour/sandboxing/SandboxApis';
import SandboxSchema from '../../behaviour/sandboxing/SandboxSchema';
import * as SandboxState from '../../behaviour/sandboxing/SandboxState';
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