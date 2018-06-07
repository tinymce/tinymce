import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as Behaviour from '../common/Behaviour';
import * as RepresentApis from './RepresentApis';
import { RepresentingConfig, RepresentingState } from 'ephox/alloy/behaviour/representing/RepresentingTypes';
import { EventFormat } from '../../events/SimulatedEvent';

const events = function (repConfig: RepresentingConfig, repState: RepresentingState): AlloyEvents.EventHandlerConfigRecord {
  const es = repConfig.resetOnDom() ? [
    AlloyEvents.runOnAttached(function (comp, se) {
      RepresentApis.onLoad(comp, repConfig, repState);
    }),
    AlloyEvents.runOnDetached(function (comp, se) {
      RepresentApis.onUnload(comp, repConfig, repState);
    })
  ] : [
    Behaviour.loadEvent(repConfig, repState, RepresentApis.onLoad)
  ];

  return AlloyEvents.derive(es);
};

export {
  events
};