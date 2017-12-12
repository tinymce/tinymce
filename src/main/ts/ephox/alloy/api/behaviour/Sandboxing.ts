import Behaviour from './Behaviour';
import ActiveSandbox from '../../behaviour/sandboxing/ActiveSandbox';
import SandboxApis from '../../behaviour/sandboxing/SandboxApis';
import SandboxSchema from '../../behaviour/sandboxing/SandboxSchema';
import SandboxState from '../../behaviour/sandboxing/SandboxState';



export default <any> Behaviour.create({
  fields: SandboxSchema,
  name: 'sandboxing',
  active: ActiveSandbox,
  apis: SandboxApis,
  state: SandboxState
});