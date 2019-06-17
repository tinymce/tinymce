import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as SandboxApis from './SandboxApis';
import { SandboxingConfig, SandboxingState } from '../../behaviour/sandboxing/SandboxingTypes';

const events = (sandboxConfig: SandboxingConfig, sandboxState: SandboxingState): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.sandboxClose(), (sandbox, simulatedEvent) => {
      SandboxApis.close(sandbox, sandboxConfig, sandboxState);
    })
  ]);
};

export {
  events
};