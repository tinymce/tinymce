import AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import SandboxApis from './SandboxApis';

var events = function (sandboxConfig, sandboxState) {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.sandboxClose(), function (sandbox, simulatedEvent) {
      SandboxApis.close(sandbox, sandboxConfig, sandboxState);
    })
  ]);
};

export default <any> {
  events: events
};