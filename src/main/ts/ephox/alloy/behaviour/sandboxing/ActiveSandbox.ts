import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as SandboxApis from './SandboxApis';
import { SandboxingConfig, SandboxingState } from 'ephox/alloy/behaviour/sandboxing/SandboxingTypes';

const events = function (sandboxConfig: SandboxingConfig, sandboxState: SandboxingState): AlloyEvents.EventHandlerConfigRecord {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.sandboxClose(), function (sandbox, simulatedEvent) {
      SandboxApis.close(sandbox, sandboxConfig, sandboxState);
    })
  ]);
};

export default <any> {
  events
};