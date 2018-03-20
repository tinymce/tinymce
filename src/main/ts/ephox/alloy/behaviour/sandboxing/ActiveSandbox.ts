import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as SandboxApis from './SandboxApis';

const events = function (sandboxConfig, sandboxState) {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.sandboxClose(), function (sandbox, simulatedEvent) {
      SandboxApis.close(sandbox, sandboxConfig, sandboxState);
    })
  ]);
};

export default <any> {
  events
};