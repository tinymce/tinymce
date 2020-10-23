import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as SandboxApis from './SandboxApis';
import { SandboxingConfig, SandboxingState } from './SandboxingTypes';

const events = (sandboxConfig: SandboxingConfig, sandboxState: SandboxingState): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
  AlloyEvents.run(SystemEvents.sandboxClose(), (sandbox, _simulatedEvent) => {
    SandboxApis.close(sandbox, sandboxConfig, sandboxState);
  })
]);

export {
  events
};
